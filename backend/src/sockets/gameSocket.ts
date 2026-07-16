// backend/src/sockets/gameSocket.ts
import { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/user";
import { Wallet } from "../models/wallet";
import { Match } from "../models/match";
import { Season } from "../models/season";
import { lockFundsForBothPlayers } from "../services/gameFundsService";
import { settleMatch } from "../services/gamePayoutService";

interface PlayerData {
  id: string;
  username: string;
}
type Move = "rock" | "paper" | "scissors";

const MOVES: readonly Move[] = ["rock", "paper", "scissors"];
const isMove = (value: unknown): value is Move =>
  typeof value === "string" && MOVES.includes(value as Move);

interface GameRoom {
  players: string[];
  moves: Record<string, Move | null>;
  scores: Record<string, number>;
  rounds: number;
  isActive: boolean;
  // Sets, not counters: a counter cannot tell one player pressing ready
  // twice from both players being ready.
  readyPlayers: Set<string>;
  roundReadyPlayers: Set<string>;
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
0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4,
];
for (const stake of ALLOWED_STAKES) {
  waitingPlayersByStake.set(stake, []);
}

  const roundTimers = new Map<string, NodeJS.Timeout>();
 
  

  const socketsByPlayer = new Map<string, string>();

  /**
   * A wallet id from the client is only a claim. Rejecting it here fails the
   * player fast with a clear error; lockFundsForBothPlayers re-checks
   * ownership before it decrypts anything, and that check is the real gate.
   */
  const ownsWallet = async (userId: string, walletId: string) => {
    if (!walletId || !Types.ObjectId.isValid(walletId)) return false;
    return Boolean(
      await Wallet.exists({ _id: walletId, owner: userId, archived: false })
    );
  };

 const saveMatch = async (room: GameRoom, winnerId: string | null) => {
  try {
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
      seasonId: seasonId, 
      mode: room.isRanked ? "ranked" : "private", 
      stake: room.stake,
    });

    console.log("✅ Partida guardada en DB con temporada y modo");
  } catch (err) {
    console.error("❌ Error al guardar partida:", err);
  }
};

  io.on("connection", (socket: Socket) => {
    // socketAuth (io.use) guarantees this is set and verified.
    const playerId: string = socket.data.userId;
    console.log("🎮 Conectado:", socket.id, playerId);

    socketsByPlayer.set(playerId, socket.id);

    socket.on("game:register", () => {
      // Identity comes from the handshake; the event only refreshes the
      // socket id after a reconnect.
      socketsByPlayer.set(playerId, socket.id);
    });

    socket.on(
  "game:create",
  async ({ roomId, stake, walletId }: {
    roomId: string;
    stake: number;
    walletId: string;
  }) => {
      if (!ALLOWED_STAKES.includes(stake)) {
        socket.emit("game:error", { message: "Invalid stake" });
        return;
      }

      if (rooms.has(roomId)) {
        socket.emit("game:error", { message: "Room already exists" });
        return;
      }

      if (!(await ownsWallet(playerId, walletId))) {
        socket.emit("game:error", { message: "Invalid wallet" });
        return;
      }

      rooms.set(roomId, {
      players: [playerId],
      wallets: {
        [playerId]: walletId,
      },
      stake,
      moves: {},
      scores: { [playerId]: 0 },
      rounds: 0,
      readyPlayers: new Set(),
      roundReadyPlayers: new Set(),
      isActive: false,
      isRanked: false,
    });

      socket.join(roomId);
      console.log(`🆕 Sala privada creada: ${roomId} por ${playerId}`);

      io.to(roomId).emit("game:waiting", {
        roomId,
        createdBy: playerId,
        stake,
      });

    });

    socket.on(
  "game:join",
  async ({ roomId, walletId }: {
    roomId: string;
    walletId: string;
  }) => {


      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("game:error", { message: "Sala no encontrada" });
        return;
      }
      if (room.players.length >= 2) {
        socket.emit("game:error", { message: "Sala llena" });
        return;
      }
      if (room.players.includes(playerId)) {
        socket.emit("game:error", { message: "Already in this room" });
        return;
      }
      if (!(await ownsWallet(playerId, walletId))) {
        socket.emit("game:error", { message: "Invalid wallet" });
        return;
      }

      room.players.push(playerId);
      room.scores[playerId] = 0;
      room.wallets[playerId] = walletId;

      try {
        const [p1, p2] = room.players;

        await lockFundsForBothPlayers(
          { ownerId: p1, walletId: room.wallets[p1] },
          { ownerId: p2, walletId: room.wallets[p2] },
          room.stake
        );
      } catch (err) {
        console.error("❌ Error locking funds (private match):", err);

        io.to(roomId).emit("game:error", {
          message: "Insufficient funds",
        });

        rooms.delete(roomId);
        return;
      }

      room.isActive = true;
      room.moves = { [room.players[0]]: null, [room.players[1]]: null };
      rooms.set(roomId, room);

      socket.join(roomId);

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

    socket.on("friend:inviteToRoom", async ({ roomId, toUserId }) => {
      const room = rooms.get(roomId);
      const fromUserId = playerId;

      if (!room) {
        socket.emit("game:error", { message: "Room not found" });
        return;
      }

      // Only someone actually in the room may invite to it.
      if (!room.players.includes(fromUserId)) {
        socket.emit("game:error", { message: "Not your room" });
        return;
      }

      const targetSocketId = socketsByPlayer.get(toUserId);
      if (!targetSocketId) {
        socket.emit("game:error", { message: "This friend is offline" });
        return;
      }

      const fromUser = await User.findById(fromUserId).select("username avatar");

      io.to(targetSocketId).emit("friend:inviteNotification", {
        roomId,
        fromUserId,
        fromUsername: fromUser?.username,
        fromAvatar: fromUser?.avatar || "/uploads/default-avatar.jpg",
      });
    });

    socket.on("game:cancelPrivate", ({ roomId }: { roomId: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      if (room.players[0] !== playerId || room.isActive) return;

      rooms.delete(roomId);
      console.log(`🧹 Sala privada ${roomId} cancelada por el creador ${playerId}`);

      io.to(roomId).emit("game:roomCancelled", { roomId });
    });

    socket.on(
  "game:queue",
  async ({
    walletId,
    stake,
  }: {
    walletId: string;
    stake: number;
  }) => {
    console.log(`⏳ ${playerId} buscando partida...`);

    if (!ALLOWED_STAKES.includes(stake)) {
      socket.emit("game:error", { message: "Invalid stake" });
      return;
    }

    if (!(await ownsWallet(playerId, walletId))) {
      socket.emit("game:error", { message: "Invalid wallet" });
      return;
    }

    // Queueing twice would let a player be matched against themselves:
    // both stakes get locked from the same wallet and getWinner always
    // draws, so the match can never reach 3 and the funds never come back.
    for (const [, q] of waitingPlayersByStake) {
      if (q.some((p) => p.playerId === playerId)) {
        socket.emit("game:error", { message: "Already in queue" });
        return;
      }
    }

    socketsByPlayer.set(playerId, socket.id);

    const queue = waitingPlayersByStake.get(stake)!;

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
        readyPlayers: new Set(),
        roundReadyPlayers: new Set(),
        isRanked: true,
        stake,
      };

      rooms.set(roomId, room);

      const s1Id = socketsByPlayer.get(p1);
      const s2Id = socketsByPlayer.get(p2);

      try {
        await lockFundsForBothPlayers(
          { ownerId: p1, walletId: w1 },
          { ownerId: p2, walletId: w2 },
          stake
        );
      } catch (err) {
        console.error("❌ Error locking funds:", err);

        if (s1Id) io.to(s1Id).emit("game:error", { message: "Insufficient funds" });
        if (s2Id) io.to(s2Id).emit("game:error", { message: "Insufficient funds" });

        rooms.delete(roomId);
        return;
      }

      if (s1Id) io.sockets.sockets.get(s1Id)?.join(roomId);
      if (s2Id) io.sockets.sockets.get(s2Id)?.join(roomId);

      const users = await User.find({ _id: { $in: [p1, p2] } }).select("username");
      const playersData: PlayerData[] = users.map((u) => ({
        id: String(u._id),
        username: u.username || "Desconocido",
      }));

      io.to(roomId).emit("game:start", { roomId, players: playersData });

      console.log(`⚔️ Partida creada: ${roomId} (${p1} vs ${p2})`);
    } else {
      queue.push({ playerId, walletId });
      console.log(`🪑 ${playerId} en cola (${queue.length})`);
    }
  }
);

    socket.on("game:cancelQueue", () => {
  for (const [, queue] of waitingPlayersByStake) {
    const idx = queue.findIndex((q) => q.playerId === playerId);
    if (idx !== -1) {
      queue.splice(idx, 1);
      break;
    }
  }
});

    socket.on("game:ready", ({ roomId }) => {
  const room = rooms.get(roomId);
  if (!room) return;
  if (!room.players.includes(playerId)) return;

  room.readyPlayers.add(playerId);

  if (room.readyPlayers.size === room.players.length && room.players.length === 2) {
    console.log("⏱️ Ambos jugadores listos → iniciando ronda 1");

    io.to(roomId).emit("game:roundStart");

    startRoundTimer(roomId);
  }

  rooms.set(roomId, room);
});

    socket.on("game:roundReady", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || !room.isActive) return;
      if (!room.players.includes(playerId)) return;

      // Ignore while a round is already running, otherwise a client can
      // re-arm the timer forever and the round never resolves.
      if (roundTimers.has(roomId)) return;

      room.roundReadyPlayers.add(playerId);

      if (room.roundReadyPlayers.size === 2) {

        room.roundReadyPlayers.clear();

        io.to(roomId).emit("game:roundStart");

        startRoundTimer(roomId);
      }

      rooms.set(roomId, room);
    });

