import { Router } from "express";
import { User } from "../models/user";
import { Match } from "../models/match";

const router = Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("username avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    const played = await Match.countDocuments({
      $or: [{ player1: userId }, { player2: userId }]
    });

    const wins = await Match.countDocuments({ winner: userId });

    const winrate = played > 0 ? ((wins / played) * 100).toFixed(1) : "0";

    return res.json({
      userId,
      username: user.username,
      avatar: user.avatar,
      played,
      wins,
      winrate,
    });
  } catch (err) {
    console.error("❌ Error public user:", err);
    res.status(500).json({ message: "Error public user" });
  }
});

export default router;
