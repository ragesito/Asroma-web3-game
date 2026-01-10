import { Schema, model, Document, Types } from "mongoose";

export interface IMatch extends Document {
  player1: Types.ObjectId;
  player2: Types.ObjectId;
  winner: Types.ObjectId | null;
  score: { p1: number; p2: number };
  mode: "ranked" | "private";
  seasonId: Types.ObjectId | null;
  isRanked: boolean;
  stake: number;
  createdAt: Date;
}


const MatchSchema = new Schema<IMatch>({
  player1: { type: Schema.Types.ObjectId, ref: "User", required: true },
  player2: { type: Schema.Types.ObjectId, ref: "User", required: true },
  winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
  score: {
    p1: { type: Number, required: true },
    p2: { type: Number, required: true },
  },
  mode: { type: String, enum: ["ranked", "private"], default: "ranked" },
  seasonId: { type: Schema.Types.ObjectId, ref: "Season", default: null },
  isRanked: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  stake: {
  type: Number,
  required: true,
  min: 0,
},

});


export const Match = model<IMatch>("Match", MatchSchema);
