import AuthGuard from "@/components/authGuard";

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
