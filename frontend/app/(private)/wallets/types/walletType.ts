export type WalletType = "internal" | "phantom" | "imported";
export type WalletContainer = "source" | "origin" | "destination";

export interface Wallet {
  _id: string;
  name: string;
  publicKey: string;
  type: WalletType;
  archived: boolean;
  sol: number;
  container?: WalletContainer;
}
