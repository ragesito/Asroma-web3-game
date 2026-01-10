import crypto from "crypto";
import { User } from "../models/user";

/* -------------------------------------------------------------------------- */
/* 🔐 MASTER KEY HELPERS                                                       */
/* -------------------------------------------------------------------------- */

function getServerMasterKey(): Buffer {
  const secret = process.env.WALLET_MASTER_SECRET;
  if (!secret) throw new Error("WALLET_MASTER_SECRET missing");
  return crypto.scryptSync(secret, "asroma-wallet-master", 32);
}

export async function getOrCreateUserWalletMasterKey(
  userId: string
): Promise<Buffer> {
  const user = await User.findById(userId).select("+walletMasterKeyEnc");
  if (!user) throw new Error("User not found");

  if (!user.walletMasterKeyEnc) {
    const rawKey = crypto.randomBytes(32);
    const serverKey = getServerMasterKey();

    user.walletMasterKeyEnc = encryptWithKey(
      rawKey.toString("base64"),
      serverKey
    );
    await user.save();

    return rawKey;
  }

  const serverKey = getServerMasterKey();
  const rawB64 = decryptWithKey(user.walletMasterKeyEnc, serverKey);
  return Buffer.from(rawB64, "base64");
}

export function encryptWithKey(plain: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptWithKey(ciphertext: string, key: Buffer): string {
  const buffer = Buffer.from(ciphertext, "base64");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encryptedData = buffer.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
