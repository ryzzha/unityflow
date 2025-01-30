import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainContextProvider } from "@/context/main-context";
import BaseLayout from "@/shared/base-layout";
import { ContractsProvider } from "@/context/contracts-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnityFlow",
  description: ":)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <MainContextProvider>
        <ContractsProvider>
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <BaseLayout>{children}</BaseLayout>
          </body>
        </ContractsProvider>
      </MainContextProvider>
    </html>
  );
}
