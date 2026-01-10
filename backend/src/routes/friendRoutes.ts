import express from "express";
import { verifyToken, AuthRequest } from "../middleware/authMiddleware";
import { FriendList } from "../models/friendList";
import { FriendRequest } from "../models/friendRequest";
import { User } from "../models/user";
import { io } from "../server";
const router = express.Router();

// =========================
// GET MY FRIENDS
// =========================
router.get("/me", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    const list = await FriendList.findOne({ user: userId });
    if (!list) return res.json({ friends: [] });

    const friends = await User.find(
      { _id: { $in: list.friends.map(f => f._id) } },
      "username avatar"
    ).lean();

    return res.json({ friends });
  } catch {
    return res.status(500).json({ message: "Error fetching friends" });
  }
});

// =========================
// GET MY REQUESTS
// =========================
router.get("/requests/me", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;

    const pending = await FriendRequest.find({
      recipient: userId,
      status: "pending",
    })
      .populate("requester", "username avatar")
      .lean();

    return res.json(
      pending.map((r: any) => ({
        _id: r.requester._id.toString(),
        username: r.requester.username,
        avatar: r.requester.avatar || "/uploads/default-avatar.jpg",
      }))
    );
  } catch {
    return res.status(500).json({ message: "Error fetching requests" });
  }
});

// =========================
// SEND REQUEST
// =========================
router.post("/request", verifyToken, async (req: AuthRequest, res) => {
  try {
    const requesterId = req.user!._id;
    const username = String(req.body?.recipient || "").trim();

    if (!username) return res.status(400).json({ message: "Invalid recipient" });

    const recipient = await User.findOne({ username }).lean();;
    if (!recipient) return res.status(404).json({ message: "User not found" });

    if (recipient._id.toString() === requesterId.toString()) {
  return res.status(400).json({ message: "Cannot add yourself" });
}


    const alreadyFriend = await FriendList.exists({
      user: requesterId,
      "friends._id": recipient._id,
    });

    if (alreadyFriend)
      return res.status(400).json({ message: "Already friends" });

    const pending = await FriendRequest.exists({
      requester: requesterId,
      recipient: recipient._id,
      status: "pending",
    });

    if (pending)
      return res.status(400).json({ message: "Request already sent" });

    await FriendRequest.create({
      requester: requesterId,
      recipient: recipient._id,
    });

    return res.json({
  message: "Friend request sent",
  recipientId: recipient._id.toString(),
});

  } catch {
    return res.status(500).json({ message: "Error sending request" });
  }
});

// =========================
// ACCEPT REQUEST
// =========================
router.post("/accept", verifyToken, async (req: AuthRequest, res) => {
  try {
    const recipientId = req.user!._id;
    const username = String(req.body?.requester || "").trim();

    const requester = await User.findOne({ username }).lean();
    if (!requester)
      return res.status(404).json({ message: "User not found" });

    const request = await FriendRequest.findOne({
      requester: requester._id,
      recipient: recipientId,
      status: "pending",
    });

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    await FriendList.updateOne(
      { user: requester._id },
      { $addToSet: { friends: { _id: recipientId } } },
      { upsert: true }
    );

    await FriendList.updateOne(
      { user: recipientId },
      { $addToSet: { friends: { _id: requester._id } } },
      { upsert: true }
    );

    await FriendRequest.deleteOne({ _id: request._id });

   return res.json({
  message: "Request accepted",
  requester: {
    _id: requester._id.toString(),
    username: requester.username,
    avatar: requester.avatar || "/uploads/default-avatar.jpg",
  },
  recipient: {
    _id: recipientId.toString(),
  },
});
  } catch {
    return res.status(500).json({ message: "Error accepting request" });
  }
});

// =========================
// FRIEND STATUS
// =========================
router.get("/status/:username", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const username = req.params.username;

    const other = await User.findOne({ username });
    if (!other)
      return res.status(404).json({ message: "User not found" });

    const areFriends = await FriendList.exists({
      user: userId,
      "friends._id": other._id,
    });

    const sent = await FriendRequest.exists({
      requester: userId,
      recipient: other._id,
      status: "pending",
    });

    const received = await FriendRequest.exists({
      requester: other._id,
      recipient: userId,
      status: "pending",
    });

    return res.json({
      areFriends: !!areFriends,
      sentRequest: !!sent,
      receivedRequest: !!received,
    });
  } catch {
    return res.status(500).json({ message: "Error checking status" });
  }
});

router.post("/decline", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const username = String(req.body?.requester || "").trim();

    const requester = await User.findOne({ username }).lean();
    if (!requester)
      return res.status(404).json({ message: "User not found" });

    await FriendRequest.deleteOne({
      requester: requester._id,
      recipient: userId,
      status: "pending",
    });

    return res.json({ message: "Request declined" });
  } catch {
    return res.status(500).json({ message: "Error declining request" });
  }
});

// =========================
// REMOVE FRIEND
// =========================
router.post("/remove", verifyToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!._id;
    const username = String(req.body?.friend || "").trim();

    if (!username)
      return res.status(400).json({ message: "Invalid friend" });

    const friend = await User.findOne({ username }).lean();
    if (!friend)
      return res.status(404).json({ message: "User not found" });

    await FriendList.updateOne(
      { user: userId },
      { $pull: { friends: { _id: friend._id } } }
    );

    await FriendList.updateOne(
      { user: friend._id },
      { $pull: { friends: { _id: userId } } }
    );

    io.to(userId.toString()).emit("friend:removed", {
      from: friend.username,
    });

    io.to(friend._id.toString()).emit("friend:removed", {
      from: req.user!.username,
    });

    return res.json({ message: "Friend removed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error removing friend" });
  }
});

export default router;
