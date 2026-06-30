import { useContext } from "react";
import { SidebarContext } from "../context/sidebar";

export function useSidebar() {
    return useContext(SidebarContext);
}

