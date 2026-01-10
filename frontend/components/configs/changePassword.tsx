"use client";

import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import Toast from "@/components/toast";
import ToastPortal from "@/components/toastPortal";
import VerifyCodeModal from "@/components/verifyCodeModal";
import { useTranslation } from "react-i18next";

export default function ChangePassword() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [showVerify, setShowVerify] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type?: "success" | "error" | "info";
  } | null>(null);
  useEffect(() => {
  if (resendCooldown <= 0) return;

  const interval = setInterval(() => {
    setResendCooldown((c) => c - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [resendCooldown]);

  /* -------------------------------------------------------------------------- */
  /* 📧 STEP 1: REQUEST RESET CODE                                              */
  /* -------------------------------------------------------------------------- */
  const requestReset = async () => {
    if (!email) {
      setToast({ message: "Email is required", type: "error" });
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/request-password-reset", {
        email,
      });

      setResendCooldown(60);
      setShowVerify(true);
    } catch {
      setToast({ message: "Failed to send reset code", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔐 STEP 2: VERIFY CODE                                                     */
  /* -------------------------------------------------------------------------- */
  const handleVerifyCode = async (code: string) => {
    try {
      setLoading(true);

      await api.post("/auth/verify-password-reset", {
      email,
      code,
    });


      setVerificationCode(code);
      setCodeVerified(true);
      setShowVerify(false);
    } catch {
      setToast({ message: "Invalid or expired code", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🔁 STEP 3: RESET PASSWORD                                                  */
  /* -------------------------------------------------------------------------- */
  const resetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        code: verificationCode,
        newPassword,
      });


      setToast({ message: "Password updated successfully", type: "success" });

      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setCodeVerified(false);
    } catch {
      setToast({ message: "Password reset failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* STEP 1 */}
      {!codeVerified && (
        <div className="flex flex-col gap-4 border border-white/10 bg-white/5 p-5 rounded-xl">
           <div className="flex items-center gap-2  justify-center ">
        
              <label className="text-sm text-gray-300 items-center justify-center">
                {t("enter_email_for_reset")}
              </label>
          </div>
          

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/30 p-2 rounded-md border border-white/10"
          />

          <button
            onClick={requestReset}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold"
          >
            {loading ? "Sending..." : "Send reset code"}
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {codeVerified && (
        <div className="flex flex-col gap-4 bg-gray-900/10 p-5 rounded-xl">
          <label className="text-sm text-gray-300">
            {t("new_password")}
          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-black/30 p-2 rounded-md border border-white/10"
          />

          <label className="text-sm text-gray-300">
            {t("confirm_password")}
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-black/30 p-2 rounded-md border border-white/10"
          />

          <button
            onClick={resetPassword}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md font-semibold"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </div>
      )}

      {/* VERIFY MODAL */}
      <VerifyCodeModal
        open={showVerify}
        email={email}
        loading={loading}
        onClose={() => setShowVerify(false)}
        onVerify={handleVerifyCode}
        onResend={requestReset}
        resendCooldown={resendCooldown} 
      />


      {/* TOAST */}
      {toast && (
        <ToastPortal>
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </ToastPortal>
      )}
    </>
  );
}
