import { create } from "zustand";
import {
    fetchOvertimeAPI,
    createOvertimeAPI,
    updateOvertimeAPI,
    deleteOvertimeAPI,
} from "src/services/api.services";
import { Overtime } from "src/types/overtime/Overtime";
import { PaginationMeta } from "src/types/api";

interface OvertimeStore {
    overtimes: Overtime[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    fetchOvertime: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addOvertime: (payload: Overtime) => Promise<void>;
    updateOvertime: (id: string, data: Partial<Overtime>) => Promise<void>;
    deleteOvertime: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useOvertimeStore = create<OvertimeStore>((set, get) => ({
    overtimes: [],
    meta: null,
    searchText: "",
    isModalOpen: false,

    fetchOvertime: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchOvertimeAPI(current, pageSize, q);
            const data = res.data[0];
            const overtimes = data.result;
            const meta = data.meta;
            set({ overtimes, meta });
        } catch (err) {
            console.error("Fetch overtime failed:", err);
            throw err;
        }
    },

    addOvertime: async (payload) => {
        try {
            const res = await createOvertimeAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ overtimes: [...get().overtimes, created] });
            }
        } catch (err) {
            console.error("Thêm OT thất bại:", err);
            throw err;
        }
    },

    updateOvertime: async (id, data) => {
        try {
            const res = await updateOvertimeAPI(id, data);
            const updated = res.data.data || res.data;
            set({
                overtimes: get().overtimes.map((e) => (e.id === id ? { ...e, ...updated } : e)),
            });
        } catch (err) {
            console.error("Cập nhật OT thất bại:", err);
            throw err;
        }
    },

    deleteOvertime: async (id) => {
        try {
            const res = await deleteOvertimeAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                set({ overtimes: get().overtimes.filter((e) => e.id !== id) });
            }
            else {
                const message = res.data?.message || res.message || "Xóa OT thất bại";
                throw new Error(message);
            }
        } catch (err) {
            console.error("Xóa OT thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
