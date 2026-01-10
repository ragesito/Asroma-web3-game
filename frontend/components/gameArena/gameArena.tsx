"use client";

import { useEffect, useState } from "react";
import { socket } from "@/app/lib/socket";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/button";
import Toast from "@/components/toast";
import CircularTimer from "./circularTimer";
import RoundVerdictScreen from "./roundVerdictScreen";
import WinnerMatchScreen from "./winnerMatchScreen";
import TargetCursor from "@/components/gameArena/targetCursor";
import { useTranslation } from "react-i18next";
interface GameArenaProps {
  roomId: string;
  playerId: string;
  opponentName: string;
  opponentId: string;
  onExit: () => void;
}

type Move = "rock" | "paper" | "scissors" | null;

export default function GameArena({
  roomId,
  playerId,
  opponentName,
  opponentId,
  onExit,
}: GameArenaProps) {
  const [selectedMove, setSelectedMove] = useState<Move>(null);
  const [opponentMove, setOpponentMove] = useState<Move>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);

  const [scores, setScores] = useState<Record<string, number>>({
    [playerId]: 0,
    [opponentId]: 0,
  });
  const [visibleScores, setVisibleScores] = useState<Record<string, number>>({
  [playerId]: 0,
  [opponentId]: 0,
});

  const [toast, setToast] = useState<{
    message: string;
    type?: "info" | "success" | "error";
  } | null>(null);

  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCounting, setIsCounting] = useState(true);
  const [showVerdict, setShowVerdict] = useState(false);
  const { t } = useTranslation();
  const [showWinnerScreen, setShowWinnerScreen] = useState(false);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);

  useEffect(() => {
    socket.emit("game:ready", { roomId });
  }, [roomId]);

  useEffect(() => {
    socket.on("game:roundResult", (data) => {
      setIsCounting(false);

      setOpponentMove(data.moves?.[opponentId] ?? null);
      setSelectedMove(data.moves?.[playerId] ?? selectedMove);

      setScores(data.scores || scores);

      const r =
        data.result === "draw"
          ? `${t("round_draw")} 😐`
          : data.winner === playerId
          ? t("round_won")
          : t("round_lost");

      setRoundResult(r);
      setShowVerdict(true);
      setTimeLeft(10);
      setTimeout(() => {
    setVisibleScores(data.scores);
  }, 2000);

      setTimeout(() => {
        setShowVerdict(false);
        setSelectedMove(null);
        setOpponentMove(null);
        setRoundResult(null);

        socket.emit("game:roundReady", { roomId, playerId });
      }, 3500);
    });

    socket.on("game:finished", ({ winner }) => {
      setGameOver(true);

      setTimeout(() => {
        setMatchWinner(winner);
        setShowWinnerScreen(true);
      }, 2500);
    });

    return () => {
      socket.off("game:roundResult");
      socket.off("game:finished");
    };
  }, [playerId, roomId, scores]);

  useEffect(() => {
    socket.on("game:roundStart", () => {
      setTimeLeft(10);
      setIsCounting(true);
    });

    return () => {
      socket.off("game:roundStart");
    };
  }, []);

  useEffect(() => {
    if (gameOver || !isCounting) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? prev : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameOver, isCounting]);

  const sendMove = (move: Move) => {
    if (selectedMove || gameOver) return;
    setSelectedMove(move);
    socket.emit("game:move", { roomId, playerId, move });
  };

  const moves = [
    { key: "rock", img: "/rockImg.png", label: "Piedra" },
    { key: "paper", img: "/paperImg.png", label: "Papel" },
    { key: "scissors", img: "/scissorsImg.png", label: "Tijera" },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-center text-white gap-6">
    {!selectedMove && !gameOver && (
      <TargetCursor
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
    )}
      <h2 className="text-2xl font-bold">⚔️ {t("battle_in_progress")}</h2>

      {/* Scoreboard */}
      <div className="flex gap-12 text-lg font-semibold">
        <div className="text-center">
          <p className="text-secondary">{t("you")}</p>
          <p className="text-3xl">{visibleScores[playerId]}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">{opponentName}</p>
          <p className="text-3xl">{visibleScores[opponentId]}</p>
        </div>
      </div>

      {/* TIMER */}
      <CircularTimer timeLeft={timeLeft} totalTime={10} isCounting={isCounting} />

      {/* MOVEMENTS */}
      <div className="flex gap-8 mt-4">
        {moves.map((m) => (
          <motion.button
            key={m.key}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMove(m.key)}
            disabled={!!selectedMove || gameOver}
            className={`cursor-target p-2 transition-all duration-300 ${
              selectedMove === m.key
                ? "bg-yellow-500/80 shadow-[0_0_50px_rgba(255,165,0,0.7)]"
                : "hover:scale-105"
            }`}
          >
            <img src={m.img} alt={m.label} className="w-44 h-44 object-contain" />
          </motion.button>
        ))}
      </div>

      {/* VERDICT */}
      {showVerdict && (
        <RoundVerdictScreen
          playerMove={selectedMove}
          opponentMove={opponentMove}
          result={roundResult!}
        />
      )}

      {/* WINNER SCREEN */}
      {showWinnerScreen && (
        <WinnerMatchScreen
          winner={matchWinner}
          playerId={playerId}
          opponentName={opponentName}
          onFinish={onExit}
        />
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
