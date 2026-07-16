import express, { Response } from "express";
import { Types } from "mongoose";
import { Message } from "../models/message";
import { AuthRequest, verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.use(verifyToken);

/**
 * Conversation history between the authenticated user and one other user.
 * The caller may only read a conversation they take part in.
 */
router.get("/:user1/:user2", async (req: AuthRequest, res: Response) => {
  const { user1, user2 } = req.params;
  const requesterId = req.user!._id;

  if (!Types.ObjectId.isValid(user1) || !Types.ObjectId.isValid(user2)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  if (requesterId !== user1 && requesterId !== user2) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("from to", "username avatar");

    return res.json(messages);
  } catch (err) {
    console.error("❌ Error al obtener mensajes:", err);
    res.status(500).json({ message: "Error al obtener mensajes" });
  }
});

export default router;
