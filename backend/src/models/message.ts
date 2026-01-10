import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMessage extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  message: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Message =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", messageSchema);
