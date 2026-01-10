"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
interface VerifyCodeModalProps {
  open: boolean;
  email: string;
  onResend: () => void;
  onVerify: (code: string) => void;
  loading?: boolean;
  error?: string;
  onClose: () => void;
  resendCooldown: number;
}

export default function VerifyCodeModal({
  open,
  email,
  onResend,
  onVerify,
  onClose,
  loading = false,
  error,
  resendCooldown,
}: VerifyCodeModalProps) {
  const [code, setCode] = useState("");
    useEffect(() => {
  if (open) setCode("");
}, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        
        >
          <motion.div
           
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="
              relative
              bg-black/90
              border border-orange-500/30
              rounded-xl
              p-8
              w-[90%]
              max-w-md
              shadow-[0_0_40px_#ff7a1840]
              text-white
            "
          >
            <h2 className="text-2xl font-bold text-orange-400 mb-3 text-center">
              Verify your email
            </h2>

            <p className="text-gray-300 text-sm leading-relaxed mb-6 text-center">
              We sent a 6-digit verification code to  
              <br />
              <span className="text-orange-300 font-semibold">{email}</span>
            </p>

            <div className="mt-4">
              <label className="text-sm text-gray-400">
                Enter verification code
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, ""))
                }
                className="
                  w-full
                  mt-2
                  px-4
                  py-3
                  text-center
                  tracking-[0.4em]
                  text-lg
                  font-semibold
                  rounded-md
                  bg-black/40
                  border border-orange-500/40
                  focus:outline-none
                  focus:border-orange-400
                "
                placeholder="••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-3 text-center">
                {error}
              </p>
            )}

            <div className="flex items-center justify-center mt-6">
              <button
                disabled={loading || code.length !== 6}
                onClick={() => onVerify(code)}
                className={`
                  px-6 py-2 rounded-md font-semibold transition
                  ${
                    loading || code.length !== 6
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700"
                  }
                `}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              


            </div>
             <div className="flex items-center justify-center mt-6">
             <button
  onClick={onResend}
  disabled={loading || resendCooldown > 0}
  className="mt-4 text-sm text-orange-400 hover:underline disabled:opacity-50"
>
  {resendCooldown > 0
    ? `Resend available in ${resendCooldown}s`
    : "Resend code"}
</button></div>
            <p className="text-xs text-gray-500 mt-6 text-center">
              Didn’t receive the code?  
              <br />
              Check your spam folder.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
