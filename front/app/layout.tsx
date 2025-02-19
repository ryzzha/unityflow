import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainContextProvider } from "@/context/main-context";
import BaseLayout from "@/shared/base-layout";
import { ContractsProvider } from "@/context/contracts-context";
import Providers from "@/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnityFlow – Web3 Platform",
  description: "A decentralized platform built on blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <MainContextProvider>
            <ContractsProvider>
              <BaseLayout>{children}</BaseLayout>
            </ContractsProvider>
          </MainContextProvider>
        </Providers>
      </body>
    </html>
  );
}

