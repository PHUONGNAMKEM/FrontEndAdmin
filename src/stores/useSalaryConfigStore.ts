import {
    createSalaryConfigAPI,
    deleteSalaryConfigAPI,
    fetchSalaryConfigAPI,
    updateSalaryConfigAPI,
} from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { SalaryConfig } from "src/types/salary/SalaryConfig";
import { create } from "zustand";

interface SalaryConfigStore {
    salaryConfigs: SalaryConfig[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    fetchSalaryConfig: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addSalaryConfig: (payload: SalaryConfig) => Promise<void>;
    updateSalaryConfig: (id: string, data: Partial<SalaryConfig>) => Promise<void>;
    deleteSalaryConfig: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useSalaryConfigStore = create<SalaryConfigStore>((set, get) => ({
    salaryConfigs: [],
    meta: null,
    searchText: "",
    isModalOpen: false,

    fetchSalaryConfig: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchSalaryConfigAPI(current, pageSize, q);
            const data = res.data[0];
            const salaryConfigs = data.result;
            const meta = data.meta;
            set({ salaryConfigs, meta });
        } catch (err) {
            console.error("Fetch salary configs failed:", err);
            throw err;
        }
    },

    addSalaryConfig: async (payload) => {
        try {
            const res = await createSalaryConfigAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ salaryConfigs: [...get().salaryConfigs, created] });
            }
        } catch (err) {
            console.error("Thêm cấu hình lương thất bại:", err);
            throw err;
        }
    },

    updateSalaryConfig: async (id, data) => {
        try {
            const res = await updateSalaryConfigAPI(id, data);
            const updated = res.data.data || res.data;
            set({
                salaryConfigs: get().salaryConfigs.map((e) =>
                    e.id === id ? { ...e, ...updated } : e
                ),
            });
        } catch (err) {
            console.error("Cập nhật cấu hình lương thất bại:", err);
            throw err;
        }
    },

    deleteSalaryConfig: async (id) => {
        try {
            const res = await deleteSalaryConfigAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                set({
                    salaryConfigs: get().salaryConfigs.filter((e) => e.id !== id),
                });
            }
            else {
                const message = res.data?.message || res.message || "Xóa cấu hình lương thất bại";
                throw new Error(message);
            }
        } catch (err) {
            console.error("Xóa cấu hình lương thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
