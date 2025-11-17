import { create } from "zustand";
import {
    fetchNotificationsAPI,
    deleteNotificationAPI,
    markNotificationAsReadAPI,
    createNotificationAPI,
    fetchAllNotificationsAPI,
} from "src/services/api.services";

import { Notification } from "src/types/notification/Notification";
import { PaginationMeta } from "src/types/api";

interface NotificationStore {
    notifications: Notification[]; // này sẽ động
    allNotifications: Notification[]; // này là cố định, tất cả những thông báo chưa được đọc
    meta?: PaginationMeta | null;
    unreadCount: number;
    searchText: string;
    isModalOpen: boolean;

    fetchNotifications: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    fetchAllNotifications?: (current?: number, pageSize?: number) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    addNotification: (payload: Partial<Notification>) => Promise<void>;
    setSearchText: (v: string) => void;
    setModalOpen: (v: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    allNotifications: [],
    meta: null,
    unreadCount: 0,
    searchText: "",
    isModalOpen: false,

    fetchNotifications: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchNotificationsAPI(current, pageSize, q);
            console.log("noti fetch bth: ", res);

            if (!Array.isArray(res.data)) {
                throw new Error(res.message || "Lỗi API không xác định");
            }
            const data = res.data[0];
            const notifications = data.result;
            const meta = data.meta;

            set({ notifications, meta });
        } catch (err) {
            console.log("Fetch notifications failed", err);
            throw err;
        }
    },

    fetchAllNotifications: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchAllNotificationsAPI(current, pageSize);
            const data = res.data[0];
            const fullList = data.result;

            console.log("noti fetch all: ", res);

            const unread = fullList.filter((n: Notification) => n.readAt === null).length;

            set({
                allNotifications: fullList,
                unreadCount: unread,
            });
        } catch (err) {
            console.log("Fetch All notifications failed", err);
            throw err;
        }
    },

    markAsRead: async (id: string) => {
        try {
            await markNotificationAsReadAPI(id);

            // cập nhật danh sách hiển thị
            const updatedList = get().notifications.map((n) =>
                n.id === id ? { ...n, readAt: new Date().toISOString() } : n
            );

            // cập nhật danh sách full
            const updatedAll = get().allNotifications.map((n) =>
                n.id === id ? { ...n, readAt: new Date().toISOString() } : n
            );

            const unread = updatedAll.filter((n) => !n.readAt).length;

            set({
                notifications: updatedList,
                allNotifications: updatedAll,
                unreadCount: unread,
            });

        } catch (err) {
            console.log("Mark read failed", err);
            throw err;
        }
    },

    deleteNotification: async (id: string) => {
        try {
            await deleteNotificationAPI(id);

            const updated = get().notifications.filter((n) => n.id !== id);
            const updatedAll = get().allNotifications.filter((n) => n.id !== id);

            const unread = updatedAll.filter(n => !n.readAt).length;

            set({
                notifications: updated,
                allNotifications: updatedAll,
                unreadCount: unread
            });

        } catch (err) {
            console.log("Xóa thông báo thất bại", err);
            throw err;
        }
    },

    addNotification: async (payload) => {
        try {
            const res = await createNotificationAPI(payload);
            const created = res.data.data;

            const newAll = [created, ...get().allNotifications];
            const unread = newAll.filter(n => !n.readAt).length;

            set({
                notifications: [created, ...get().notifications],
                allNotifications: newAll,
                unreadCount: unread,
            });

        } catch (err) {
            console.log("Thêm thông báo mới thất bại", err);
            throw err;
        }
    },

    setSearchText: (v) => set({ searchText: v }),
    setModalOpen: (v) => set({ isModalOpen: v }),
}));
