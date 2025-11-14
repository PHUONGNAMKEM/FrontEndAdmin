// src/stores/useRoleStore.ts
import { create } from "zustand";
import {
    fetchRolesAPI,
    createRoleAPI,
    updateRoleAPI,
    deleteRoleAPI,
} from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Role } from "src/types/user/Role";
import { hubConnection, startConnection } from "src/services/signalr";

interface RoleStore {
    roles: Role[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    searchText: string;

    fetchRoles: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addRole: (payload: Partial<Role>) => Promise<void>;
    updateRole: (id: string, data: Partial<Role>) => Promise<void>;
    deleteRole: (id: string) => Promise<void>;

    setModalOpen: (v: boolean) => void;
    setSearchText: (v: string) => void;
}

export const useRoleStore = create<RoleStore>((set, get) => {

    startConnection();

    hubConnection.on("RoleChanged", ({ action, data }) => {
        const roles = get().roles;

        if (action === "create") {
            set({ roles: [...roles, data] });
        }

        if (action === "update") {
            set({
                roles: roles.map((r) =>
                    r.id === data.id ? { ...r, ...data } : r
                ),
            });
        }

        if (action === "delete") {
            set({
                roles: roles.filter((r) => r.id !== data.id),
            });
        }
    });

    return {

        roles: [],
        meta: null,
        isModalOpen: false,
        searchText: "",

        fetchRoles: async (current = 1, pageSize = 10, q = "") => {
            try {
                const res = await fetchRolesAPI(current, pageSize, q);
                const data = res.data[0];
                set({
                    roles: data.result,
                    meta: data.meta,
                });
            } catch (err) {
                console.error("Fetch roles failed:", err);
                throw err;
            }
        },

        addRole: async (payload) => {
            try {
                const res = await createRoleAPI(payload);
                const created = res.data.data || res.data;
                if (created) {
                    set({ roles: [...get().roles, created] });
                }
            } catch (err) {
                console.error("Add role failed:", err);
                throw err;
            }
        },

        updateRole: async (id, data) => {
            try {
                const res = await updateRoleAPI(id, data);
                const updated = res.data.data || res.data;

                set({
                    roles: get().roles.map((r) =>
                        r.id === id ? { ...r, ...updated } : r
                    ),
                });
            } catch (err) {
                console.error("Update role failed:", err);
                throw err;
            }
        },

        deleteRole: async (id) => {
            try {
                const res = await deleteRoleAPI(id);

                if (res.statusCode === 200 || res.data?.success) {
                    set({
                        roles: get().roles.filter((r) => r.id !== id),
                    });
                }
            } catch (err) {
                console.error("Delete role failed:", err);
                throw err;
            }
        },

        setModalOpen: (v) => set({ isModalOpen: v }),
        setSearchText: (v) => set({ searchText: v }),
    };
});
