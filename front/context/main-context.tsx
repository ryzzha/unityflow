"use client";

import { useContext, useState } from "react";
import { createContext } from "react";

interface MainContextProps {
    isMenuOpen: boolean;
    toggleMenu: () => void;
}

const MainContext = createContext<MainContextProps>({
    isMenuOpen: true,
    toggleMenu: () => {},
});

export const useMainContext = () => useContext(MainContext);

export const MainContextProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
  
    return (
      <MainContext.Provider
        value={{ isMenuOpen, toggleMenu }}
      >
        {children}
      </MainContext.Provider>
    );
  };
  