import { createEmployeeAPI, deleteEmployeeAPI, fetchEmployeeAPI, fetchFilteredEmployeesAPI, updateEmployeeAPI } from "src/services/api.services";
import { hubConnection, startConnection } from "src/services/signalr";
import { ApiResponse, PaginationMeta } from "src/types/api";
import { Employee } from "src/types/employee/Employee";
import { create } from "zustand";

interface EmployeeStore {
    employees: Employee[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    filters: Record<string, any>;
    fetchEmployees: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    fetchFilteredEmployees?: (filters: Record<string, any>, current?: number, pageSize?: number) => Promise<void>;
    addEmployee?: (payload: FormData) => Promise<void>;
    updateEmployee?: (id: string, data: FormData) => Promise<void>;
    deleteEmployee?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
    setFilters: (filters: Record<string, any>) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => {
    // Tự động kết nối SignalR khi store được tạo
    startConnection();

    // Lắng nghe realtime từ backend ASP.NET Core
    hubConnection.on("EmployeeChanged", ({ action, data }) => {
        const employees = get().employees;

        if (action === "create") {
            set({ employees: [...employees, data] });
        }

        if (action === "update") {
            set({
                employees: employees.map((e) =>
                    e.id === data.id ? { ...e, ...data } : e
                ),
            });
        }

        if (action === "delete") {
            set({
                employees: employees.filter((e) => e.id !== data.id),
            });
        }
    });

    return {

        employees: [],
        meta: null,
        searchText: "",
        isModalOpen: false,
        filters: {},

        fetchEmployees: async (current = 1, pageSize = 10, q = "") => {
            try {
                const res = await fetchEmployeeAPI(current!, pageSize!, q);
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
            } catch (err: any) {
                console.error("Fetch employees failed:", err);
                throw err;
            }
        },

        fetchFilteredEmployees: async (filters, current = 1, pageSize = 10) => {
            try {
                const res = await fetchFilteredEmployeesAPI(filters, current, pageSize);
                const data = res.data[0];
                set({
                    employees: data.result,
                    meta: data.meta,
                    filters,
                });
            } catch (err: any) {
                console.error("Fetch filtered employees failed:", err);
                throw err;
            }
        },

        addEmployee: async (payload) => {
            try {
                const res = await createEmployeeAPI(payload);
                const created = res.data.data || res.data;
                if (created) {
                    set({ employees: [...get().employees, created] });
                }
            } catch (err: any) {
                console.error("Thêm nhân viên không thành công:", err);
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
                return updated;
            } catch (err: any) {
                console.error("Cập nhật nhân viên không thành công:", err);
                throw err;
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
                }
                set({ employees: get().employees.filter((e) => e.id !== id), });
            } catch (err: any) {
                console.error("Xóa nhân viên không thành công:", err);
                throw err;
            }
        },

        setModalOpen: (value) => set({ isModalOpen: value }),
        setFilters: (filters) => set({ filters }),
    };
});