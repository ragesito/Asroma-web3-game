import crypto from "crypto";
import { redis } from "../config/redis";

const CHALLENGE_TTL_SECONDS = 5 * 60; 
const PREFIX = "phantom:challenge:";

export type PhantomChallenge = {
  id: string;
  message: string;
  publicKey: string;
  domain: string;
  issuedAt: string;
  expiresAt: string;
};

function isoNow() {
  return new Date().toISOString();
}

function isoPlusMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

export function buildChallengeMessage(args: {
  domain: string;
  publicKey: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
}) {

  return [
    `${args.domain} wants you to sign in with your Solana account:`,
    `${args.publicKey}`,
    ``,
    `Nonce: ${args.nonce}`,
    `Issued At: ${args.issuedAt}`,
    `Expiration Time: ${args.expiresAt}`,
  ].join("\n");
}

export async function createPhantomChallenge(params: {
  publicKey: string;
  domain: string;
}) {
  const id = crypto.randomUUID();
  const nonce = crypto.randomBytes(16).toString("hex");
  const issuedAt = isoNow();
  const expiresAt = isoPlusMinutes(5);

  const message = buildChallengeMessage({
    domain: params.domain,
    publicKey: params.publicKey,
    nonce,
    issuedAt,
    expiresAt,
  });

  const payload: PhantomChallenge = {
    id,
    message,
    publicKey: params.publicKey,
    domain: params.domain,
    issuedAt,
    expiresAt,
  };

  await redis.set(
    `${PREFIX}${id}`,
    JSON.stringify(payload),
    "EX",
    CHALLENGE_TTL_SECONDS
  );

  return payload;
}

export async function getPhantomChallenge(id: string) {
  const raw = await redis.get(`${PREFIX}${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as PhantomChallenge;
}

export async function consumePhantomChallenge(id: string) {
  await redis.del(`${PREFIX}${id}`);
}
