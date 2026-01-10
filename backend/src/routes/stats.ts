import { Router } from "express";
import { Match } from "../models/match";
import { User }from "../models/user";
import { Season } from "../models/season";
import { Types } from "mongoose";

const router = Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { seasonId, mode } = req.query;

    let seasonFilter: any = {};

const seasonParam = seasonId as string | undefined;

if (seasonParam === "all") {
  seasonFilter = {};
}
else if (!seasonParam || seasonParam === "current") {
  const active = await Season.findOne({ isActive: true }).sort({ startDate: -1 });
  if (active) {
    seasonFilter = { seasonId: active._id };
  }
}
else {
  seasonFilter = { seasonId: seasonParam };
}

    let modeFilter: any = {};
    if (mode === "ranked") modeFilter = { mode: "ranked" };
    if (mode === "private") modeFilter = { mode: "private" };

    const matches = await Match.find({
      $and: [
        { $or: [{ player1: userId }, { player2: userId }] },
        seasonFilter,
        modeFilter
      ]
    }).sort({ createdAt: -1 });

    if (!matches.length) {
      return res.json({
        played: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        recentMatches: [],
      });
    }

    let wins = 0;

    const opponentIds = matches.map((match) =>
      String(match.player1) === userId ? match.player2 : match.player1
    );

    const opponents = await User.find({ _id: { $in: opponentIds } }).select("username");

    const opponentMap: Record<string, string> = {};
    opponents.forEach((o) => {
      opponentMap[(o._id as Types.ObjectId).toString()] = o.username;
    });

    const recentMatches = matches.map((match) => {
      const isPlayer1 = String(match.player1) === userId;
      const rivalId = isPlayer1 ? match.player2 : match.player1;
      const youWon = String(match.winner) === userId;
      if (youWon) wins++;

      return {
        _id: match._id,
        youWon,
        result: youWon ? "WIN" : "LOSS",
        opponentId: rivalId,
        opponentName: opponentMap[rivalId.toString()] || "Unknown",
        score: match.score,
        scoreText: isPlayer1
          ? `${match.score.p1}-${match.score.p2}`
          : `${match.score.p2}-${match.score.p1}`,
        createdAt: match.createdAt,
        mode: match.mode,  
        season: match.seasonId 
      };
    });

    const played = matches.length;
    const losses = played - wins;
    const winrate = played > 0 ? ((wins / played) * 100).toFixed(1) : 0;

    return res.json({
      played,
      wins,
      losses,
      winrate,
      recentMatches,
    });

  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res.status(500).json({ message: "Error fetching stats" });
  }
});


export default router;