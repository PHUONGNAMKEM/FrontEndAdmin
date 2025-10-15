import { create } from "zustand";
import { ReactNode } from "react";

interface HeaderStore {
    headerContent: ReactNode | null;
    setHeaderContent: (content: ReactNode | null) => void;
}

export const useHeaderStore = create<HeaderStore>((set) => ({
    headerContent: null,
    setHeaderContent: (content) => set({ headerContent: content }),
}));
