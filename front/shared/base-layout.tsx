import Navigation from "@/components/navigation";
import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

export default function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="w-full h-screen absolute overflow-y-scroll flex font-[family-name:var(--font-geist-sans)]">
      <Navigation />
      
      <div className="w-full h-screen px-5 sm:px-10 lg:px-20 xl:px-28 py-5 ">
        {children}
      </div>
    </div>
  );
}