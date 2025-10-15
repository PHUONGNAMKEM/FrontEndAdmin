import { notification } from "antd";
import { createEmployeeAPI, deleteEmployeeAPI, fetchEmployeeAPI, updateEmployeeAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Employee } from "src/types/employee/Employee";
import { create } from "zustand";

interface EmployeeStore {
    employees: Employee[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchEmployees: (current?: number, pageSize?: number) => Promise<void>;
    addEmployee?: (payload: Employee) => Promise<void>;
    updateEmployee?: (id: string, data: Partial<Employee>) => Promise<void>;
    deleteEmployee?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
    employees: [],
    meta: null,
    isModalOpen: false,

    fetchEmployees: async (current, pageSize) => {
        try {
            const res = await fetchEmployeeAPI(current!, pageSize!);
            const data = res.data[0];
            const employees = data.result;
            const meta = {
                ...data.meta,
                current,
                pageSize,
            };

            set({ employees, meta });

            console.log(">>> check employee: ", data.result);
            console.log(">>> check meta: ", meta);
        } catch (err) {
            console.error("Fetch employees failed:", err);
        }
    },

    addEmployee: async (payload) => {
        try {
            const res = await createEmployeeAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ employees: [...get().employees, created] });
            }
            else {
                throw new Error("Không nhận được dữ liệu nhân viên mới");
            }
        } catch (err) {
            console.error("Add employee failed:", err);
            throw err;
        }
    },

    updateEmployee: async (id, data) => {
        try {
            const res = await updateEmployeeAPI(id, data);
            const updated = res.data.data || res.data;

            // Cập nhật trong state
            set({
                employees: get().employees.map((e) =>
                    e.id === id ? { ...e, ...updated } : e
                ),
            });
        } catch (err) {
            console.error("Update employee failed:", err);
        }
    },

    deleteEmployee: async (id) => {
        try {
            const res = await deleteEmployeeAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                // Cập nhật lại store
                set({
                    employees: get().employees.filter((e) => e.id !== id),
                });
                notification.success({ message: "Xóa nhân viên thành công!" });

            } else {
                notification.warning({ message: `Xóa nhân viên thất bại` });
            }
            set({ employees: get().employees.filter((e) => e.id !== id), });
        } catch (err: any) {
            console.error("Delete employee failed:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));