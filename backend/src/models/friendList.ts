import mongoose from "mongoose";

const friendListSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  friends: [
    {
      username: { type: String, required: true },
      avatar: { type: String, default: "/uploads/default-avatar.jpg" },
    },
  ],
});

export const FriendList = mongoose.model("FriendList", friendListSchema);
