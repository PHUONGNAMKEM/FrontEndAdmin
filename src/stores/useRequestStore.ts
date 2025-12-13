import { create } from "zustand";
import { fetchRequestAPI, updateRequestStatusAPI } from "src/services/api.services";
import { ApiResponse, PaginationMeta } from "src/types/api";
import { Request } from "src/types/request/Request";


interface RequestStore {
    requests: Request[];
    searchText?: string;
    meta?: PaginationMeta | null;
    fetchRequests: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    updateStatus: (id: string, status: Request["status"], approverUserId: string, reason?: string, approvedHours?: number) => Promise<ApiResponse>;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
    requests: [],
    meta: null,
    searchText: "",

    fetchRequests: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchRequestAPI(current, pageSize, q);
            const data = res.data[0];
            const requests = data.result;
            const meta = data.meta;
            set({ requests, meta });
        } catch (err: any) {
            console.error("Fetch requests failed:", err);
            throw err;
        }
    },

    updateStatus: async (id, status, approverUserId, reason = "", approvedHours) => {
        try {
            const res = await updateRequestStatusAPI(id, status, approverUserId, reason, approvedHours);
            const data = res.data;
            if (!data.success) {
                throw new Error(data.message || "Duyệt thất bại");
            }

            set({
                requests: get().requests.map((r) =>
                    r.id === id ? { ...r, status } : r
                ),
            });

            return data;
        } catch (err: any) {
            console.error("Update request status failed:", err);
            throw err;
        }
    },
}));