socket.on("game:move", ({ roomId, move }: { roomId: string; move: unknown }) => {
  const room = rooms.get(roomId);
  if (!room || !room.isActive) return;

  if (!room.players.includes(playerId)) return;
  if (!isMove(move)) return;

  // One move per round: without this a player can overwrite their choice
  // right up to the timer.
  if (room.moves[playerId]) return;

  room.moves[playerId] = move;
  rooms.set(roomId, room);

  socket.emit("game:moveAck", { ok: true });
});



    socket.on("disconnect", () => {
      // Only drop the mapping if this socket still owns it; a reconnect may
      // already have replaced it with a newer socket for the same player.
      if (socketsByPlayer.get(playerId) === socket.id) {
        socketsByPlayer.delete(playerId);
      }
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

  if (roundTimers.has(roomId)) {
    clearTimeout(roundTimers.get(roomId)!);
    
  }

  const timer = setTimeout(async () => {
    const [p1, p2] = room.players;
    const m1 = room.moves[p1];
    const m2 = room.moves[p2];

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
      const loser = room.players.find((p) => p !== winner)!;
      try {
        await settleMatch({
          winnerWalletId: room.wallets[winner],
          loserWalletId: room.wallets[loser],
          stake: room.stake,
        });
      } catch (err) {
        // Both stakes are already in escrow at this point, so a failure here
        // strands real funds. Log every id needed to settle it by hand.
        console.error("❌ Error settling match:", {
          roomId,
          stake: room.stake,
          winner,
          loser,
          winnerWalletId: room.wallets[winner],
          loserWalletId: room.wallets[loser],
          err,
        });
      }

      return;
    }
  }
}

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

    const winner =
      room.players.find((p) => room.scores[p] === 3) || null;

    if (winner) {
      io.to(roomId).emit("game:finished", { winner });
      room.isActive = false;
      rooms.set(roomId, room);
      saveMatch(room, winner).catch((err) =>
        console.error("Error guardando partida (timer):", err)
      );
      const loser = room.players.find((p) => p !== winner)!;
      try {
        await settleMatch({
          winnerWalletId: room.wallets[winner],
          loserWalletId: room.wallets[loser],
          stake: room.stake,
        });
      } catch (err) {
        // Both stakes are already in escrow at this point, so a failure here
        // strands real funds. Log every id needed to settle it by hand.
        console.error("❌ Error settling match (timeout):", {
          roomId,
          stake: room.stake,
          winner,
          loser,
          winnerWalletId: room.wallets[winner],
          loserWalletId: room.wallets[loser],
          err,
        });
      }

      return;
    }

    room.moves = { [p1]: null, [p2]: null };
    rooms.set(roomId, room);

  }, 10000); 

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
