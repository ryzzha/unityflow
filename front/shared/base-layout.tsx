"use client";

import Navigation from "@/components/navigation";
import { useMainContext } from "@/context/main-context";
import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
    const { isMenuOpen } = useMainContext();

  return (
    <div className="w-full h-screen flex font-[family-name:var(--font-geist-sans)]">
      <div className="w-1/6 h-screen hidden md:block sticky inset-y-0 min-w-[10%]">
        <Navigation />
      </div>

      <div className={`${isMenuOpen ? "w-full" : "w-full" } h-auto p-5 my-1 md:p-10 inset-x-0 overflow-y-hidden z-10 border border-gray-600`}>
        {children}
      </div>
    </div>
  );
}