import { createPositionAPI, deletePositionAPI, fetchPositionAPI, updatePositionAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Position } from "src/types/position/Position";

import { create } from "zustand";

interface PositionStore {
    positions: Position[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchPosition: (current?: number, pageSize?: number) => Promise<void>;
    addPosition?: (payload: Position) => Promise<void>;
    updatePosition?: (id: string, data: Partial<Position>) => Promise<void>;
    deletePosition?: (id: string) => Promise<void>;
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
        } catch (err: any) {
            console.error("Fetch positions failed:", err);
            throw err;
        }
    },

    addPosition: async (payload) => {
        try {
            const res = await createPositionAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ positions: [...get().positions, created] });
            }
            return created;
        } catch (err: any) {
            console.error("Thêm mới vị trí thất bại:", err);
            throw err;
        }
    },

    updatePosition: async (id, data) => {
        try {
            const res = await updatePositionAPI(id, data);
            const updated = res.data.data || res.data;

            // Cập nhật trong state
            set({
                positions: get().positions.map((e) =>
                    e.id === id ? { ...e, ...updated } : e
                ),
            });
        } catch (err: any) {
            console.error("Cập nhật vị trí thất bại:", err);
            throw err;
        }
    },

    deletePosition: async (id) => {
        try {
            const res = await deletePositionAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                // Cập nhật lại store
                set({
                    positions: get().positions.filter((e) => e.id !== id),
                });
            }
            set({ positions: get().positions.filter((e) => e.id !== id), });
        } catch (err: any) {
            console.error("Xóa vị trí thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));