import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Wallet } from "../models/wallet";
import { User } from "../models/user";

/* -------------------------------------------------------------------------- */
/* 🔐 CRYPTO HELPERS                                                           */
/* -------------------------------------------------------------------------- */
function getServerMasterKey(): Buffer {
  const secret = process.env.WALLET_MASTER_SECRET;
  if (!secret) throw new Error("WALLET_MASTER_SECRET missing in env");
  return crypto.scryptSync(secret, "asroma-wallet-master", 32);
}

function encryptWithKey(plain: string, key: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptWithKey(ciphertextB64: string, key: Buffer): string {
  const buffer = Buffer.from(ciphertextB64, "base64");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encryptedData = buffer.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted.toString("utf8");
}

async function getOrCreateUserWalletMasterKey(userId: string): Promise<Buffer> {

  const user = await User.findById(userId).select("+walletMasterKeyEnc");
  if (!user) throw new Error("User not found");

  if (!user.walletMasterKeyEnc) {
    const wmk = crypto.randomBytes(32); 
    const serverKey = getServerMasterKey();
    user.walletMasterKeyEnc = encryptWithKey(wmk.toString("base64"), serverKey);
    await user.save();
    return wmk;
  }

  const serverKey = getServerMasterKey();
  const wmkB64 = decryptWithKey(user.walletMasterKeyEnc, serverKey); 
  return Buffer.from(wmkB64, "base64");
}

function deriveKeyFromPassword(password: string, userId: string): Buffer {
  return crypto.scryptSync(password, userId, 32);
}

function encryptPrivateKey(
  privateKey: string,
  password: string,
  userId: string
): string {
  const iv = crypto.randomBytes(12);
  const key = deriveKeyFromPassword(password, userId);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(privateKey, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptPrivateKey(
  encrypted: string,
  password: string,
  userId: string
): string {
  const buffer = Buffer.from(encrypted, "base64");

  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encryptedData = buffer.subarray(28);

  const key = deriveKeyFromPassword(password, userId);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/* -------------------------------------------------------------------------- */
/* 🧠 WALLET SERVICE                                                           */
/* -------------------------------------------------------------------------- */

export async function createInternalWalletForUser(
  userId: string,
  name?: string,
  opts?: { returnPrivateKey?: boolean }
) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);

  const wmk = await getOrCreateUserWalletMasterKey(userId);

  const encryptedPrivateKey = encryptWithKey(privateKey, wmk);

  const walletCount = await Wallet.countDocuments({ owner: user._id });

  const wallet = await Wallet.create({
    owner: user._id,
    name: name || `Wallet ${walletCount + 1}`,
    type: "internal",
    publicKey,
    encryptedPrivateKey,
  });

  return {
    walletId: wallet._id,
    publicKey,
    name: wallet.name,
    ...(opts?.returnPrivateKey ? { privateKey } : {}),
  };
}


export async function listUserWallets(userId: string) {
  return Wallet.find({ owner: userId, archived: false }).lean();
}

export async function exportPrivateKey(
  walletId: string,
  userId: string,
  password: string
) {
  const user = await User.findById(userId).select("+walletMasterKeyEnc");
  if (!user) throw new Error("User not found");

  const wallet = await Wallet.findOne({
    _id: walletId,
    owner: userId,
  }).select("+encryptedPrivateKey");

  if (!wallet) {
    throw new Error("WALLET_NOT_FOUND");
  }

  if (wallet.type !== "internal") {
    throw new Error("CANNOT_EXPORT_IMPORTED_WALLET");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error("INVALID_PASSWORD");
  if (!wallet.encryptedPrivateKey) {
  throw new Error("PRIVATE_KEY_NOT_AVAILABLE");
}

  const wmk = await getOrCreateUserWalletMasterKey(userId);

  return decryptWithKey(wallet.encryptedPrivateKey, wmk);
}
/* -------------------------------------------------------------------------- */
/* 🧠 IMPORT WALLETS SERVICE                                                 */
/* -------------------------------------------------------------------------- */
export async function importWalletForUser(
  userId: string,
  privateKeyBase58: string,
  name?: string
) {
  let keypair: Keypair;

  try {
    const secretKey = bs58.decode(privateKeyBase58);
    keypair = Keypair.fromSecretKey(secretKey);
  } catch {
    throw new Error("INVALID_PRIVATE_KEY");
  }

  const publicKey = keypair.publicKey.toBase58();

  const existing = await Wallet.findOne({
  owner: userId,
  publicKey,
});

if (existing) {

  if (existing.archived) {
    existing.archived = false;
    await existing.save();

    return {
      walletId: existing._id,
      publicKey: existing.publicKey,
      name: existing.name,
      restored: true, 
    };
  }

  throw new Error("WALLET_ALREADY_EXISTS");
}

  const wmk = await getOrCreateUserWalletMasterKey(userId);
  const encryptedPrivateKey = encryptWithKey(privateKeyBase58, wmk);

  const walletCount = await Wallet.countDocuments({ owner: userId });

  const wallet = await Wallet.create({
    owner: userId,
    name: name || `Imported Wallet ${walletCount + 1}`,
    type: "imported",
    publicKey,
    encryptedPrivateKey,
  });

  return {
    walletId: wallet._id,
    publicKey,
    name: wallet.name,
  };
}
