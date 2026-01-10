// backend/src/sockets/gameSocket.ts
import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user";
import { Match } from "../models/match";
import { Season } from "../models/season";
import { lockFundsForMatch } from "../services/gameFundsService";
import { settleMatch } from "../services/gamePayoutService";

interface PlayerData {
  id: string;
  username: string;
}
type Move = "rock" | "paper" | "scissors";

interface GameRoom {
  players: string[]; 
  moves: Record<string, Move | null>;
  scores: Record<string, number>;
  rounds: number;
  isActive: boolean;
  readyCount: number;     
  roundReadyCount: number; 
  isRanked: boolean, 
  wallets: Record<string, string>;
  stake: number;
}
type QueuedPlayer = {
  playerId: string;
  walletId: string;
};

export const setupGameSocket = (io: Server) => {
  const rooms = new Map<string, GameRoom>();
  const waitingPlayersByStake = new Map<number, QueuedPlayer[]>();


const ALLOWED_STAKES = [
 0.00045 ,0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4,
];
for (const stake of ALLOWED_STAKES) {
  waitingPlayersByStake.set(stake, []);
}

  const roundTimers = new Map<string, NodeJS.Timeout>();
 
  

  const socketsByPlayer = new Map<string, string>(); // playerId -> socketId
 const saveMatch = async (room: GameRoom, winnerId: string | null) => {
  try {
    // Obtener temporada activa
    const currentSeason = await Season.findOne({ isActive: true }).sort({ startDate: -1 });
    const seasonId = currentSeason ? currentSeason._id : null;

    const [p1, p2] = room.players;

    await Match.create({
      player1: p1,
      player2: p2,
      winner: winnerId,
      score: {
        p1: room.scores[p1] ?? 0,
        p2: room.scores[p2] ?? 0,
      },
      isRanked: room.isRanked,
      seasonId: seasonId, // ⭐ NUEVO
      mode: room.isRanked ? "ranked" : "private", // ⭐ NUEVO
      stake: room.stake,
    });

    console.log("✅ Partida guardada en DB con temporada y modo");
  } catch (err) {
    console.error("❌ Error al guardar partida:", err);
  }
};

  io.on("connection", (socket: Socket) => {
    console.log("🎮 Conectado:", socket.id);

    // El frontend debe emitir esto al montar el lobby
    socket.on("game:register", ({ playerId }: { playerId: string }) => {
      if (!playerId) return;
      socketsByPlayer.set(playerId, socket.id);
      socket.data.playerId = playerId;
    });

    // ✅ Crear partida privada
    socket.on("game:create", ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      rooms.set(roomId, {
        players: [playerId],
        moves: {},
        scores: { [playerId]: 0 },
        rounds: 0,
        readyCount: 0,
        roundReadyCount: 0,
        isActive: false,
        isRanked: false, 
        stake: 0,
        wallets: {},
      });
      socket.join(roomId);
      console.log(`🆕 Sala privada creada: ${roomId} por ${playerId}`);
      
      io.to(roomId).emit("game:waiting", {
        roomId,
        createdBy: playerId,
      });

    });

    // ✅ Unirse a partida privada
    socket.on("game:join", async ({ roomId, playerId }: { roomId: string; playerId: string }) => {

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("game:error", { message: "Sala no encontrada" });
        return;
      }
      if (room.players.length >= 2) {
        socket.emit("game:error", { message: "Sala llena" });
        return;
      }

      room.players.push(playerId);
      room.scores[playerId] = 0;
      room.isActive = true;
      room.moves = { [room.players[0]]: null, [room.players[1]]: null };
      rooms.set(roomId, room);

      socket.join(roomId);

// 🧠 Obtener usernames desde la base de datos
      const users = await User.find({ _id: { $in: room.players } }).select("username");
      const playersData: PlayerData[] = users.map((u) => ({
        id: String(u._id),
        username: u.username || "Desconocido",
      }));
      io.to(roomId).emit("game:privateReady", {
        roomId,
        players: playersData,
      });


      io.to(roomId).emit("game:start", { roomId, players: playersData });
      console.log(`👥 ${playerId} se unió a la sala ${roomId}`);
      
    });

    // 🔥 INVITAR AMIGO A UNA SALA PRIVADA
    socket.on("friend:inviteToRoom", async ({ roomId, fromUserId, toUserId }) => {
      const room = rooms.get(roomId);

      if (!room) {
        const fromSocket = socketsByPlayer.get(fromUserId);
        if (fromSocket) {
          io.to(fromSocket).emit("game:error", {
            message: "Room not found",
          });
        }
        return;
      }

      // Verificar si el amigo está conectado
      const targetSocketId = socketsByPlayer.get(toUserId);
      if (!targetSocketId) {
        const fromSocket = socketsByPlayer.get(fromUserId);
        if (fromSocket) {
          io.to(fromSocket).emit("game:error", {
            message: "This friend is offline",
          });
        }
        return;
      }

      // Obtener datos para mostrar
      const fromUser = await User.findById(fromUserId).select("username avatar");

      // 🔔 Enviar notificación al amigo invitado
      io.to(targetSocketId).emit("friend:inviteNotification", {
        roomId,
        fromUserId,
        fromUsername: fromUser?.username,
        fromAvatar: fromUser?.avatar || "/uploads/default-avatar.jpg",
      });
    });

    // ❌ Cancelar sala privada (antes de que empiece)
    socket.on("game:cancelPrivate", ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // solo el creador y si aún no está activa
      if (room.players[0] !== playerId || room.isActive) return;

      rooms.delete(roomId);
      console.log(`🧹 Sala privada ${roomId} cancelada por el creador ${playerId}`);

      io.to(roomId).emit("game:roomCancelled", { roomId });
    });

    // ✅ Matchmaking público
    socket.on(
  "game:queue",
  async ({
    playerId,
    walletId,
    stake,
  }: {
    playerId: string;
    walletId: string;
    stake: number;
  }) => {
    if (!playerId) return;

    console.log(`⏳ ${playerId} buscando partida...`);

    if (!ALLOWED_STAKES.includes(stake)) {
      socket.emit("game:error", { message: "Invalid stake" });
      return;
    }

    // Guardamos por si todavía no se registró
    socketsByPlayer.set(playerId, socket.id);
    socket.data.playerId = playerId;

    const queue = waitingPlayersByStake.get(stake)!;

    // ✅ Si ya hay alguien esperando, emparejamos
    if (queue.length > 0) {
      const opponent = queue.shift()!;

      const p1 = opponent.playerId;
      const p2 = playerId;

      const w1 = opponent.walletId;
      const w2 = walletId;

      const roomId = uuidv4();

      const room: GameRoom = {
        players: [p1, p2],
        wallets: {
          [p1]: w1,
          [p2]: w2,
        },
        moves: { [p1]: null, [p2]: null },
        scores: { [p1]: 0, [p2]: 0 },
        rounds: 0,
        isActive: true,
        readyCount: 0,
        roundReadyCount: 0,
        isRanked: true,
        stake,
      };

      rooms.set(roomId, room);

      // 💰 Bloquear fondos de ambos
      const s1Id = socketsByPlayer.get(p1);
      const s2Id = socketsByPlayer.get(p2);

      try {
        await lockFundsForMatch(w1, stake);
        await lockFundsForMatch(w2, stake);
      } catch (err) {
        console.error("❌ Error locking funds:", err);
        
        if (s1Id) io.to(s1Id).emit("game:error", { message: "Insufficient funds" });
        if (s2Id) io.to(s2Id).emit("game:error", { message: "Insufficient funds" });

        rooms.delete(roomId);
        return;
      }

      // Join sockets a room
      if (s1Id) io.sockets.sockets.get(s1Id)?.join(roomId);
      if (s2Id) io.sockets.sockets.get(s2Id)?.join(roomId);

      // usernames
      const users = await User.find({ _id: { $in: [p1, p2] } }).select("username");
      const playersData: PlayerData[] = users.map((u) => ({
        id: String(u._id),
        username: u.username || "Desconocido",
      }));

      io.to(roomId).emit("game:start", { roomId, players: playersData });

      console.log(`⚔️ Partida creada: ${roomId} (${p1} vs ${p2})`);
    } else {
      // ✅ Si no hay nadie, se queda esperando con SU walletId
      queue.push({ playerId, walletId });
      console.log(`🪑 ${playerId} en cola (${queue.length})`);
    }
  }
);


    // ❌ Cancelar búsqueda
    socket.on("game:cancelQueue", ({ playerId }: { playerId: string }) => {
  for (const [, queue] of waitingPlayersByStake) {
    const idx = queue.findIndex((q) => q.playerId === playerId);
    if (idx !== -1) {
      queue.splice(idx, 1);
      break;
    }
  }
});

    // 🟦 Un jugador confirma que su UI ya cargó
    socket.on("game:ready", ({ roomId }) => {
  const room = rooms.get(roomId);
  if (!room) return;

  room.readyCount = (room.readyCount || 0) + 1;

  if (room.readyCount === 2) {
    console.log("⏱️ Ambos jugadores listos → iniciando ronda 1");

    // 🔥 AVISAMOS AL FRONTEND
    io.to(roomId).emit("game:roundStart");

    // 🔥 ARRANCA TIMER SERVER-SIDE
    startRoundTimer(roomId);
  }

  rooms.set(roomId, room);
});

    // 🟦 Un jugador confirma que su UI terminó de mostrar la animación de resultado
    socket.on("game:roundReady", ({ roomId, playerId }) => {
      const room = rooms.get(roomId);
      if (!room || !room.isActive) return;

      room.roundReadyCount = (room.roundReadyCount || 0) + 1;

      // Si ambos jugadores están listos → inicia la nueva ronda
      if (room.roundReadyCount === 2) {

        // Reiniciar contador para la próxima ronda
        room.roundReadyCount = 0;

        // Avisar a ambos clientes que comienza oficialmente la ronda
        io.to(roomId).emit("game:roundStart");

        // Iniciar timer de 10s
        startRoundTimer(roomId);
      }

      rooms.set(roomId, room);
    });

    // ✅ Movimiento del jugador
   // ✅ Movimiento del jugador (SOLO guardar, NO resolver)
