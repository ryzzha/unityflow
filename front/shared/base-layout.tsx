import Navigation from "@/components/navigation";
import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="w-full h-screen absolute overflow-hidden flex font-[family-name:var(--font-geist-sans)]">
      <Navigation />
      
      <div className="w-full h-screen px-28 py-3 ">
        {children}
      </div>
    </div>
  );
}