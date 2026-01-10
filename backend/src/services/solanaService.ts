import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// RPC (usa env en prod)
const RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

const connection = new Connection(RPC_URL, "confirmed");
const balanceCache = new Map<
  string,
  { value: number; expiresAt: number }
>();

const BALANCE_TTL_MS = 30_000; 

export async function getSolBalance(publicKey: string): Promise<number> {
  const now = Date.now();
  const cached = balanceCache.get(publicKey);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  try {
    const key = new PublicKey(publicKey);
    const lamports = await connection.getBalance(key);
    const sol = lamports / LAMPORTS_PER_SOL;

    balanceCache.set(publicKey, {
      value: sol,
      expiresAt: now + BALANCE_TTL_MS,
    });

    return sol;
  } catch (err) {
    console.error("❌ Error obteniendo balance SOL:", err);

    return cached?.value ?? 0;
  }
}

