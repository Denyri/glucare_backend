import { useState } from "react";
import { SidebarContext } from "./sidebar";

export function SidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

