import { create } from "zustand";
import { fetchPayrollRunAllAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { PayrollRun } from "src/types/payroll/PayrollRun";
import axios from "axios";

interface PayrollRunStore {
    payrollRuns: PayrollRun[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    fetchPayrollRuns: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    createPayrollRun?: (payload: Partial<PayrollRun>) => Promise<void>;
    updatePayrollRun?: (id: string, data: Partial<PayrollRun>) => Promise<void>;
    deletePayrollRun?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const usePayrollRunStore = create<PayrollRunStore>((set, get) => ({
    payrollRuns: [],
    meta: null,
    searchText: "",
    isModalOpen: false,

    fetchPayrollRuns: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchPayrollRunAllAPI(current, pageSize, q);
            const data = res.data[0];
            const payrollRuns = data.result;
            const meta = data.meta;
            set({ payrollRuns, meta });
        } catch (err) {
            console.error("Fetch payroll runs failed:", err);
            throw err;
        }
    },

    // createPayrollRun: async (payload) => {
    //     try {
    //         const URL_BACKEND = "https://hrmadmin.huynhthanhson.io.vn/api/Payroll/payrollruns";
    //         const res = await axios.post(URL_BACKEND, payload);
    //         const created = res.data.data || res.data;
    //         if (created) {
    //             set({ payrollRuns: [...get().payrollRuns, created] });
    //         }
    //     } catch (err) {
    //         console.error("Tạo kỳ lương thất bại:", err);
    //         throw err;
    //     }
    // },

    // updatePayrollRun: async (id, data) => {
    //     try {
    //         const URL_BACKEND = `https://hrmadmin.huynhthanhson.io.vn/api/Payroll/payrollruns/${id}`;
    //         const res = await axios.put(URL_BACKEND, data);
    //         const updated = res.data.data || res.data;
    //         set({
    //             payrollRuns: get().payrollRuns.map((p) =>
    //                 p.id === id ? { ...p, ...updated } : p
    //             ),
    //         });
    //     } catch (err) {
    //         console.error("Cập nhật kỳ lương thất bại:", err);
    //         throw err;
    //     }
    // },

    // deletePayrollRun: async (id) => {
    //     try {
    //         const URL_BACKEND = `https://hrmadmin.huynhthanhson.io.vn/api/Payroll/payrollruns/${id}`;
    //         const res = await axios.delete(URL_BACKEND);
    //         if (res.status === 200 || res.data?.success) {
    //             set({
    //                 payrollRuns: get().payrollRuns.filter((p) => p.id !== id),
    //             });
    //         }
    //     } catch (err) {
    //         console.error("Xóa kỳ lương thất bại:", err);
    //         throw err;
    //     }
    // },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
