import { create } from "zustand";
import { fetchSalaryDetailAPI } from "src/services/api.services";
import { SalaryRecord } from "src/types/salary/SalaryRecord";

interface SalaryTableStore {
    salaryRecords: SalaryRecord[];
    fetchSalaryTable: (employeeId: string, month: string) => Promise<void>;
    clearSalaryRecords: () => void;
}

export const useSalaryTableStore = create<SalaryTableStore>((set, get) => ({
    salaryRecords: [],

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
    fetchSalaryTable: async (employeeId, month) => {
        try {
            const res = await fetchSalaryDetailAPI(employeeId, month);
            const data = res.data?.[0];
            const incoming = data?.result?.[0]; // API của bạn trả về 1 record trong result

            if (!incoming) return;

            set((state) => {
                const empId = incoming.thongTinNhanVien.employeeId;
                const filtered = state.salaryRecords.filter(
                    (r) => r.thongTinNhanVien.employeeId !== empId
                );
                return { salaryRecords: [...filtered, incoming] };
            });
        } catch (err) {
            console.error("Fetch salary table failed:", err);
            throw err;
        }
    },
    clearSalaryRecords: () => set({ salaryRecords: [] }),
}));