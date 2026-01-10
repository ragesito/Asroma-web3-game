"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/app/lib/api";
import { useRouter } from "next/navigation"; 
import { useUserStore } from "@/app/store/userStore";
import PhantomIcon from "./phantomIcon";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import bs58 from "bs58";
import {
  phantomStartChallenge,
  phantomVerifySignature,

} from "@/app/lib/phantomAuth";
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, username: string) => void;
  defaultRegister?: boolean; 
  onNeedEmailVerify?: (email: string, password: string) => void;
  onForgotPassword?: (email?: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess,  onNeedEmailVerify, onForgotPassword,defaultRegister = false, }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState<boolean>(defaultRegister); 
  const router = useRouter();
  const [phantomLoading, setPhantomLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

 const handleLogin = async () => {
  if (!email || !password) {
    setError("All fields are required.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const res = await api.post("/auth/login", {
      email,
      password,
    });

    useUserStore.getState().setUser(res.data);

    onLoginSuccess(res.data.token, res.data.username);
    onClose();
    router.push("/games");
  } catch (err: any) {
    if (err.response?.data?.code === "EMAIL_NOT_VERIFIED") {
      onClose();
      onNeedEmailVerify?.(email, password);
      return;
    }
    if (err.response?.data?.code === "OTP_REQUIRED") {
    onClose();

    onNeedEmailVerify?.(email, "");
    return;
  }
    setError(err.response?.data?.message || "Failed to log in.");
  } finally {
    setLoading(false);
  }
};



const handleRegister = async () => {
  if (!username || !email || !password) {
    setError("All fields are required.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    await api.post("/auth/register", {
      username,
      email,
      password,
    });

    onClose();

    onNeedEmailVerify?.(email, password);
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to register.");
  } finally {
    setLoading(false);
  }
};

const handlePhantomAuth = async () => {
  try {
    setError("");
    setPhantomLoading(true);

    const provider = (window as any)?.solana;

    if (!provider || !provider.isPhantom) {
      setError("Phantom wallet not found");
      return;
    }

    const resp = await provider.connect();
    const publicKey = resp.publicKey.toString();

    const challengeData = await phantomStartChallenge(publicKey);
    const challenge = challengeData.message;
    const challengeId = challengeData.challengeId;

    const encoded = new TextEncoder().encode(challenge);
    const signed = await provider.signMessage(encoded, "utf8");

    const result = await phantomVerifySignature(
      challengeId,
      bs58.encode(signed.signature)
    );

    if (result.status === "LOGIN") {
      useUserStore.getState().setUser(result);
      onClose();
      router.push("/games");
      return;
    }

    if (result.status === "SETUP_REQUIRED") {
  sessionStorage.setItem("phantomToken", result.phantomToken);
  onClose();
  window.dispatchEvent(new Event("open-phantom-register"));
}
} catch (err: any) {
  console.error(err);

  if (
    err?.message?.toLowerCase().includes("rejected") ||
    err?.code === 4001
  ) {
    setError("Signature request was cancelled");
    return;
  }

  setError("Phantom authentication failed");
} finally {
  setPhantomLoading(false);
}

};

  if (!isOpen) return null;

  return (
    <AnimatePresence>
    
      <>
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
          style={{ zIndex: 99999 }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none"
        style={{ zIndex: 99999 }}>
        <motion.div
          className="bg-black/90 text-white w-full max-w-[540px] p-6 rounded-xl shadow-xl pointer-events-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl mb-4 text-center font-semibold">
            {isRegister ? "Create Account" : "Log In"}
          </h2>

          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              className="w-full mb-2 p-2 rounded bg-white/10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 p-2 rounded bg-white/10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 rounded bg-white/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

            
          <button
            onClick={isRegister ? handleRegister : handleLogin}
            disabled={loading}
            className={`w-full p-2 rounded ${
              loading ? "bg-gray-600" : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            {loading ? "Processing..." : isRegister ? "Register" : "Login"}
          </button>

          <div className="flex items-center my-4">
  <div className="flex-grow h-px bg-gray-600/50" />
  <span className="mx-3 text-sm text-gray-400">
    {isRegister ? "Or register" : "Or"}
  </span>
  <div className="flex-grow h-px bg-gray-600/50" />
</div>

    <button
  onClick={handlePhantomAuth}
  disabled={phantomLoading}
  className="
    w-full mt-2 p-2 rounded
    bg-[#4e44ce] hover:bg-[#5b50e0]
    text-white font-medium
    transition
  "
>
  <span className="flex items-center justify-center gap-2">
    <Image
    className="rounded-full"
      src="/phantom.svg"
      alt="Phantom"
      width={25}
      height={25}
    />
    <span>
      {isRegister ? "Register with Phantom" : "Continue with Phantom"}
    </span>
  </span>
</button>

            {!isRegister && (
  <p
    className="text-sm text-orange-400 mt-3 text-center cursor-pointer hover:underline"
    onClick={() => {
      onClose();
      onForgotPassword?.(email);
    }}
  >
    Forgot password?
  </p>
)}


          <p className="text-sm text-gray-400 mt-4 text-center">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setIsRegister(false)}
                  className="text-orange-600 hover:underline cursor-pointer"
                >
                  Log in
                </span>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <span
                  onClick={() => setIsRegister(true)}
                  className="text-orange-600 hover:underline cursor-pointer"
                >
                  Register
                </span>
              </>
            )}
          </p>
        </motion.div>
        

        </div>
      </>
  
    </AnimatePresence>
  );
}
