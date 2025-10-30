import {
    fetchRewardPenaltiesAPI,
    filterRewardPenaltiesAPI,
    createRewardPenaltiesAPI,
    updateRewardPenaltiesAPI,
    deleteRewardPenaltiesAPI,
} from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { RewardPenaltyDetail } from "src/types/rewardPenalty/RewardPenaltyDetail";
import { create } from "zustand";

interface RewardPenaltiesStore {
    rewardPenalties: RewardPenaltyDetail[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchRewardPenalties: (current?: number, pageSize?: number) => Promise<void>;
    filterRewardPenalties: (current?: number, pageSize?: number, type?: number) => Promise<void>;
    addRewardPenalty: (payload: RewardPenaltyDetail) => Promise<void>;
    updateRewardPenalty: (id: string, data: Partial<RewardPenaltyDetail>) => Promise<void>;
    deleteRewardPenalty: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useRewardPenaltiesStore = create<RewardPenaltiesStore>((set, get) => ({
    rewardPenalties: [],
    meta: null,
    isModalOpen: false,

    fetchRewardPenalties: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchRewardPenaltiesAPI(current, pageSize);
            const data = res.data[0];
            set({ rewardPenalties: data.result, meta: data.meta });
        } catch (err) {
            console.error("Fetch RewardPenalties failed:", err);
            throw err;
        }
    },

    filterRewardPenalties: async (current = 1, pageSize = 10, type = 0) => {
        try {
            const res = await filterRewardPenaltiesAPI(current, pageSize, type);
            const data = res.data[0];
            set({ rewardPenalties: data.result, meta: data.meta });
        } catch (err) {
            console.error("Filter RewardPenalties failed:", err);
            throw err;
        }
    },

    addRewardPenalty: async (payload) => {
        try {
            const res = await createRewardPenaltiesAPI(payload);
            const created = res.data.data || res.data;
            if (created) set({ rewardPenalties: [...get().rewardPenalties, created] });
        } catch (err) {
            console.error("Thêm chi tiết thưởng/phạt thất bại:", err);
            throw err;
        }
    },

    updateRewardPenalty: async (id, data) => {
        try {
            const res = await updateRewardPenaltiesAPI(id, data);
            const updated = res.data.data || res.data;
            set({
                rewardPenalties: get().rewardPenalties.map((r) =>
                    r.id === id ? { ...r, ...updated } : r
                ),
            });
        } catch (err) {
            console.error("Cập nhật chi tiết thưởng/phạt thất bại:", err);
            throw err;
        }
    },

    deleteRewardPenalty: async (id) => {
        try {
            const res = await deleteRewardPenaltiesAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                set({
                    rewardPenalties: get().rewardPenalties.filter((r) => r.id !== id),
                });
            }
        } catch (err) {
            console.error("Xóa chi tiết thưởng/phạt thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
