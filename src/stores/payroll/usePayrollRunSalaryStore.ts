import { create } from "zustand";
import { fetchPayrollRunSalaryAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { PayrollRunSalary } from "src/types/payroll/PayrollRunSalary";

interface PayrollRunSalaryStore {
    salaries: PayrollRunSalary[]; // đây là danh sách lương đã chốt
    meta?: PaginationMeta | null;
    loading: boolean;
    error?: string | null;

    fetchPayrollRunSalary: (id: string, current?: number, pageSize?: number) => Promise<void>;
    clearSalaries: () => void;
}

export const usePayrollRunSalaryStore = create<PayrollRunSalaryStore>((set) => ({
    salaries: [],
    meta: null,
    loading: false,
    error: null,

    fetchPayrollRunSalary: async (id, current = 1, pageSize = 20) => {
        try {
            set({ loading: true, error: null });
            const res = await fetchPayrollRunSalaryAPI(id, current, pageSize);
            const data = res.data[0];
            set({
                salaries: data.result,
                meta: data.meta,
                loading: false,
            });
        } catch (err: any) {
            console.error("Fetch payroll run salary failed:", err);
            set({ loading: false, error: err.message || "Lỗi tải dữ liệu" });
        }
    },

    clearSalaries: () => set({ salaries: [], meta: null }),
}));
