"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header";
import TransitionPage from "@/components/transition-page";
import api from "@/app/lib/api";
import Particles from "@/components/spaceParticles";
// Web3 UI components
import WalletActionsBar from "@/components/web3/walletActionsBar";
import WalletContainer from "@/components/web3/walletContainer";
import WalletSourceList from "@/components/web3/walletSourceList";
import WalletRow from "@/components/web3/walletRow";
import WalletOrigin from "@/components/web3/walletOrigin";
import { useSelectedWalletStore } from "@/app/store/walletStore";
import PrivateKeyRequest from "@/components/web3/privateKeyRequestl";
import WalletDestination from "@/components/web3/walletDestination";
import TransferModal from "@/components/web3/transferModal";
import { useWalletsStore } from "@/app/store/walletsStore";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { t } from "i18next";

type WalletContainer = "source" | "origin" | "destination";
interface Wallet {
  _id: string;
  name: string;
  publicKey: string;
  type: "internal" | "phantom" | "imported";
  archived: boolean;
  sol: number;
  container: WalletContainer;
}

const SkeletonWallet = () => (
  <div className="h-14 rounded-lg bg-white/5 animate-pulse" />
);

export default function WalletsPage() {
  const wallets = useWalletsStore((s) => s.wallets);
  const setWallets = useWalletsStore((s) => s.setWallets);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(true);
  const { walletId, shortKey, setWallet } = useSelectedWalletStore();
  const [exportWalletId, setExportWalletId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [draggingWallet, setDraggingWallet] = useState<Wallet | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  


useEffect(() => {
  if (!wallets.length) return;

  const selected = wallets.find(w => w._id === walletId);

  if (!selected) {
    const w = wallets[0];
    setWallet({
      walletId: w._id,
      shortKey: `${w.publicKey.slice(0, 4)}...${w.publicKey.slice(-4)}`,
      sol: w.sol,
    });
  } else {
    setWallet({
      walletId: selected._id,
      shortKey: `${selected.publicKey.slice(0, 4)}...${selected.publicKey.slice(-4)}`,
      sol: selected.sol,
    });
  }
}, [wallets]);

 
 const fetchWallets = async () => {
  if (fetching) return; 

  setFetching(true);
  try {
    const res = await api.get("/wallets/with-balances", {
      params: { showArchived },
    });

    const walletsWithContainer = (res?.data || []).map((w: Wallet) => ({
      ...w,
      container: "source",
    }));

    setWallets(walletsWithContainer);
    setLoading(false);
  } finally {
    setFetching(false);
  }
};

useEffect(() => {
  fetchWallets();
}, [showArchived]);

 const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  setDraggingWallet(null);

  if (!over) return;

  const target = over.id as WalletContainer;
  const prev = useWalletsStore.getState().wallets;

  if (target === "source") {
    setWallets(
      prev.map(wallet =>
        wallet._id === active.id
          ? { ...wallet, container: "source" }
          : wallet
      )
    );
    return;
  }

  const alreadyThere = prev.find(
    w => w.container === target && w._id !== active.id
  );

  if (alreadyThere) return;

  setWallets(
    prev.map(wallet =>
      wallet._id === active.id
        ? { ...wallet, container: target }
        : wallet
    )
  );
};

    const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, 
    },
  })
);
const originWallet = wallets.find(w => w.container === "origin") ?? null;
const destinationWallet = wallets.find(w => w.container === "destination") ?? null;

  return (
    <>
      <TransitionPage />
      

      <div
        className="min-h-[100vh] bg-cover bg-center px-6 py-20 text-white"
        style={{
          backgroundImage:
            "url('/vecteezy_space-alien-planet-landscape-cosmic-background_16911692.jpg')",
        }}
      ><div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent"></div>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
        <div className="max-w-7xl mx-auto mt-20">

          {/* ACTIONS BAR */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => {
              const wallet = wallets.find(w => w._id === event.active.id);
              if (wallet) setDraggingWallet(wallet);
            }}
            onDragEnd={handleDragEnd}
          >

          {/* MAIN CONTAINER */}
         <WalletContainer>
  {/* LEFT: Source wallets (alto fijo) */}
  <WalletSourceList
    onWalletsChanged={fetchWallets}
    showArchived={showArchived}
    onToggleArchived={() => setShowArchived(v => !v)}
    className="h-[630px]"
  >
    {!loading && wallets.length === 0 && (
      <p className="text-sm text-gray-400">No wallets found.</p>
    )}

    {!loading &&
  wallets
  .filter(wallet => wallet.container === "source")
  .map(wallet => {

    return (
      <WalletRow
        key={wallet._id}
        walletId={wallet._id}
        name={wallet.name}
        shortKey={`${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(-4)}`}
        publicKey={wallet.publicKey}
        archived={wallet.archived}
        sol={wallet.sol} // ✅ ESTA LÍNEA
        onRenamed={fetchWallets}
        onShowPrivateKey={() => setExportWalletId(wallet._id)}
      />
    );
  })}

  </WalletSourceList>

  {/* RIGHT: 2 panels stacked (misma altura total que la izquierda) */}
  <div className="h-[630px] flex flex-col gap-3 min-h-0">
    {/* TOP */}
    <div className="flex-1 min-h-0">
       
      <WalletOrigin
  wallet={wallets.find(w => w.container === "origin") ?? null}
/>
    </div>

    {/* BOTTOM */}
    <div className="flex-1 min-h-0 ">
      <WalletDestination
  wallet={destinationWallet}
  originWallet={originWallet}
  onStartTransfer={() => setShowTransfer(true)}
/>
    </div>
  </div>
</WalletContainer>
<DragOverlay>
  {draggingWallet ? (
    <div className="rounded-lg  border border-orange-500 text-white shadow-xl">
      <WalletRow
        key={draggingWallet._id}
        walletId={draggingWallet._id}
        name={draggingWallet.name}
        shortKey={`${draggingWallet.publicKey.slice(0, 4)}...${draggingWallet.publicKey.slice(-4)}`}
        publicKey={draggingWallet.publicKey}
        archived={draggingWallet.archived}
        sol={draggingWallet.sol}
        onRenamed={fetchWallets}
      />
    </div>
  ) : null}
</DragOverlay>


</DndContext>
          
        </div>
        {exportWalletId && (
  <PrivateKeyRequest
    walletId={exportWalletId}
    onClose={() => setExportWalletId(null)}
  />
)}

      </div>
      {showTransfer && originWallet && destinationWallet && (
  <TransferModal
    fromWallet={originWallet}
    toWallet={destinationWallet}
    onClose={() => setShowTransfer(false)}
    onSuccess={() => {
      setShowTransfer(false);
      fetchWallets(); 
    }}
  />
)}

    </>
  );
}
