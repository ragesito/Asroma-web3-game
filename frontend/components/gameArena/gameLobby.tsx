"use client";

import { useState, useEffect } from "react";
import { socket } from "@/app/lib/socket";
import { useUserStore } from "@/app/store/userStore";
import { motion } from "framer-motion";
import { Button } from "@/components/button";
import Toast from "@/components/toast";
import JoinRoomDialog from "./joinRoomDialog";
import GameArena from "./gameArena";
import { useTranslation } from "react-i18next";
import { useHydrated } from "@/app/hooks/useHydrated";
import LoginModal from "../LoginModal";
import GameMenu from "./gameMenu";
import BettingModal from "./bettingModal";
import MatchmakingScreen from "./matchmakingScreen";
import api from "@/app/lib/api";
import PlayerCard from "./playerCard";
import MatchFoundScreen from "./matchFoundScreen";
import LottieFinding from "../lottieFinding";
import PrivateRoomWaitingScreen from "./privateRoomWaitingScreen";
import FriendsInviteModal from "./friendsInviteModal";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import InfiniteMenu from "./InfiniteMenu";
const GameLobby = () => {
  const { id, username } = useUserStore();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inQueue, setInQueue] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>("Desconocido");
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ message: string; type?: "info" | "success" | "error" } | null>(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const hydrated = useHydrated();
  const [bettingOpen, setBettingOpen] = useState(false);
  const [betAmount, setBetAmount] = useState<number | null>(null);
  const [mode, setMode] = useState<"ranked" | "create" | null>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [opponentStats, setOpponentStats] = useState<any>(null);
  const [waitingPrivate, setWaitingPrivate] = useState(false);
  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const { sol: balance, walletId } = useSelectedWalletStore();

  
  
  
  useEffect(() => {
  if (!id) return;

  const pending = sessionStorage.getItem("pendingInviteJoin");
  if (pending) {
    const { roomId } = JSON.parse(pending);

    console.log("🎯 Detectada invitación pendiente → uniendo a sala:", roomId);

    socket.emit("game:join", { roomId, playerId: id });

    sessionStorage.removeItem("pendingInviteJoin");
  }
  socket.emit("game:register", { playerId: id });

  api
    .get(`/leaderboard/user/${id}`)
    .then((res) => {
      setPlayerStats(res.data);
    })
    .catch((err) => {
      console.error("❌ Error cargando playerStats:", err.response?.data || err);
      setPlayerStats(null);
    });

    
}, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.on("game:start", ({ roomId, players }: { roomId: string; players: { id: string; username: string }[] }) => {
  setGameStarted(true);
  setRoomId(roomId);

  const rival = players.find((p) => p.id !== id);

  if (rival) {
  setOpponentId(rival.id);
  setOpponentName(rival.username);

api.get(`/leaderboard/user/${rival.id}`)
  .then(res => {
      setOpponentStats(res.data);
  })
  .catch(() => {
      setOpponentStats(null);
  });

  setInQueue(false);

  setShowTransition(true);
  setTimeout(() => {
    setShowTransition(false);
    setGameStarted(true);
  }, 10000);
  }
});


    socket.on("game:roundResult", (data) => {
      console.log("🧩 Resultado de ronda:", data);
    });

    socket.on("game:error", ({ message }) => {
    setToast({
        message: `⚠️ ${message}`,
        type: "error",
    });
    });

    socket.on("game:finished", ({ winner }) => {
      console.log("🏆 Ganador:", winner);
      setGameStarted(false);
      setRoomId(null);
      setOpponentId(null);
      setOpponentStats(null); 
     setOpponentName("Desconocido"); 
    });
    socket.on("game:waiting", ({ roomId, createdBy }) => {
  if (createdBy === id) {
    setWaitingPrivate(true);
    setWaitingRoomId(roomId);
  }
});
    socket.on("game:roomCancelled", ({ roomId }) => {
      if (waitingRoomId === roomId) {
        setWaitingPrivate(false);
        setWaitingRoomId(null);
        setRoomId(null);
        setToast({
          message: "🚫 La sala privada fue cancelada.",
          type: "info",
        });
      }
    });

    


socket.on("game:privateReady", ({ roomId, players }) => {
  const rival = players.find((p: any) => p.id !== id);

  if (rival) {
    setOpponentId(rival.id);
    setOpponentName(rival.username);

    api.get(`/leaderboard/user/${rival.id}`)
      .then(res => setOpponentStats(res.data))
      .catch(() => setOpponentStats(null));
  }

  setWaitingPrivate(false);

  setShowTransition(true);
  setTimeout(() => {
    setShowTransition(false);
    setGameStarted(true);
  }, 10000);
});

    return () => {
      socket.off("game:start");
      socket.off("game:roundResult");
      socket.off("game:finished");
      socket.off("game:error");
      socket.off("game:waiting");
      socket.off("game:privateReady");
      socket.off("game:roomCancelled")
    };
  }, [id]);

  const handleSearchMatch = (stakeOverride?: number) => {
  if (!id) {
    setShowLogin(true);
    return;
  }

  const stakeToUse = stakeOverride ?? betAmount;

  if (!stakeToUse) {
    setToast({ message: "Select a bet first", type: "error" });
    return;
  }

  if (stakeToUse <= 0 || stakeToUse > balance) {
    setToast({ message: "Insufficient balance", type: "error" });
    return;
  }

  setOpponentStats(null);
  setOpponentId(null);
  setOpponentName("Desconocido");
  setInQueue(true);
  if (!walletId) {
  setToast({ message: "Select a wallet first", type: "error" });
  return;
}

  socket.emit("game:queue", {
    playerId: id,
    walletId,
    stake: stakeToUse,
  });
};

  const handleCancelSearch = () => {
    setInQueue(false);
    setOpponentStats(null);
  setOpponentId(null);
  setOpponentName("Desconocido");
    socket.emit("game:cancelQueue", { playerId: id });
  };

  const handleCreatePrivate = () => {
    if (!id) {
      setShowLogin(true);
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    socket.emit("game:create", { roomId: newRoomId, playerId: id });
    

  };

  const handleCancelPrivate = () => {
  if (!waitingRoomId || !id) return;

  socket.emit("game:cancelPrivate", {
    roomId: waitingRoomId,
    playerId: id,
  });

  setWaitingPrivate(false);
  setWaitingRoomId(null);
  setRoomId(null);
};

    const handleJoinPrivate = () => {
    if (!id) {setShowLogin(true)  ; return; }
    setJoinOpen(true);
    };
    const submitJoin = (joinCode: string) => {
    setRoomId(joinCode);
    socket.emit("game:join", { roomId: joinCode, playerId: id });
    
    setJoinOpen(false);
};
const handleBetConfirm = (amount: number) => {
  setBetAmount(amount);
  setBettingOpen(false);

  if (mode === "ranked") {
    handleSearchMatch(amount); 
  } else if (mode === "create") {
    handleCreatePrivate();
  }
};

const openRanked = () => {
  if (!id) return setShowLogin(true);
  setMode("ranked");
  setBettingOpen(true);
};

const openCreate = () => {
  if (!id) return setShowLogin(true);
  setMode("create");
  setBettingOpen(true);
};

useEffect(() => {
  if (playerStats) {
    console.log("📌 Tus playerStats reales:", playerStats);
  }
}, [playerStats]);
if (!hydrated) return null;
return (
  <motion.div
    className="flex flex-col items-center justify-center gap-6 text-center"
    
  >

    {!inQueue && !gameStarted && (
      <div className="relative w-[100vw]  h-[100vh]">
            <InfiniteMenu
             items={[
  {
    image: "/rankedImg.png",
    link: "ranked",
    title: t("ranked_match_title"),
    description: t("ranked_match_description"),
  },
  {
    image: "/createImg.png",
    link: "create",
    title: t("create_match_title"),
    description:  t("create_match_description"),
  },
  {
    image: "/joinImg.png",
    link: "join",
    title: t("join_match_title"),
    description: t("join_match_description"),
  },
  {
    image: "/2vs2Img.png",
    link: "friends",
    title: t("team_match_title"),
    description: t("team_match_description"),
  },
]}

              onRanked={openRanked}
              onCreate={openCreate}
              onJoin={handleJoinPrivate}
              onFriends={() => {}}
            />
          </div>
    )}
    {waitingPrivate && (
  <PrivateRoomWaitingScreen
    roomId={waitingRoomId!}
    user={playerStats}
    onInviteClick={() => setInviteModalOpen(true)}
    onCancel={handleCancelPrivate}
  />
)}

    {/* 🟡 MATCHMAKING SCREEN (only if its searching and not has transaccion) */}
    {inQueue && !showTransition && (
      <MatchmakingScreen onCancel={handleCancelSearch} size={400} />
    )}

    {/* 🟣 MATCH FOUND SCREEN only when it comes game:start) */}
    {showTransition && (
      <MatchFoundScreen
    player={playerStats}
    opponent={opponentStats}
    opponentName={opponentName}
    betAmount={betAmount!}
  />
    )}

    {/* 🔵 GAMEARENA (when transition is finished) */}
    {gameStarted && !showTransition && (
      <GameArena
        roomId={roomId!}
        playerId={id!}
        opponentId={opponentId!}
        opponentName={opponentName}
        onExit={() => {
          setGameStarted(false);
          setShowTransition(false);
          setRoomId(null);
          setOpponentId(null);
          setOpponentName("Desconocido");
        }}
      />
    )}

    {/* 🔔 TOASTS */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(null)}
      />
    )}

    {/* 🔐 LOGIN MODAL */}
    <LoginModal
      isOpen={showLogin}
      onClose={() => setShowLogin(false)}
      onLoginSuccess={() => setShowLogin(false)}
      defaultRegister={true}
    />
    <FriendsInviteModal
      isOpen={inviteModalOpen}
      onClose={() => setInviteModalOpen(false)}
      roomId={roomId!}
    />


    {/* 🔑 JOIN ROOM */}
    <JoinRoomDialog
      open={joinOpen}
      onClose={() => setJoinOpen(false)}
      onSubmit={submitJoin}
    />

    {/* 💰 BETTING MODAL */}
    <BettingModal
      isOpen={bettingOpen}
      onClose={() => setBettingOpen(false)}
      onConfirm={handleBetConfirm}
      balance={balance}
    />

  </motion.div>
  );
};

export default GameLobby;
