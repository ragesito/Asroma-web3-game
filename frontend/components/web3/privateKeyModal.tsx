"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Copy, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PrivateKeyModalProps {
  open: boolean;
  publicKey: string;
  privateKey: string;
  onClose: () => void;
}

export default function PrivateKeyModal({
  open,
  publicKey,
  privateKey,
  onClose,
}: PrivateKeyModalProps) {
  const [showKey, setShowKey] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(privateKey);
    toast.success("Private key copied to clipboard");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="w-[92%] max-w-lg rounded-2xl bg-black/90 border border-orange-500/30 shadow-[0_0_40px_rgba(255,120,0,0.35)] p-6 text-white"
          >
            <h2 className="text-xl font-bold text-orange-400 text-center mb-2">
              Save your Recovery Key
            </h2>

            <p className="text-sm text-gray-300 text-center mb-4">
              This is the <b>ONLY</b> time you will see this key.
            </p>

            <div className="flex gap-3 items-start bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
              <AlertTriangle className="text-orange-400 mt-0.5" size={18} />
              <p className="text-xs text-orange-200">
                Anyone with this key can access your funds.  
                We cannot recover it for you.
              </p>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-400">Public address</label>
              <div className="mt-1 text-xs bg-black/40 border border-white/10 rounded-md p-2 break-all">
                {publicKey}
              </div>
            </div>

            <div className="mb-3">
              <label className="text-xs text-gray-400">Private key</label>
              <div className="mt-1 relative bg-black/40 border border-white/10 rounded-md p-3 text-xs break-all">
                <span className={showKey ? "" : "blur-sm select-none"}>
                  {privateKey}
                </span>

                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => setShowKey((s) => !s)}
                    className="text-gray-300 hover:text-white"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="text-gray-300 hover:text-white"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm */}
            <label className="flex items-center gap-2 text-xs text-gray-300 mb-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              I understand that I am responsible for this key
            </label>

            <button
              disabled={!confirmed}
              onClick={onClose}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                confirmed
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
