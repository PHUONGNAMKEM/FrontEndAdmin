import { create } from "zustand";
import { fetchWorkSchedulesAPI, createWorkScheduleAPI, updateWorkScheduleAPI, deleteWorkScheduleAPI, bulkCreateWorkScheduleAPI, bulkDeleteWorkScheduleAPI, } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { WorkSchedule, WorkScheduleBulkCreatePayload, WorkScheduleBulkDeletePayload, WorkScheduleFilters, WorkSchedulePayload, } from "src/types/work/WorkSchedule";
import { hubConnection, startConnection } from "src/services/signalr";

interface WorkScheduleStore {
    schedules: WorkSchedule[];
    meta?: PaginationMeta | null;

    isModalOpen: boolean;

    fetchSchedules: (
        current?: number,
        pageSize?: number,
        filters?: WorkScheduleFilters
    ) => Promise<void>;

    addSchedule: (payload: WorkSchedulePayload) => Promise<void>;
    updateSchedule: (id: string, payload: Partial<WorkSchedulePayload>) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;

    bulkCreateSchedules: (payload: WorkScheduleBulkCreatePayload) => Promise<void>;
    bulkDeleteSchedules: (payload: WorkScheduleBulkDeletePayload) => Promise<void>;

    setModalOpen: (v: boolean) => void;
}

export const useWorkScheduleStore = create<WorkScheduleStore>((set, get) => {
    // Realtime nếu backend có push
    startConnection();

    hubConnection.on("WorkScheduleChanged", ({ action, data }) => {
        const list = get().schedules;

        if (action === "create") {
            set({ schedules: [...list, data] });
        }
        if (action === "update") {
            set({
                schedules: list.map((s) => (s.id === data.id ? { ...s, ...data } : s)),
            });
        }
        if (action === "delete") {
            set({
                schedules: list.filter((s) => s.id !== data.id),
            });
        }
    });

    return {
        schedules: [],
        meta: null,
        isModalOpen: false,

        fetchSchedules: async (current = 1, pageSize = 500, filters) => {
            try {
                const res = await fetchWorkSchedulesAPI(current, pageSize, filters);
                const data = res.data[0];

                set({
                    schedules: data.result,
                    meta: data.meta,
                });
            } catch (error) {
                throw error;
            }
        },

        addSchedule: async (payload) => {
            try {
                const res = await createWorkScheduleAPI(payload);
                const created = res.data.data || res.data;
                if (created) {
                    set({ schedules: [...get().schedules, created] });
                }
            } catch (error) {
                throw error;
            }
        },

        updateSchedule: async (id, payload) => {
            try {
                const res = await updateWorkScheduleAPI(id, payload);
                if (!Array.isArray(res.data)) {
                    throw new Error(res.message || "Lỗi API không xác định");
                }
                const updated = res.data?.[0] || res.data;

                set({
                    schedules: get().schedules.map((s) =>
                        s.id === id ? { ...s, ...updated } : s
                    ),
                });
            } catch (error) {
                throw error;
            }
        },

        deleteSchedule: async (id) => {
            try {
                const res = await deleteWorkScheduleAPI(id);
                if (res.statusCode === 200 || res.data?.success) {
                    set({
                        schedules: get().schedules.filter((s) => s.id !== id),
                    });
                }
            } catch (error) {
                throw error;
            }
        },

        bulkCreateSchedules: async (payload) => {
            try {
                await bulkCreateWorkScheduleAPI(payload);
            } catch (err) {
                console.error("Bulk create schedule failed:", err);
                throw err;
            }
        },

        bulkDeleteSchedules: async (payload) => {
            try {
                await bulkDeleteWorkScheduleAPI(payload);
            } catch (err) {
                console.error("Bulk delete schedule failed:", err);
                throw err;
            }
        },

        setModalOpen: (v) => set({ isModalOpen: v }),
    };
});
