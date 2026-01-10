import { Wallet } from "../models/wallet";
import { getSolBalance } from "./solanaService";

export async function syncWalletBalance(walletId: string) {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new Error("WALLET_NOT_FOUND");

  const onChainBalance = await getSolBalance(wallet.publicKey);

  wallet.available = Math.max(onChainBalance - wallet.locked, 0);
  await wallet.save();

  return wallet;
}
