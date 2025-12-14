import { create } from "zustand";
import { fetchRequestAPI, updateRequestStatusAPI } from "src/services/api.services";
import { ApiResponse, PaginationMeta } from "src/types/api";
import { Request } from "src/types/request/Request";
import { hubConnection, startConnection } from "src/services/signalr";

interface RequestStore {
    requests: Request[];
    searchText: string;
    meta?: PaginationMeta | null;
    fetchRequests: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    updateStatus: (
        id: string,
        status: Request["status"],
        approverUserId: string,
        reason?: string,
        approvedHours?: number
    ) => Promise<ApiResponse>;
}

export const useRequestStore = create<RequestStore>((set, get) => {
    // Kết nối SignalR
    startConnection();

    // Lắng nghe realtime từ backend
    hubConnection.on("RequestChanged", async (payload: any) => {
        console.log("RequestChanged from SignalR:", payload);

        const { action } = payload;
        const { meta, searchText, fetchRequests } = get();

        // Nếu chưa từng fetch thì bỏ qua
        if (!meta) return;

        const current = meta.current || 1;
        const pageSize = meta.pageSize || 10;

        // Với request, cứ có create/update/delete là reload lại trang hiện tại
        if (action === "create" || action === "update" || action === "delete") {
            await fetchRequests(current, pageSize, searchText || "");
        }
    });

    return {
        requests: [],
        meta: null,
        searchText: "",

        fetchRequests: async (current = 1, pageSize = 10, q = "") => {
            try {
                const res = await fetchRequestAPI(current, pageSize, q);
                const data = res.data[0];
                const requests = data.result;
                const meta = data.meta;

                // Lưu luôn searchText để SignalR dùng lại
                set({ requests, meta, searchText: q });
            } catch (err: any) {
                console.error("Fetch requests failed:", err);
                throw err;
            }
        },

        updateStatus: async (id, status, approverUserId, reason = "", approvedHours) => {
            try {
                const res = await updateRequestStatusAPI(
                    id,
                    status,
                    approverUserId,
                    reason,
                    approvedHours
                );
                const data = res.data;
                if (!data.success) {
                    throw new Error(data.message || "Duyệt thất bại");
                }

                // Cập nhật local ngay cho tab hiện tại (cho mượt),
                // lát nữa SignalR bắn xuống vẫn sẽ fetchRequests lại nên không sao.
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
    };
});
