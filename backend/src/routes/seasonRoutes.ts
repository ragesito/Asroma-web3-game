import { Router } from "express";
import { Season } from "../models/season";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const seasons = await Season.find().sort({ startDate: -1 });
    res.json(seasons);
  } catch (err) {
    console.error("❌ Error loading seasons:", err);
    res.status(500).json({ error: "Error loading seasons" });
  }
});

export default router;
