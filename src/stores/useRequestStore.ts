import { create } from "zustand";
import { fetchRequestAPI, updateRequestStatusAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Request } from "src/types/request/Request";


interface RequestStore {
    requests: Request[];
    meta?: PaginationMeta | null;
    fetchRequests: (current?: number, pageSize?: number) => Promise<void>;
    updateStatus: (id: string, status: Request["status"]) => Promise<void>;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
    requests: [],
    meta: null,

    fetchRequests: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchRequestAPI(current, pageSize);
            const data = res.data[0];
            const requests = data.result;
            const meta = data.meta;
            set({ requests, meta });
        } catch (err: any) {
            console.error("Fetch requests failed:", err);
            throw err;
        }
    },

    updateStatus: async (id, status) => {
        try {
            await updateRequestStatusAPI(id, status);
            set({
                requests: get().requests.map((r) =>
                    r.id === id ? { ...r, status } : r
                ),
            });
        } catch (err: any) {
            console.error("Update request status failed:", err);
            throw err;
        }
    },
}));
