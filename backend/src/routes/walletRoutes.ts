import express from "express";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
import {
  listUserWallets,
  exportPrivateKey,
  importWalletForUser,
} from "../services/walletService";
import { Wallet } from "../models/wallet";
import { getSolBalance } from "../services/solanaService";
import { createInternalWalletForUser } from "../services/walletService";
import { User } from "../models/user";
import { transferSol } from "../services/transferService";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* 🔐 GET /wallets                                                            */
/* -------------------------------------------------------------------------- */
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const wallets = await listUserWallets(req.user!._id);
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wallets" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🔐 POST /wallets/:id/export                                                */
/* -------------------------------------------------------------------------- */
router.post("/:id/export", verifyToken, async (req: AuthRequest, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    const privateKey = await exportPrivateKey(
      req.params.id,
      req.user!._id,
      password
    );

    res.json({ privateKey });
  } catch (err: any) {
    if (err.message === "INVALID_PASSWORD") {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(500).json({ message: "Export failed" });
  }
});
/* -------------------------------------------------------------------------- */
/* 🔐 GET with Balance                                                       */
/* -------------------------------------------------------------------------- */
router.get(
  "/with-balances",
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!._id;
      const { showArchived } = req.query;
      
      const filter: any = { owner: userId };
      if (showArchived !== "true") {
        filter.archived = false;
      }
      const wallets = await Wallet.find(filter).lean();
      const walletsWithBalances = [];

      for (const wallet of wallets) {
        const sol = await getSolBalance(wallet.publicKey);

        walletsWithBalances.push({
          _id: wallet._id,
          name: wallet.name,
          publicKey: wallet.publicKey,
          type: wallet.type,
          archived: wallet.archived,
          sol,
        });
      }


      res.json(walletsWithBalances);
    } catch (err) {
      console.error("❌ Wallet balances error:", err);
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  }
);
router.post("/create", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const { name } = (req.body ?? {}) as { name?: string };

    const wallet = await createInternalWalletForUser(userId, name);

    res.status(201).json({
      _id: wallet.walletId,
      name: wallet.name,
      publicKey: wallet.publicKey,
      type: "internal",
      sol: 0,
    });
  } catch (err) {
    console.error("❌ Create wallet error:", err);
    res.status(500).json({ message: "Failed to create wallet" });
  }
});


/* -------------------------------------------------------------------------- */
/* 🔐 POST /wallets/import                                                    */
/* -------------------------------------------------------------------------- */
router.post("/import", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const { privateKey, name } = req.body as {
      privateKey: string;
      name?: string;
    };

    if (!privateKey) {
      return res.status(400).json({ message: "Private key required" });
    }
    
    const wallet = await importWalletForUser(
      userId,
      privateKey,
      name
    );

    res.status(201).json({
      _id: wallet.walletId,
      name: wallet.name,
      publicKey: wallet.publicKey,
      type: "imported",
      sol: 0,
      restored: (wallet as any).restored === true,
    });
  } catch (err: any) {
    if (err.message === "INVALID_PRIVATE_KEY") {
      return res.status(400).json({ message: "Invalid private key" });
    }

    if (err.message === "WALLET_ALREADY_EXISTS") {
      return res.status(409).json({ message: "Wallet already imported" });
    }

    console.error("❌ Import wallet error:", err);
    res.status(500).json({ message: "Failed to import wallet" });
  }
});

// PATCH /wallets/:id/rename
router.patch("/:id/rename", verifyToken, async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Invalid name" });
  }

  await Wallet.updateOne(
    { _id: req.params.id, owner: req.user!._id },
    { name: name.trim() }
  );

  res.json({ ok: true });
});

// PATCH /wallets/:id/archive
router.patch("/:id/archive", verifyToken, async (req: AuthRequest, res) => {
  const wallet = await Wallet.findOne({
    _id: req.params.id,
    owner: req.user!._id,
  });

  if (!wallet) {
    return res.status(404).json({ message: "Wallet not found" });
  }

  wallet.archived = !wallet.archived; // 🔥 TOGGLE
  await wallet.save();

  res.json({ archived: wallet.archived });
});

/* -------------------------------------------------------------------------- */
/* 🔐 POST /wallets/transfer                                                  */
/* -------------------------------------------------------------------------- */
router.post(
  "/transfer",
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const { fromWalletId, toPublicKey, amount } = req.body as {
        fromWalletId: string;
        toPublicKey: string;
        amount: number;
      };

      if (!fromWalletId || !toPublicKey || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid transfer data" });
      }

      const signature = await transferSol({
        userId: req.user!._id.toString(),
        fromWalletId,
        toPublicKey,
        amount,
      });

      res.json({ signature });
    } catch (err: any) {
      console.error("❌ Transfer error:", err);

      res.status(400).json({
        message: err.message || "Transfer failed",
      });
    }
  }
);
/* -------------------------------------------------------------------------- */
/* 🔐 POST /wallets/withdraw                                                   */
/* -------------------------------------------------------------------------- */
router.post(
  "/withdraw",
  verifyToken,
  async (req: AuthRequest, res) => {
    try {
      const { fromWalletId, toPublicKey, amount } = req.body as {
        fromWalletId: string;
        toPublicKey: string;
        amount: number;
      };

      if (!fromWalletId || !toPublicKey || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdraw data" });
      }

      const signature = await transferSol({
        userId: req.user!._id.toString(),
        fromWalletId,
        toPublicKey,
        amount,
      });

      res.json({
        ok: true,
        signature,
      });
    } catch (err: any) {
      console.error("❌ Withdraw error:", err);

      res.status(400).json({
        message: err.message || "Withdraw failed",
      });
    }
  }
);

export default router;
