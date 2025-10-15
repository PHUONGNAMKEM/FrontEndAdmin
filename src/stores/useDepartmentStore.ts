import { fetchDepartmentAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Department } from "src/types/department/Department";

import { create } from "zustand";

interface DepartmentStore {
    departments: Department[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchDepartment: (current?: number, pageSize?: number) => Promise<void>;
    // addUser?: (formData: FormData) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set, get) => ({
    departments: [],
    meta: null,
    isModalOpen: false,

    fetchDepartment: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchDepartmentAPI(current, pageSize);
            const data = res.data[0];
            const departments = data.result;
            const meta = data.meta;
            console.log(">>> check res: ", res)
            console.log(">>> check departments: ", departments)

            set({ departments, meta });
        } catch (err) {
            console.error("Fetch departments failed:", err);
        }
    },

    // addEmployee: async (formData) => {
    //     try {
    //         const res = await createEmployeeAPI(formData);
    //         const created = res.data.data || res.data;
    //         set({ users: [...get().users, created] });
    //     } catch (err) {
    //         console.error("Add employee failed:", err);
    //     }
    // },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));