// routes/leaderboardUser.ts
import { Router } from "express";
import { Match } from "../models/match";
import { User } from "../models/user";
import { Season } from "../models/season";
import { Types } from "mongoose";

const router = Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { seasonId } = req.query as { seasonId?: string };

    const user = await User.findById(userId).select("username avatar");
    if (!user) return res.status(404).json({ error: "User not found" });

    let filter: any = { isRanked: true };

    if (seasonId && seasonId !== "all") {
      filter.seasonId = new Types.ObjectId(seasonId);
    } else {
      const active = await Season.findOne({ isActive: true });
      if (active) filter.seasonId = active._id;
    }

    const wins = await Match.countDocuments({
      ...filter,
      winner: userId,
    });

    const losses = await Match.countDocuments({
      ...filter,
      winner: { $ne: userId },
      $or: [{ player1: userId }, { player2: userId }],
    });

    const score = wins * 15;

    return res.json({
      userId,
      username: user.username,
      avatar: user.avatar,
      wins,
      losses,
      score,
    });

  } catch (err) {
    console.error("❌ leaderboardUser error:", err);
    res.status(500).json({ error: "Error loading user leaderboard info" });
  }
});

export default router;
