import mongoose, { Schema, Document } from "mongoose";

export interface IFriendRequest extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
}

const schema = new Schema<IFriendRequest>(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const FriendRequest = mongoose.model<IFriendRequest>("FriendRequest", schema);