socket.on("game:move", ({ roomId, playerId, move }: { roomId: string; playerId: string; move: Move }) => {
  const room = rooms.get(roomId);
  if (!room || !room.isActive) return;

  room.moves[playerId] = move;
  rooms.set(roomId, room);

  // (opcional) confirmación al cliente
  socket.emit("game:moveAck", { ok: true });
});



    socket.on("disconnect", () => {
      const playerId = socket.data.playerId as string | undefined;
      if (playerId) socketsByPlayer.delete(playerId);
      for (const [, queue] of waitingPlayersByStake) {
        const i = queue.findIndex((q) => q.playerId === playerId);
        if (i !== -1) {
          queue.splice(i, 1);
          break;
        }
      }


      console.log(`🔴 Desconectado: ${socket.id} (${playerId || "sin registrar"})`);

      if (playerId) {
        for (const [roomId, room] of rooms.entries()) {
          if (!room.isActive && room.players[0] === playerId && !room.isRanked) {
            rooms.delete(roomId);
            io.to(roomId).emit("game:roomCancelled", { roomId });
            console.log(`🧹 Sala privada ${roomId} eliminada por disconnect de su creador`);
          }
        }
      }
    });
  });
  function startRoundTimer(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || !room.isActive) return;

  // si ya había un timer previo, lo cancelamos
  if (roundTimers.has(roomId)) {
    clearTimeout(roundTimers.get(roomId)!);
    
  }

  const timer = setTimeout(async () => {
    const [p1, p2] = room.players;
    const m1 = room.moves[p1];
    const m2 = room.moves[p2];
    // ✅ CASO 0: ambos jugaron → resolver normalmente
if (m1 && m2) {
  const result = getWinner(m1, m2);

  if (result === "draw") {
    io.to(roomId).emit("game:roundResult", {
      result: "draw",
      moves: {
    [p1]: m1,
    [p2]: m2,
  },
      scores: room.scores,
    });
  } else {
    const winner = result === "p1" ? p1 : p2;
    room.scores[winner]++;

    io.to(roomId).emit("game:roundResult", {
      result: "win",
      winner,
      moves: {
    [p1]: m1,
    [p2]: m2,
  },
      scores: room.scores,
    });

    if (room.scores[winner] === 3) {
      io.to(roomId).emit("game:finished", { winner });
      room.isActive = false;
      rooms.set(roomId, room);

      saveMatch(room, winner).catch((err) =>
        console.error("Error guardando partida (timer both moves):", err)
      );
      try {
  await settleMatch({
  winnerWalletId: room.wallets[winner],
  loserWalletId: room.wallets[room.players.find(p => p !== winner)!],
  stake: room.stake,

  });
} catch (err) {
  console.error("❌ Error settling match:", err);
}

      return;
    }
  }
}

    // CASO 1: ninguno jugó → empate
    if (!m1 && !m2) {
      io.to(roomId).emit("game:roundResult", {
        result: "draw",
        moves: {
    [p1]: m1,
    [p2]: m2,
  },
        scores: room.scores,
      });
    }

    // CASO 2: jugador 1 NO jugó → gana p2
    else if (!m1 && m2) {
      room.scores[p2]++;
      io.to(roomId).emit("game:roundResult", {
        result: "win",
        winner: p2,
        moves: {
    [p1]: m1,
    [p2]: m2,
  },
        scores: room.scores,
      });
    }

    // CASO 3: jugador 2 NO jugó → gana p1
    else if (!m2 && m1) {
      room.scores[p1]++;
      io.to(roomId).emit("game:roundResult", {
        result: "win",
        winner: p1,
        moves: {
    [p1]: m1,
    [p2]: m2,
  },
        scores: room.scores,
      });
    }

    // revisar si alguien llegó a 3 puntos
    const winner =
      room.players.find((p) => room.scores[p] === 3) || null;

    if (winner) {
      io.to(roomId).emit("game:finished", { winner });
      room.isActive = false;
      rooms.set(roomId, room);
      // 🧾 Guardar partida también si alguien llegó a 3 por timeout
      saveMatch(room, winner).catch((err) =>
        console.error("Error guardando partida (timer):", err)
      );
      try {
  await settleMatch({
    winnerWalletId: winner,
    loserWalletId: room.players.find(p => p !== winner)!,
    stake: room.stake,

  });
} catch (err) {
  console.error("❌ Error settling match (timeout):", err);
}

      return;
    }

    // reset movimientos para la próxima ronda
    room.moves = { [p1]: null, [p2]: null };
    rooms.set(roomId, room);

    // ⛔ NO iniciar la siguiente ronda aquí
    // ⛔ esperar game:roundReady
   

  }, 10000); // 10 segundos

  roundTimers.set(roomId, timer);
}

};

function getWinner(m1: Move, m2: Move): "p1" | "p2" | "draw" {
  if (m1 === m2) return "draw";
  if (
    (m1 === "rock" && m2 === "scissors") ||
    (m1 === "paper" && m2 === "rock") ||
    (m1 === "scissors" && m2 === "paper")
  ) return "p1";
  return "p2";
}
