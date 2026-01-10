import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import sharp from "sharp";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/user";
import { Match } from "../models/match";
import { Message } from "../models/message";
import { FriendList } from "../models/friendList";
import { FriendRequest } from "../models/friendRequest";

const router = express.Router();

const storage = multer.memoryStorage();

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
    }
    cb(null, true);
  },
});

function safeUploadsDir(): string {
  return path.join(process.cwd(), "uploads");
}

function avatarUrlToDiskPath(avatarUrl: string): string {
  const relative = avatarUrl.replace(/^\/+/, "");
  return path.join(process.cwd(), relative);
}

// =========================
//  UPDATE AVATAR
// =========================
router.put(
  "/update-avatar",
  verifyToken,
  upload.single("avatar"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user?._id || !req.file?.buffer) {
        return res.status(400).json({ message: "Invalid request" });
      }

      const uploadDir = safeUploadsDir();

      if (!fsSync.existsSync(uploadDir)) {
        await fs.mkdir(uploadDir, { recursive: true });
      }

      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const oldAvatarUrl = (user as any).avatar as string | undefined;

      const filename = `${req.user._id}-${Date.now()}.jpg`;
      const outputPath = path.join(uploadDir, filename);

      await sharp(req.file.buffer)
        .rotate() 
        .resize(256, 256, { fit: "cover" })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outputPath);

      const newAvatarUrl = `/uploads/${filename}`;

      (user as any).avatar = newAvatarUrl;
      await user.save();

      const io = req.app.get("io");
      if (io) {
        io.emit("avatarUpdated", {
          userId: (user._id as any).toString(),
          avatar: newAvatarUrl,
        });
      }

      if (oldAvatarUrl && oldAvatarUrl.startsWith("/uploads/")) {
        const oldPath = avatarUrlToDiskPath(oldAvatarUrl);
        await fs.unlink(oldPath).catch(() => {});
      }

      return res.json({ avatar: newAvatarUrl });
    } catch (err) {
      console.error("Error updating avatar:", err);
      return res.status(500).json({ message: "Error updating avatar" });
    }
  }
);

// =========================
//  UPDATE USERNAME
// =========================
router.put("/update-username", verifyToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const raw = String(req.body?.username ?? "");
    const username = raw.trim();

    const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({
        message:
          "Invalid username (3-20 chars, letters/numbers/underscore only)",
      });
    }

    const existingUser: any = await User.findOne({ username });
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user: any = await User.findByIdAndUpdate(
      req.user._id,
      { username },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const io = req.app.get("io");
    if (io) {
      io.emit("usernameUpdated", {
        userId: user._id.toString(),
        newUsername: user.username,
      });
    }

    return res.json({ username: user.username });
  } catch (err) {
    console.error("Error updating username:", err);
    return res.status(500).json({ message: "Error updating username" });
  }
});

// =========================
// GET CURRENT USER
// =========================
router.get("/me", verifyToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user._id).select(
      "username avatar language _id"
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching user data" });
  }
});

// =========================
// DELETE ACCOUNT (transaction)
// =========================
router.delete("/me", verifyToken, async (req: AuthRequest, res) => {
  const session = await mongoose.startSession();

  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const password = String(req.body?.password ?? "");
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const userId = req.user._id;

    let oldAvatarUrl: string | undefined;

    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) {
        const e: any = new Error("User not found");
        e.status = 404;
        throw e;
      }

      const isMatch = await bcrypt.compare(password, (user as any).password);
      if (!isMatch) {
        const e: any = new Error("Incorrect password");
        e.status = 400;
        throw e;
      }

      oldAvatarUrl = (user as any).avatar;

      await FriendRequest.deleteMany({
        $or: [{ requester: userId }, { recipient: userId }],
      }).session(session);

      await Message.deleteMany({
        $or: [{ from: userId }, { to: userId }],
      }).session(session);

      await Match.deleteMany({
        $or: [{ player1: userId }, { player2: userId }],
      }).session(session);

      await FriendList.deleteOne({ user: userId }).session(session);

      await User.findByIdAndDelete(userId).session(session);
    });

    if (oldAvatarUrl && oldAvatarUrl.startsWith("/uploads/")) {
      const oldPath = avatarUrlToDiskPath(oldAvatarUrl);
      await fs.unlink(oldPath).catch(() => {});
    }

    return res.json({ success: true, message: "Account permanently deleted" });
  } catch (err: any) {
    console.error("❌ Error deleting account:", err);

    const status = err?.status ?? 500;
    const message =
      status === 404
        ? "User not found"
        : status === 400
        ? err.message
        : "Server error";

    return res.status(status).json({ message });
  } finally {
    session.endSession();
  }
});

export default router;
