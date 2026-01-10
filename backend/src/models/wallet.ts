import mongoose, { Schema, Document, Types } from "mongoose";

export type WalletType = "internal" | "phantom" | "imported";

export interface IWallet extends Document {
  owner: Types.ObjectId;
  name: string;
  type: WalletType;
  publicKey: string;
  encryptedPrivateKey?: string; 
  archived: boolean;
  createdAt: Date;
  available: number; 
  locked: number;   
}

const walletSchema = new Schema<IWallet>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      default: "AsromaWallet",
    },

    type: {
      type: String,
      enum: ["internal", "phantom", "imported"],
      required: true,
    },

    publicKey: {
      type: String,
      required: true,
      index: true,
    },

    encryptedPrivateKey: {
        type: String,
        required: function (this: any) {
            return this.get("type") === "internal";
        },
        select: false,
        },

      available: {
          type: Number,
          default: 0,
        },

      locked: {
        type: Number,
        default: 0,
      },
    
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

walletSchema.index({ owner: 1, publicKey: 1 }, { unique: true });

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
