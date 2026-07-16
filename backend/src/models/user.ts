import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  verifiedAt?: Date;
  lastVerificationSentAt?: Date;
  verificationAttempts?: number;
  verificationLockedUntil?: Date;
  resetPasswordCode?: string;
  resetPasswordExpires?: Date;
  resetPasswordAttempts?: number;
  resetPasswordLockedUntil?: Date;
  lastResetSentAt?: Date;
  walletMasterKeyEnc?: string;
  phantomPublicKey?: string;
  phantomLinkedAt?: Date;
  lastStrongLoginAt?: Date;

}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "/uploads/default-avatar.jpg" },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    verifiedAt: { type: Date },
    verificationAttempts: { type: Number, default: 0 },
    verificationLockedUntil: { type: Date, default: null },
    lastVerificationSentAt: { type: Date, default: null },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    // Separate from the verification counters on purpose: sharing them would
    // let one code namespace consume the other's attempt budget.
    resetPasswordAttempts: { type: Number, default: 0 },
    resetPasswordLockedUntil: { type: Date, default: null },
    lastResetSentAt: { type: Date, default: null },
    walletMasterKeyEnc: { type: String, select: false },
    phantomPublicKey: { type: String, unique: true, sparse: true },
    phantomLinkedAt: { type: Date },
    lastStrongLoginAt: { type: Date },


  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
