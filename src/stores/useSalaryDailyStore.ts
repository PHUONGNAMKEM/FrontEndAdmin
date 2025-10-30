// src/stores/useSalaryDailyStore.ts
import { create } from "zustand";
import { fetchSalaryDailyAPI } from "src/services/api.services";
import type { SalaryDaily } from "src/types/salary/SalaryDaily";

interface SalaryDailyStore {
    loading: boolean;
    error: string | null;
    records: SalaryDaily[];
    fetchDaily: (employeeId: string, month: string) => Promise<void>;
    clear: () => void;
}

export const useSalaryDailyStore = create<SalaryDailyStore>((set) => ({
    loading: false,
    error: null,
    records: [],

    fetchDaily: async (employeeId, month) => {
        set({ loading: true, error: null });
        try {
            const res = await fetchSalaryDailyAPI(employeeId, month);
            // Kỳ vọng API trả về dạng { data: [ { result: SalaryDaily[] } ] }
            const data = res.data?.[0];
            const result = (data?.result ?? []) as SalaryDaily[];
            set({ records: result });
        } catch (err: any) {
            console.error("Fetch salary daily failed:", err);
            set({ error: err?.message ?? "Lỗi không xác định" });
        } finally {
            set({ loading: false });
        }
    },

    clear: () => set({ records: [], error: null }),
}));
