import { create } from "zustand";
import {
    fetchNotificationsAPI,
    createNotificationAPI,
    updateNotificationAPI,
    deleteNotificationAPI,
} from "src/services/api.services";
import { Notification } from "src/types/notification/Notification";
import { PaginationMeta } from "src/types/api";
import { CreateNotificationPayload } from "src/types/notification/CreateNotificationPayload";
import { UpdateNotificationPayload } from "src/types/notification/UpdateNotificationPayload";
import { hubConnection, startConnection } from "src/services/signalRHubMobile";

interface NotificationStore {
    notifications: Notification[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    fetchNotifications: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    addNotification: (payload: Partial<CreateNotificationPayload>) => Promise<void>;
    updateNotification: (id: string, payload: Partial<UpdateNotificationPayload>) => Promise<void>;
    deleteNotification: (id: string, userDeleteId?: string) => Promise<void>;
    setSearchText: (v: string) => void;
    setModalOpen: (v: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => {

    // Tự động kết nối SignalR khi store được tạo
    startConnection();

    // Lắng nghe realtime từ backend ASP.NET Core
    hubConnection.on("NotificationChanged", ({ action, data }) => {
        const notifications = get().notifications;

        if (action === "create") {
            set({ notifications: [data, ...notifications] });
        }

        if (action === "update") {
            set({
                notifications: notifications.map((n) =>
                    n.id === data.id ? { ...n, ...data } : n
                ),
            });
        }

        if (action === "delete") {
            set({
                notifications: notifications.filter((n) => n.id !== data.id),
            });
        }
    });

    return {

        notifications: [],
        meta: null,
        searchText: "",
        isModalOpen: false,

        fetchNotifications: async (current = 1, pageSize = 20, q = "") => {
            try {
                const res = await fetchNotificationsAPI(current, pageSize, q);
                if (!Array.isArray(res.data)) {
                    throw new Error(res.message || "Lỗi API không xác định");
                }
                const block = res.data[0];

                set({
                    notifications: block.result,
                    meta: block.meta,
                });
            } catch (err) {
                throw err;
            }
        },

        addNotification: async (payload) => {
            try {
                // Ensure all required fields are present
                const { type = "", title = "", content = "", actionUrl = "", targetUserIds = null } = payload as CreateNotificationPayload;

                const res = await createNotificationAPI({ type, title, content, actionUrl, targetUserIds });
                // if (!Array.isArray(res.data)) {
                //     throw new Error(res.message || "Lỗi API không xác định");
                // }

                console.log(">>> check success: ", res);
                if (!res?.data?.success) {
                    throw new Error(res?.data?.message || "API trả về lỗi.");
                }
            } catch (err) {
                throw err;
            }
        },

        updateNotification: async (id: string, payload: Partial<UpdateNotificationPayload>) => {
            try {
                const { type = "", title = "", content = "", actionUrl, targetUserIds = null, userId = null, } = payload;
                const res = await updateNotificationAPI(id, { type, title, content, actionUrl, targetUserIds, userId, });

                if (!res?.data?.success) {
                    throw new Error(res?.message || "API trả về lỗi.");
                }

            } catch (err) {
                throw err;
            }
        },

        deleteNotification: async (id, userDeleteId) => {
            try {
                const res = await deleteNotificationAPI(id, userDeleteId ?? "");

                if (!res?.data?.success) {
                    throw new Error(res?.message || "API trả về lỗi.");
                }

            } catch (err) {
                throw err;
            }
        },


        setSearchText: (v) => set({ searchText: v }),
        setModalOpen: (v) => set({ isModalOpen: v }),
    };
});
