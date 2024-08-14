import "./globals.css";
import { Inter } from "next/font/google";
import { WalletProvider } from "@/context/WalletContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Simple Wallet",
  description: "Create and manage Simple wallet",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body className={inter.className}>
      <WalletProvider>{children}</WalletProvider>
      </body>
      </html>
  );
}
