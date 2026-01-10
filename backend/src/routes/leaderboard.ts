import { Router } from "express";
import { Match } from "../models/match";
import { User } from "../models/user";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";
import { Season } from "../models/season";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const { seasonId } = req.query as { seasonId?: string };

    const seasonFilter: any = { isRanked: true };

    if (seasonId && seasonId !== "all") {
      seasonFilter.seasonId = new Types.ObjectId(seasonId);
    } else {
      const activeSeason = await Season.findOne({ isActive: true });
      if (activeSeason) {
        seasonFilter.seasonId = activeSeason._id;
      }
    }

    const stats = await Match.aggregate([
      { $match: seasonFilter },

      {
        $group: {
          _id: "$winner",
          wins: { $sum: 1 },
        },
      },

      {
        $lookup: {
          from: "matches",
          let: { winnerId: "$_id", seasonId: seasonFilter.seasonId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$isRanked", true] },
                    { $ne: ["$winner", "$$winnerId"] },
                    {
                      $or: [
                        { $eq: ["$player1", "$$winnerId"] },
                        { $eq: ["$player2", "$$winnerId"] },
                      ],
                    },
                    { $eq: ["$seasonId", "$$seasonId"] }
                  ]
                }
              }
            }
          ],
          as: "lossMatches",
        },
      },

      {
        $addFields: {
          losses: { $size: "$lossMatches" },
        },
      },
    ]);

    const fullStats = await Promise.all(
      stats.map(async (s) => {
        const user = await User.findById(s._id).select("username avatar");

        return {
          userId: s._id,
          username: user?.username || "Unknown",
          avatar: user?.avatar || "/uploads/default-avatar.jpg",
          wins: s.wins,
          losses: s.losses,
          score: s.wins * 15, 
        };
      })
    );

    fullStats.sort((a, b) => b.score - a.score);

    return res.json(fullStats);

  } catch (err) {
    console.error("❌ ERROR LEADERBOARD:", err);
    res.status(500).json({ error: "Error loading leaderboard" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const wins = await Match.countDocuments({ winner: userId, isRanked: true });

    const losses = await Match.countDocuments({
      isRanked: true,
      winner: { $ne: userId },
      $or: [
        { player1: userId },
        { player2: userId },
      ]
    });

    const user = await User.findById(userId).select("username avatar");
    if (!user) return res.status(404).json({ error: "User not found" });

    const score = wins * 15;

    return res.json({
      userId,
      username: user.username,
      avatar: user.avatar,
      wins,
      losses,
      score
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Error fetching stats" });
  }
});


export default router;
