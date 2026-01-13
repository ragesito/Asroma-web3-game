import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import I18nLayout from "./i18nLayout";
import ClientLayout from "./clientLayout";
import ThemeProvider from "@/app/providers/themeProvider";
import ClientRoot from "./clientRoot";
import ChatProvider from "./chatProvider";
import SocketProvider from "./socketProvider";
import FriendRequestProvider from "./friendRequestProvider";
import { WalletBalanceProvider } from "./solanaProviders";
import "./globals.css";


const urbanist = Urbanist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asroma",
  description:
    "Play Rock Paper Scissors on-chain. Predict, compete and win with Solana.",
  metadataBase: new URL("https://www.asroma.app"),
  openGraph: {
    title: "Asroma – Crypto RPS Game",
    description:
      "A Web3 Rock Paper Scissors game. Play, predict and win with Solana.",
    url: "https://www.asroma.app",
    siteName: "Asroma",
    images: [
      {
        url: "/Asroma-Logo.png",
        width: 1024,
        height: 1024,
        alt: "Asroma – Crypto RPS Game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Asroma – Crypto RPS Game",
    description:
      "A Web3 Rock Paper Scissors game. Play, predict and win with Solana.",
    images: ["/Asroma-Logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={urbanist.className}>
        <SocketProvider>
          <WalletBalanceProvider>
          <FriendRequestProvider>
        <ClientRoot>
          <ChatProvider>   
         <I18nLayout>
            <ThemeProvider>
              <ClientLayout>{children}<div id="toast-root" /></ClientLayout>
            </ThemeProvider>
          </I18nLayout>
          </ChatProvider>
        </ClientRoot>
        </FriendRequestProvider>
        </WalletBalanceProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
