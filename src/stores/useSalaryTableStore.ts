import { create } from "zustand";
import { fetchSalaryAllAPI, fetchSalaryDetailAPI, finalBatchSalaryAPI } from "src/services/api.services";
import { SalaryRecord } from "src/types/salary/SalaryRecord";
import { PaginationMeta } from "src/types/api";
import { message } from "antd";

interface SalaryTableStore {
    salaryRecords: SalaryRecord[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchSalaryAll: (month: string, current: number, pageSize: number, departmentId?: string) => Promise<void>;
    fetchSalaryTable: (employeeId: string, month: string) => Promise<void>;
    finalBatchSalary?: (month: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useSalaryTableStore = create<SalaryTableStore>((set, get) => ({
    salaryRecords: [],
    meta: null,
    isModalOpen: false,

    // fetchSalaryTable: async (employeeId, month) => {
    //     try {
    //         const res = await fetchSalaryDetailAPI(employeeId, month);
    //         const data = res.data[0];
    //         const salaryRecords = data.result;
    //         set((state) => ({
    //             salaryRecords: [...state.salaryRecords, ...salaryRecords],
    //         }));
    //     } catch (err) {
    //         console.error("Fetch salary table failed:", err);
    //         throw err;
    //     }
    // },

    fetchSalaryAll: async (month, current, pageSize, departmentId) => {
        try {
            const res = await fetchSalaryAllAPI(month, current, pageSize, departmentId);
            const data = res.data;
            const salaryRecords = data?.result || [];
            console.log(">>> check meta salary all: ", data?.meta);
            set({ salaryRecords, meta: data?.meta });

            console.log("Fetched salary records:", salaryRecords);

            if (salaryRecords.length === 0) {
                message.warning("Không có dữ liệu bảng lương ngày cho tháng này.");
            }
        } catch (error: any) {
            console.error("Fetch salary all failed:", error);
            message.error(error?.message ?? "Lỗi không xác định");
            throw error;
        }
    },

    fetchSalaryTable: async (employeeId, month) => {
        try {
            const res = await fetchSalaryDetailAPI(employeeId, month);
            const data = res.data?.[0];
            // const incoming = data?.result?.[0];

            // if (!incoming) return;

            // set((state) => {
            //     const empId = incoming.thongTinNhanVien.employeeId;
            //     const filtered = state.salaryRecords.filter(
            //         (r) => r.thongTinNhanVien.employeeId !== empId
            //     );
            //     return { salaryRecords: [...filtered, incoming] };
            // });

            const salaryRecords = data?.result;
            set({ salaryRecords: salaryRecords });
        } catch (err) {
            console.error("Fetch salary table failed:", err);
            throw err;
        }
    },

    finalBatchSalary: async (month) => {
        try {
            const res = await finalBatchSalaryAPI(month);
            if (!res?.success) {
                throw new Error(res?.message || "API trả về lỗi.");
            }

            return res.data;
        } catch (error) {
            throw error;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),

}));