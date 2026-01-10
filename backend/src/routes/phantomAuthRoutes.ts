import express from "express";
import bs58 from "bs58";
import nacl from "tweetnacl";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Request } from "express";
import { User } from "../models/user";
import {
  createPhantomChallenge,
  getPhantomChallenge,
  consumePhantomChallenge,
} from "../services/phantomChallengeService";

const router = express.Router();

const challengeSchema = z.object({
  publicKey: z.string().min(20),
});

const verifySchema = z.object({
  challengeId: z.string().uuid(),
  signature: z.string().min(10),
});

const completeSchema = z.object({
  phantomToken: z.string().min(10),
  username: z.string().min(3),
  email: z
    .string()
    .regex(
      /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
      "Email inválido"
    ),
  password: z.string().min(6),
});

function signPhantomSetupToken(payload: { phantomPublicKey: string }) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}
function verifyPhantomSetupToken(token: string) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.verify(token, process.env.JWT_SECRET) as {
    phantomPublicKey: string;
  };
}

/* -------------------------------------------------------------------------- */
/* STEP 1: CHALLENGE                                                          */
/* POST /api/auth/phantom/challenge                                           */
/* -------------------------------------------------------------------------- */
router.post("/challenge", async (req, res) => {
  try {
    const { publicKey } = challengeSchema.parse(req.body);

    const domain =
      (req.headers["x-app-domain"] as string) ||
      (process.env.APP_DOMAIN ?? "localhost");

    const challenge = await createPhantomChallenge({ publicKey, domain });

    res.json({
      challengeId: challenge.id,
      message: challenge.message,
      expiresAt: challenge.expiresAt,
    });
  } catch (err: any) {
    res.status(400).json({ message: err?.message || "Bad request" });
  }
});

/* -------------------------------------------------------------------------- */
/* STEP 2: VERIFY SIGNATURE                                                   */
/* POST /api/auth/phantom/verify                                              */
/* -------------------------------------------------------------------------- */
router.post("/verify", async (req, res) => {
  try {
    const { challengeId, signature } = verifySchema.parse(req.body);

let currentUserId: string | null = null;

const auth = req.headers.authorization;
if (auth?.startsWith("Bearer ")) {
  try {
    const decoded = jwt.verify(
      auth.slice(7),
      process.env.JWT_SECRET!
    ) as { id: string };
    currentUserId = decoded.id;
  } catch {
  }
}

    const challenge = await getPhantomChallenge(challengeId);
    if (!challenge) {
      return res.status(400).json({ message: "Challenge expired" });
    }

    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      await consumePhantomChallenge(challengeId);
      return res.status(400).json({ message: "Challenge expired" });
    }

    const ok = nacl.sign.detached.verify(
      new TextEncoder().encode(challenge.message),
      bs58.decode(signature),
      bs58.decode(challenge.publicKey)
    );

    if (!ok) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    await consumePhantomChallenge(challengeId);

const existingUser = await User.findOne({
  phantomPublicKey: challenge.publicKey,
});

if (
  currentUserId &&               
  existingUser &&
  String(existingUser._id) !== currentUserId
) {
  return res.status(409).json({
    code: "PHANTOM_ALREADY_LINKED",
    message: "This Phantom wallet is already linked to another account",
  });
}

if (existingUser) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET missing");

  const token = jwt.sign(
    { id: existingUser._id, username: existingUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    status: "LOGIN",
    message: "Login successful",
    id: existingUser._id,
    username: existingUser.username,
    token,
    phantomPublicKey: existingUser.phantomPublicKey,
    avatar: existingUser.avatar || "/uploads/default-avatar.jpg",
  });
}

    const phantomToken = signPhantomSetupToken({
      phantomPublicKey: challenge.publicKey,
    });

    return res.json({
      status: "SETUP_REQUIRED",
      phantomToken,
      phantomPublicKey: challenge.publicKey,
    });
  } catch (err: any) {
    res.status(400).json({ message: err?.message || "Bad request" });
  }
});

/* -------------------------------------------------------------------------- */
/* STEP 3: COMPLETE REGISTRATION (email/password flow)                         */
/* POST /api/auth/phantom/complete                                            */
/* -------------------------------------------------------------------------- */
router.post("/complete", async (req, res) => {
  try {
    const { phantomToken, username, email, password } = completeSchema.parse(
      req.body
    );

    const decoded = verifyPhantomSetupToken(phantomToken);
    const phantomPublicKey = decoded.phantomPublicKey;

    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail) return res.status(400).json({ message: "Este email ya está registrado" });
    if (existingUsername) return res.status(400).json({ message: "Este nombre de usuario ya está en uso" });

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phantomPublicKey,
      isVerified: false,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
      lastVerificationSentAt: new Date(),
    });

    const { sendVerificationEmail } = await import("../services/emailService");
    await sendVerificationEmail(email, verificationCode);

    return res.status(201).json({
      message: "Usuario registrado. Verificá tu email.",
    });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message || "Bad request" });
  }
});

export default router;
