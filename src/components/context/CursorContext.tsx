"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface CursorContextType {
    isHovered: boolean;
    setIsHovered: (hovered: boolean) => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: ReactNode }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <CursorContext.Provider value={{ isHovered, setIsHovered }}>
            {children}
        </CursorContext.Provider>
    );
}

export function useCursor() {
    const context = useContext(CursorContext);
    if (!context) {
        throw new Error("useCursor must be used within CursorProvider");
    }
    return context;
}
