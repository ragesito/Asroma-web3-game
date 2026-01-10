import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { IWallet } from "../models/wallet";
import {
  decryptWithKey,
  getOrCreateUserWalletMasterKey,
} from "./walletServiceHelpers";

export async function getUserWalletKeypair(wallet: IWallet): Promise<Keypair> {
  if (!wallet.encryptedPrivateKey) {
    throw new Error("PRIVATE_KEY_NOT_AVAILABLE");
  }

  const userId = wallet.owner.toString();

  const masterKey = await getOrCreateUserWalletMasterKey(userId);

  const privateKeyBase58 = decryptWithKey(
    wallet.encryptedPrivateKey,
    masterKey
  );

  return Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
}
