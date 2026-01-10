"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import VerifyCodeModal from "@/components/verifyCodeModal";
import { motion, AnimatePresence } from "framer-motion";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export default function ForgotPasswordModal({
  open,
  onClose,
  initialEmail = "",
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // cooldown resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const i = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(i);
  }, [resendCooldown]);

  // reset internal state on close
  useEffect(() => {
    if (!open) {
      setStep("email");
      setEmail(initialEmail);
      setCode("");
      setPassword("");
      setConfirm("");
      setError("");
      setResendCooldown(0);
    }
  }, [open, initialEmail]);

  // STEP 1 → send reset code
  const requestReset = async () => {
    if (!email) {
      setError("Enter your email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/request-password-reset", {
        email,
      });


      setResendCooldown(60);
      setStep("verify");
    } catch (err: any) {
      setError("Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → verify code
  const verifyCode = async (c: string) => {
    try {
      setLoading(true);
      setError("");

      await api.post("/auth/verify-password-reset", {
        email,
        code: c,
      });


      setCode(c);
      setStep("reset");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 → reset password
  const resetPassword = async () => {
    if (!password || password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/auth/reset-password", {
        email,
        code,
        newPassword: password,
      });


      onClose();
    } catch (err: any) {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
        >
          <motion.div
            className="bg-black/90 border border-orange-500/30 rounded-xl p-6 w-full max-w-md text-white"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* STEP 1 */}
            {step === "email" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Reset password
                </h2>

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 rounded bg-white/10 mb-3"
                />

                {error && (
                  <p className="text-red-400 text-sm mb-2 text-center">
                    {error}
                  </p>
                )}

                <button
                  onClick={requestReset}
                  disabled={loading}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded"
                >
                  {loading ? "Sending..." : "Send reset code"}
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === "verify" && (
              <VerifyCodeModal
                open={true}
                email={email}
                loading={loading}
                error={error}
                resendCooldown={resendCooldown}
                onClose={onClose}
                onVerify={verifyCode}
                onResend={requestReset}
              />
            )}

            {/* STEP 3 */}
            {step === "reset" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Set new password
                </h2>

                <input
                  type="password"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 rounded bg-white/10 mb-2"
                />

                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full p-2 rounded bg-white/10 mb-3"
                />

                {error && (
                  <p className="text-red-400 text-sm mb-2 text-center">
                    {error}
                  </p>
                )}

                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 rounded"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
