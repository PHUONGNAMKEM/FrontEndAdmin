import { createDepartmentAPI, deleteDepartmentAPI, fetchDepartmentAPI, updateDepartmentAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Department } from "src/types/department/Department";

import { create } from "zustand";

interface DepartmentStore {
    departments: Department[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchDepartment: (current?: number, pageSize?: number) => Promise<void>;
    addDepartment?: (payload: Department) => Promise<void>;
    updateDepartment?: (id: string, data: Partial<Department>) => Promise<void>;
    deleteDepartment?: (id: string) => Promise<void>;
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
        } catch (err: any) {
            console.error("Fetch departments failed:", err);
            throw err;
        }
    },

    addDepartment: async (payload) => {
        try {
            const res = await createDepartmentAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ departments: [...get().departments, created] });
            }
            return created;
        } catch (err: any) {
            console.error("Thêm phòng ban thất bại:", err);
            throw err;
        }
    },

    updateDepartment: async (id, data) => {
        try {
            const res = await updateDepartmentAPI(id, data);
            const updated = res.data.data || res.data;

            // Cập nhật trong state
            set({
                departments: get().departments.map((e) =>
                    e.id === id ? { ...e, ...updated } : e
                ),
            });
        } catch (err: any) {
            console.error("Cập nhật phòng ban thất bại:", err);
            throw err;
        }
    },

    deleteDepartment: async (id) => {
        try {
            const res = await deleteDepartmentAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                // Cập nhật lại store
                set({
                    departments: get().departments.filter((e) => e.id !== id),
                });
            }
            set({ departments: get().departments.filter((e) => e.id !== id), });
        } catch (err: any) {
            console.error("Xóa phòng ban thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));