"use client";

import Link from "next/link";
import { MotionTransition } from "./transition-component";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";
import { useUserStore } from "@/app/store/userStore";
import UserMenu from "@/components/userMenu";
import WalletMenu from "@/components/web3/walletMenu";
import { useHydrated } from "@/app/hooks/useHydrated";
import Image from "next/image";
import { useRouter } from "next/navigation"; 
import VerifyCodeModal from "@/components/verifyCodeModal";
import api from "@/app/lib/api";
import ForgotPasswordModal from "@/components/configs/forgotPasswordModal";
import PrivateKeyModal from "@/components/web3/privateKeyModal";
import SolPriceBadge from "@/components/web3/solPriceBadge";
import { VscGithubInverted } from "react-icons/vsc";
import { FaXTwitter } from "react-icons/fa6";
import { useEffect } from "react";
import PhantomRegisterModal from "@/components/web3/phantomRegisterModal";
import { useWalletsStore } from "@/app/store/walletsStore";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import ModalPortal from "./modalPortal";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const hydrated = useHydrated();
  const isLogged = useUserStore((s) => s.isLoggedIn());
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPrivateKeyModal, setShowPrivateKeyModal] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState("");
  const [walletPrivateKey, setWalletPrivateKey] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [showPhantomRegister, setShowPhantomRegister] = useState(false);
  const [pendingWalletPublicKey, setPendingWalletPublicKey] = useState<string | null>(null);


  const handleNeedEmailVerify = (email: string, password: string) => {
  setVerifyEmail(email);
  setVerifyPassword(password);
  setShowVerify(true);
  setResendCooldown(60);
};
useEffect(() => {
  if (resendCooldown <= 0) return;

  const interval = setInterval(() => {
    setResendCooldown((c) => c - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [resendCooldown]);
  useEffect(() => {
  const open = () => setShowPhantomRegister(true);
  window.addEventListener("open-phantom-register", open);
  return () => window.removeEventListener("open-phantom-register", open);
}, []);

  if (!hydrated) return null;
  return (
    <MotionTransition
      position="bottom"
      className="absolute z-40 inline-block w-full top-5 md:top-10 px-4 md:px-10"
    >
      <header>
        <div className="container flex items-center justify-between max-w-7xl mx-auto">
          <div
            onClick={() => router.push("/")}
             className="
    absolute left-1/2 -translate-x-1/2
    md:static md:translate-x-0
    w-[80px] h-[80px] md:mt-0 mt-7
    sm:w-[100px] sm:h-[100px]
    cursor-pointer
  "
          >
            <Image
              src="/asromav7.png"
              alt="AS Roma Logo"
              fill
              sizes="100px"
              loading="eager"
              priority
              className="object-contain"
            />
          </div>

          <div className="md:hidden flex items-center ml-auto mt-8">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md border border-white/10"
            >
              <span className="block w-5 h-0.5 bg-white mb-1"></span>
              <span className="block w-5 h-0.5 bg-white mb-1"></span>
              <span className="block w-5 h-0.5 bg-white"></span>
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {!isLogged ? (
              <>
              
                <button
    onClick={() => setShowLogin(true)}
  className="
    relative px-5 py-2 rounded-xl font-semibold text-white 
    backdrop-blur-xl  border border-orange-300
    shadow-[0_0_8px_rgba(155,165,0,0.45)]
    
    transition-all duration-300
    overflow-hidden
    hover:scale-[1.03]
              hover:border-orange-300
              hover:shadow-[0_0_20px_rgba(155,165,0,0.45)]
  "
>
  <span className="relative z-10">Login</span>

</button>
               

    <button
    onClick={() => setShowRegister(true)}
  className="
    relative px-5 py-2 rounded-xl font-semibold text-white
backdrop-blur-xl  border border-orange-700/60
shadow-[0_0_8px_rgba(255,140,0,0.3)]

transition-all duration-300
overflow-hidden
hover:scale-[1.03]
              hover:border-orange-700
              hover:shadow-[0_0_20px_rgba(255,165,0,0.45)]
  "
>
  <span className="relative z-10">Register</span>

  
</button>
                 <div className="flex items-center gap-6">
                  <a
                    href="https://github.com/ragesito"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-2 hover:text-orange-600 transition"
                    aria-label="GitHub profile"
                  >
                    <VscGithubInverted className="w-8 h-8" />
                  </a>


                  <a
                    href="https://x.com/TU_USUARIO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-2 hover:text-orange-600 transition"
                    aria-label="X profile"
                  >
                    <FaXTwitter className="w-8 h-8" />
                  </a>

                </div>
              </>
            ) : (
              <>
              <SolPriceBadge />
                <UserMenu />
                <WalletMenu />
                
                <div className="flex items-center gap-6">
                  <a
                    href="https://github.com/ragesito"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-2 hover:text-orange-600 transition"
                    aria-label="GitHub profile"
                  >
                    <VscGithubInverted className="w-8 h-8" />
                  </a>


                  <a
                    href="https://x.com/TU_USUARIO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-2 hover:text-orange-600 transition"
                    aria-label="X profile"
                  >
                    <FaXTwitter className="w-8 h-8" />
                  </a>

                </div>
              </>
            )}
          </div>
        </div>

        {menuOpen && (
  <div className="md:hidden mt-4 flex flex-col items-center gap-6 
                  bg-black/20 backdrop-blur-lg  border border-black/10 
                  rounded-2xl p-6 shadow-2xl">

    {isLogged ? (
      <div className="w-full flex flex-row justify-center items-start gap-6">

    <div className="flex justify-center">
      <UserMenu />
    </div>

    <div className="flex justify-center">
      <WalletMenu />
    </div>
      <div className="flex justify-center">
      
    </div>
      </div>
    ) : (
      <>
      <div className="w-full flex flex-row justify-center items-center gap-6">

    <button
    onClick={() => setShowLogin(true)}
  className="
    relative px-5 py-2 rounded-xl font-semibold text-white 
    backdrop-blur-xl  border border-orange-300
    shadow-[0_0_8px_rgba(155,165,0,0.45)]
    
    transition-all duration-300
    overflow-hidden
    hover:scale-[1.03]
              hover:border-orange-300
              hover:shadow-[0_0_20px_rgba(155,165,0,0.45)]
  "
>
  <span className="relative z-10">Login</span>

 
</button>

    <button
    onClick={() => setShowRegister(true)}
  className="
    relative px-5 py-2 rounded-xl font-semibold text-white
backdrop-blur-xl  border border-orange-700/60
shadow-[0_0_8px_rgba(255,140,0,0.3)]

transition-all duration-300
overflow-hidden
hover:scale-[1.03]
              hover:border-orange-700
              hover:shadow-[0_0_20px_rgba(255,165,0,0.45)]
  "
>
  <span className="relative z-10">Register</span>

  
</button>

  </div>
      </>
    )}

    <div className="w-full h-px bg-white/40"></div>

    <div className="flex items-center justify-center gap-6 mt-2">
      <a
                    href="https://github.com/ragesito"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-2 hover:text-orange-600 transition"
                    aria-label="GitHub profile"
                  >
                    <VscGithubInverted className="w-8 h-8" />
                  </a>


                  <a
                    href="https://x.com/TU_USUARIO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white flex items-center gap-2 hover:text-orange-600 transition"
                    aria-label="X profile"
                  >
                    <FaXTwitter className="w-8 h-8" />
                  </a>
    </div>

  </div>
)}

      </header>

      <LoginModal
  isOpen={showLogin}
  onClose={() => setShowLogin(false)}
  onLoginSuccess={() => setShowLogin(false)}
  onNeedEmailVerify={handleNeedEmailVerify}
  onForgotPassword={(email) => {
    setForgotEmail(email ?? "");
    setShowForgot(true);
  }}
/>

      <LoginModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onLoginSuccess={() => setShowRegister(false)}
        defaultRegister={true}
        onNeedEmailVerify={handleNeedEmailVerify}
      />
      <VerifyCodeModal
  open={showVerify}
  email={verifyEmail}
  loading={verifyLoading}
  error={verifyError}
  resendCooldown={resendCooldown} 
  onClose={() => {
    setShowVerify(false);
    setVerifyError("");
  }}
  onVerify={async (code) => {
  try {
    setVerifyLoading(true);
    setVerifyError("");

    let loginRes;

    if (verifyPassword) {
   
      const verifyRes = await api.post("/auth/verify-email", {
        email: verifyEmail,
        code,
        password: verifyPassword,
      });

      if (verifyRes.data?.wallet) {
        setPendingWalletPublicKey(verifyRes.data.wallet.publicKey);
        setWalletPublicKey(verifyRes.data.wallet.publicKey);
        setWalletPrivateKey(verifyRes.data.wallet.privateKey);
        setShowPrivateKeyModal(true);
      }

      loginRes = await api.post("/auth/login", {
        email: verifyEmail,
        password: verifyPassword,
      });

    } else {
  
      loginRes = await api.post("/auth/verify-login-otp", {
        email: verifyEmail,
        code,
      });
    }

    useUserStore.getState().setUser(loginRes.data);

    const walletsRes = await api.get("/wallets/with-balances", {
      params: { showArchived: false },
    });

    const wallets = (walletsRes.data || []).map((w: any) => ({
      ...w,
      container: "source",
      sol: w.sol ?? w.available ?? 0,
    }));

    useWalletsStore.getState().setWallets(wallets);

    const created = wallets.find(
      (w: any) => w.publicKey === pendingWalletPublicKey
    );

    const selected = created ?? wallets[0];

    if (selected) {
      useSelectedWalletStore.getState().setWallet({
        walletId: selected._id,
        shortKey: `${selected.publicKey.slice(0, 4)}...${selected.publicKey.slice(-4)}`,
        sol: selected.sol ?? 0,
      });
    }

    setShowVerify(false);

  } catch (err: any) {
    setVerifyError(err.response?.data?.message || "Invalid code");
  } finally {
    setVerifyLoading(false);
  }
}}

   onResend={async () => {
  if (resendCooldown > 0) return;

  try {
    setVerifyLoading(true);
    setVerifyError("");

    await api.post("/auth/resend-verification", {
  email: verifyEmail,
});


    setResendCooldown(60);
  } catch (err: any) {
    setVerifyError(err.response?.data?.message || "Failed to resend");
  } finally {
    setVerifyLoading(false);
  }
}}

/>
<ForgotPasswordModal
  open={showForgot}
  initialEmail={forgotEmail}
  onClose={() => {
    setShowForgot(false);
    setForgotEmail("");
  }}
/>
<PrivateKeyModal
  open={showPrivateKeyModal}
  publicKey={walletPublicKey}
  privateKey={walletPrivateKey}
  onClose={() => {
    setShowPrivateKeyModal(false);

    setWalletPrivateKey("");

    router.push("/games");
  }}
/>
  <PhantomRegisterModal
  open={showPhantomRegister}
  onClose={() => setShowPhantomRegister(false)}
  onNeedEmailVerify={handleNeedEmailVerify}
/>


    </MotionTransition>
  );
};

export default Header;
