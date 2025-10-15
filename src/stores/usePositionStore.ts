import { fetchPositionAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Position } from "src/types/position/Position";

import { create } from "zustand";

interface PositionStore {
    positions: Position[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchPosition: (current?: number, pageSize?: number) => Promise<void>;
    // addUser?: (formData: FormData) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const usePositionStore = create<PositionStore>((set, get) => ({
    positions: [],
    meta: null,
    isModalOpen: false,

    fetchPosition: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchPositionAPI(current, pageSize);
            const data = res.data[0];
            const positions = data.result;
            const meta = data.meta;
            console.log(">>> check res: ", res)
            console.log(">>> check positions: ", positions)

            set({ positions, meta });
        } catch (err) {
            console.error("Fetch positions failed:", err);
        }
    },

    // addEmployee: async (formData) => {
    //     try {
    //         const res = await createEmployeeAPI(formData);
    //         const created = res.data.data || res.data;
    //         set({ users: [...get().users, created] });
    //     } catch (err) {
    //         console.error("Add employee failed:", err);
    //     }
    // },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));