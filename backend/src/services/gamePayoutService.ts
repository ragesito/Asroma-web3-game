import { Wallet } from "../models/wallet";
import { escrowPayout, escrowFee } from "./escrowService";
import { PublicKey } from "@solana/web3.js";

export async function settleMatch({
  winnerWalletId,
  loserWalletId,
  stake,
}: {
  winnerWalletId: string;
  loserWalletId: string;
  stake: number;
}) {
  const pot = stake * 2;
  const fee = pot * 0.02;
  const payout = pot - fee;

  const winnerWallet = await Wallet.findById(winnerWalletId);
  if (!winnerWallet) throw new Error("WINNER_WALLET_NOT_FOUND");

  await escrowPayout(
    new PublicKey(winnerWallet.publicKey),
    payout
  );

  await escrowFee(fee);

  winnerWallet.locked -= stake;
  winnerWallet.available += payout;
  await winnerWallet.save();

  const loserWallet = await Wallet.findById(loserWalletId);
  if (loserWallet) {
    loserWallet.locked -= stake;
    await loserWallet.save();
  }
}
