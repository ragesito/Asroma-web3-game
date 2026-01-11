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
  description: "Crypto RPS Game",
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
