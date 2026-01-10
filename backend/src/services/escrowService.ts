import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");

const escrowKeypair = Keypair.fromSecretKey(
  bs58.decode(process.env.ESCROW_PRIVATE_KEY!)
);

const feePublicKey = new PublicKey(process.env.FEE_PUBLIC_KEY!);

export async function escrowReceiveFromKeypair(
  from: Keypair,
  amount: number
) {
  return send(from, escrowKeypair.publicKey, amount);
}

export async function escrowPayout(
  to: PublicKey,
  amount: number
) {
  return send(escrowKeypair, to, amount);
}

export async function escrowFee(amount: number) {
  return send(escrowKeypair, feePublicKey, amount);
}

async function send(
  from: Keypair,
  to: PublicKey,
  amount: number
) {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: Math.round(amount * 1e9),
    })
  );

  tx.feePayer = from.publicKey;
  tx.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  const sig = await connection.sendTransaction(tx, [from]);
  await connection.confirmTransaction(sig, "confirmed");

  return sig;
}
