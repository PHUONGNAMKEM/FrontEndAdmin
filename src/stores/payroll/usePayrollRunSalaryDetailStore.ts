import { create } from "zustand";
import { fetchPayrollRunSalaryDetailAPI } from "src/services/api.services";
import { PayrollRunSalaryDetail } from "src/types/payroll/PayrollRunSalaryDetail";

interface PayrollRunSalaryDetailStore {
    detail: PayrollRunSalaryDetail | null;
    loading: boolean;
    error: string | null;
    fetchPayrollRunSalaryDetail: (salaryId: string) => Promise<void>;
    clearDetail: () => void;
}

export const usePayrollRunSalaryDetailStore = create<PayrollRunSalaryDetailStore>(
    (set) => ({
        detail: null,
        loading: false,
        error: null,

        fetchPayrollRunSalaryDetail: async (salaryId) => {
            try {
                set({ loading: true, error: null });
                const res = await fetchPayrollRunSalaryDetailAPI(salaryId);
                const data = res.data;
                set({
                    detail: data,
                    loading: false,
                });
            } catch (err: any) {
                console.error("Fetch payroll salary detail failed:", err);
                set({
                    loading: false,
                    error: err.message || "Không thể tải chi tiết lương.",
                });
            }
        },

        clearDetail: () => set({ detail: null }),
    })
);
