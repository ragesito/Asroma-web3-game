import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "../models/wallet";
import { getUserWalletKeypair } from "./walletKeypairService";
import { escrowReceiveFromKeypair } from "./escrowService";

const connection = new Connection(process.env.SOLANA_RPC_URL!);
console.log("RPC:", process.env.SOLANA_RPC_URL);

export async function lockFundsForMatch(
  walletId: string,
  amount: number
) {
  const wallet = await Wallet.findById(walletId).select("+encryptedPrivateKey");
  if (!wallet) throw new Error("WALLET_NOT_FOUND");

  const keypair = await getUserWalletKeypair(wallet);

  const balanceLamports = await connection.getBalance(keypair.publicKey);
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

  if (balanceSol < amount) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  await escrowReceiveFromKeypair(keypair, amount);

  wallet.locked += amount;
  await wallet.save();
}
