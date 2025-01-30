import Navigation from "@/components/navigation";
import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="w-full h-screen absolute overflow-hidden flex font-[family-name:var(--font-geist-sans)]">
      <Navigation />
      
      <div className="w-full h-screen px-32 py-3 border-2 border-orange-600">
        {children}
      </div>
    </div>
  );
}