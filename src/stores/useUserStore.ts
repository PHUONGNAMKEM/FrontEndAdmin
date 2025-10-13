import { createEmployeeAPI, fetchEmployeeAPI, fetchUserAPI } from "src/services/api.me.service";
import { PaginationMeta } from "src/types/api";
import { Employee } from "src/types/employee/Employee";
import { User } from "src/types/user/User";
import { create } from "zustand";

interface UserStore {
    users: User[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchUsers: (current?: number, pageSize?: number) => Promise<void>;
    addUser?: (formData: FormData) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    users: [],
    meta: null,
    isModalOpen: false,

    fetchUsers: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchUserAPI(current, pageSize);
            const data = res.data;
            const users = data.result;
            const meta = data.meta;

            set({ users, meta });
        } catch (err) {
            console.error("Fetch employees failed:", err);
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