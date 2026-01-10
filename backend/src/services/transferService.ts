import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { Wallet } from "../models/wallet";
import { getSolBalance } from "./solanaService";
import { decryptWithKey, getOrCreateUserWalletMasterKey } from "./walletServiceHelpers";

const RPC_URL = process.env.SOLANA_RPC_URL!;
const connection = new Connection(RPC_URL, "confirmed");

interface TransferArgs {
  userId: string;
  fromWalletId: string;
  toPublicKey: string;
  amount: number; 
}

export async function transferSol({
  userId,
  fromWalletId,
  toPublicKey,
  amount,
}: TransferArgs): Promise<string> {

  const wallet = await Wallet.findOne({
    _id: fromWalletId,
    owner: userId,
    archived: false,
  }).select("+encryptedPrivateKey");

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (!["internal", "imported"].includes(wallet.type)) {
    throw new Error("Wallet type cannot send transactions");
  }

  if (!wallet.encryptedPrivateKey) {
    throw new Error("Private key not available");
  }

  // 2️⃣ Balance check (on-chain)
  const balance = await getSolBalance(wallet.publicKey);

  if (amount > balance) {
    throw new Error("Insufficient balance");
  }

  // 3️⃣ Decrypt private key
  const wmk = await getOrCreateUserWalletMasterKey(userId);
  const privateKeyBase58 = decryptWithKey(wallet.encryptedPrivateKey, wmk);

  const senderKeypair = Keypair.fromSecretKey(
    bs58.decode(privateKeyBase58)
  );

  // 4️⃣ Build transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderKeypair.publicKey,
      toPubkey: new PublicKey(toPublicKey),
      lamports: Math.round(amount * 1e9), 
    })
  );

  transaction.feePayer = senderKeypair.publicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  // 5️⃣ Sign & send
  const signature = await connection.sendTransaction(transaction, [
    senderKeypair,
  ]);

  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}
