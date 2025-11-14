import { create } from "zustand";
import { fetchUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI, filterUsersAPI, } from "src/services/api.services";
import { User } from "src/types/user/User";
import { PaginationMeta } from "src/types/api";
import { hubConnection, startConnection } from "src/services/signalr";

interface UserStore {
    users: User[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    searchText: string;
    fetchUsers: (current?: number, pageSize?: number, q?: string, role?: string) => Promise<void>;
    addUser: (payload: Partial<User>) => Promise<void>;
    updateUser: (id: string, data: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    setModalOpen: (v: boolean) => void;
    setSearchText: (q: string) => void;
    roleFilter: string;
    setRoleFilter: (value: string) => void;
}

export const useUserStore = create<UserStore>((set, get) => {

    // Tự động kết nối SignalR khi store được tạo
    startConnection();

    // Lắng nghe realtime từ backend ASP.NET Core
    hubConnection.on("UserChanged", ({ action, data }) => {
        const users = get().users;

        if (action === "create") {
            set({ users: [...users, data] });
        }

        if (action === "update") {
            set({
                users: users.map((u) =>
                    u.id === data.id ? { ...u, ...data } : u
                ),
            });
        }

        if (action === "delete") {
            set({
                users: users.filter((u) => u.id !== data.id),
            });
        }
    });

    return {
        users: [],
        meta: null,
        isModalOpen: false,
        searchText: "",
        roleFilter: "",

        fetchUsers: async (current = 1, pageSize = 10, q = "", role = "") => {
            try {
                const res = await filterUsersAPI(current, pageSize, q, role);
                const data = res.data[0];
                const users = data.result;
                const meta = data.meta;
                set({ users, meta });
            } catch (err) {
                console.error("Fetch users failed", err);
                throw err;
            }
        },



        addUser: async (payload) => {
            try {
                const res = await createUserAPI(payload);

                const created = res.data.data || res.data;
                if (created) {
                    set({ users: [...get().users, created] });
                }
            } catch (err) {
                console.error("Thêm tài khoản mới thất bại", err);
                throw err;
            }
        },

        updateUser: async (id, data) => {
            try {
                const res = await updateUserAPI(id, data);

                const updated = res.data.data || res.data;

                set({
                    users: get().users.map((u) =>
                        u.id === id ? { ...u, ...updated } : u
                    ),
                });
            } catch (err) {
                console.error("Cập nhật tài khoản thất bại", err);
                throw err;
            }
        },

        deleteUser: async (id) => {
            try {
                const res = await deleteUserAPI(id);

                // giống style của CourseStore
                if (res.statusCode === 200 || res.data?.success) {
                    set({
                        users: get().users.filter((u) => u.id !== id),
                    });
                }
            } catch (err) {
                console.error("Xóa tài khoản thất bại", err);
                throw err;
            }
        },

        setModalOpen: (v) => set({ isModalOpen: v }),
        setSearchText: (q) => set({ searchText: q }),
        setRoleFilter: (value: string) => set({ roleFilter: value }),
    };
});
