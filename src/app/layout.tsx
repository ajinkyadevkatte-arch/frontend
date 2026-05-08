import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Investor Membership CRM",
  description: "Manage Telegram investors and memberships efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#f4f7fa] text-[#1a202c]`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
