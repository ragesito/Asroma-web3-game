import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/* ------------------------------------------------ */
/* STEP 1: prequest challenge                       */
/* ------------------------------------------------ */
export async function phantomStartChallenge(publicKey: string) {
  const res = await axios.post(`${API_URL}/auth/phantom/challenge`, {
    publicKey,
  });

  return res.data as {
    challengeId: string;
    message: string;
    expiresAt: string;
  };
}

/* ------------------------------------------------ */
/* STEP 2: verift sign                              */
/* ------------------------------------------------ */
export async function phantomVerifySignature(
  challengeId: string,
  signature: string
) {
  const res = await axios.post(`${API_URL}/auth/phantom/verify`, {
    challengeId,
    signature,
  });

  return res.data as
    | {
        status: "LOGIN";
        token: string;
        username: string;
        id: string;
        avatar: string;
      }
    | {
        status: "SETUP_REQUIRED";
        phantomToken: string;
        phantomPublicKey: string;
      };
}

/* ------------------------------------------------ */
/* STEP 3: completar registro con email/pass        */
/* ------------------------------------------------ */
export async function phantomCompleteRegistration(params: {
  phantomToken: string;
  username: string;
  email: string;
  password: string;
}) {
  const res = await axios.post(
    `${API_URL}/auth/phantom/complete`,
    params
  );

  return res.data;
}
