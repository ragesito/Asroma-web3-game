export default function WalletContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
      {children}
    </div>
  );
}
