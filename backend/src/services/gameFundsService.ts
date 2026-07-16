import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "../models/wallet";
import { getUserWalletKeypair } from "./walletKeypairService";
import { escrowReceiveFromKeypair, escrowPayout } from "./escrowService";

const connection = new Connection(process.env.SOLANA_RPC_URL!);

/**
 * The staking wallet is also the fee payer, so it needs the stake plus room
 * for the transaction fee. A base transfer is 5000 lamports per signature;
 * the margin absorbs fee variation so the balance check can't pass while the
 * on-chain transfer fails for want of a few lamports.
 */
const FEE_HEADROOM_LAMPORTS = 15_000;

export interface StakingPlayer {
  ownerId: string;
  walletId: string;
}

/**
 * Resolve a player's wallet to a spendable keypair.
 *
 * ownerId is required and checked: this decrypts the wallet's private key, so
 * resolving by wallet id alone would let any caller spend any user's balance.
 */
async function loadStakingKeypair(
  { ownerId, walletId }: StakingPlayer,
  amount: number
): Promise<Keypair> {
  const wallet = await Wallet.findOne({
    _id: walletId,
    owner: ownerId,
    archived: false,
  }).select("+encryptedPrivateKey");
  if (!wallet) throw new Error("WALLET_NOT_FOUND");

  const keypair = await getUserWalletKeypair(wallet);

  const balanceLamports = await connection.getBalance(keypair.publicKey);
  const requiredLamports =
    Math.round(amount * LAMPORTS_PER_SOL) + FEE_HEADROOM_LAMPORTS;

  if (balanceLamports < requiredLamports) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  return keypair;
}

/**
 * Move both players' stakes into escrow for a match.
 *
 * Both wallets are resolved and balance-checked before any funds move, so the
 * common failure (one player can't cover the stake) costs nothing. If the
 * second transfer still fails on-chain, the first is refunded — otherwise
 * player 1's stake sits in escrow for a match that never started.
 */
export async function lockFundsForBothPlayers(
  p1: StakingPlayer,
  p2: StakingPlayer,
  amount: number
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const [k1, k2] = await Promise.all([
    loadStakingKeypair(p1, amount),
    loadStakingKeypair(p2, amount),
  ]);

  await escrowReceiveFromKeypair(k1, amount);

  try {
    await escrowReceiveFromKeypair(k2, amount);
  } catch (err) {
    try {
      await escrowPayout(k1.publicKey, amount);
    } catch (refundErr) {
      // The refund is the last line of defence. If it fails the stake is
      // stranded in escrow, so log everything needed to return it by hand.
      console.error("🚨 STRANDED STAKE: escrow refund failed", {
        walletId: p1.walletId,
        ownerId: p1.ownerId,
        publicKey: k1.publicKey.toBase58(),
        amount,
        refundErr,
      });
    }
    throw err;
  }
}
