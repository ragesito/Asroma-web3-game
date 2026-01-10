import express from "express";
import { syncWalletBalance } from "../services/walletBalanceService";

const router = express.Router();

router.get("/:walletId/balance", async (req, res) => {
  try {
    const wallet = await syncWalletBalance(req.params.walletId);
    res.json({ sol: wallet.available });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
