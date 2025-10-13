import { createEmployeeAPI, fetchEmployeeAPI } from "src/services/api.me.service";
import { PaginationMeta } from "src/types/api";
import { Employee } from "src/types/employee/Employee";
import { create } from "zustand";

interface EmployeeStore {
    employees: Employee[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchEmployees: (current?: number, pageSize?: number) => Promise<void>;
    addEmployee?: (formData: FormData) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
    employees: [],
    meta: null,
    isModalOpen: false,

    fetchEmployees: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchEmployeeAPI(current, pageSize);
            const data = res.data;
            const employees = data.result;
            const meta = data.meta;

            set({ employees, meta });
        } catch (err) {
            console.error("Fetch employees failed:", err);
        }
    },

    addEmployee: async (formData) => {
        try {
            const res = await createEmployeeAPI(formData);
            const created = res.data.data || res.data;
            set({ employees: [...get().employees, created] });
        } catch (err) {
            console.error("Add employee failed:", err);
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));