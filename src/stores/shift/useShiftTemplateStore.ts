import { create } from "zustand";
import { fetchShiftTemplatesAPI, createShiftTemplateAPI, updateShiftTemplateAPI, deleteShiftTemplateAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { ShiftTemplate } from "src/types/shift/ShiftTemplate";
import { hubConnection, startConnection } from "src/services/signalr";

interface ShiftTemplateStore {
    templates: ShiftTemplate[];
    meta?: PaginationMeta | null;

    isModalOpen: boolean;
    searchText: string;

    fetchTemplates: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addTemplate: (payload: Partial<ShiftTemplate>) => Promise<void>;
    updateTemplate: (id: string, data: Partial<ShiftTemplate>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;

    setModalOpen: (v: boolean) => void;
    setSearchText: (v: string) => void;
}

export const useShiftTemplateStore = create<ShiftTemplateStore>((set, get) => {

    // ===== SignalR realtime =====
    startConnection();

    hubConnection.on("ShiftTemplateChanged", ({ action, data }) => {
        const list = get().templates;

        if (action === "create") {
            set({ templates: [...list, data] });
        }

        if (action === "update") {
            set({
                templates: list.map(t => (t.id === data.id ? { ...t, ...data } : t))
            });
        }

        if (action === "delete") {
            set({
                templates: list.filter(t => t.id !== data.id)
            });
        }
    });

    return {
        templates: [],
        meta: null,
        isModalOpen: false,
        searchText: "",

        fetchTemplates: async (current = 1, pageSize = 10, q = "") => {
            try {
                const res = await fetchShiftTemplatesAPI(current, pageSize, q);
                const data = res.data[0];

                set({
                    templates: data.result,
                    meta: data.meta
                });
            } catch (error) {
                throw error;
            }

        },

        addTemplate: async (payload) => {
            try {
                const res = await createShiftTemplateAPI(payload);
                const created = res.data.data || res.data;

                if (created) {
                    set({ templates: [...get().templates, created] });
                }
            } catch (error) {
                throw error;
            }
        },

        updateTemplate: async (id, data) => {
            try {
                const res = await updateShiftTemplateAPI(id, data);
                const updated = res.data.data || res.data;

                set({
                    templates: get().templates.map(t =>
                        t.id === id ? { ...t, ...updated } : t
                    )
                });
            } catch (error) {
                throw error;
            }
        },

        deleteTemplate: async (id) => {
            try {
                const res = await deleteShiftTemplateAPI(id);
                if (res.statusCode === 200 || res.data?.success) {
                    set({
                        templates: get().templates.filter(t => t.id !== id)
                    });
                }
            } catch (error) {
                throw error;
            }
        },

        setModalOpen: (v) => set({ isModalOpen: v }),
        setSearchText: (v) => set({ searchText: v }),
    };
});
