import { createRewardPenaltyAPI, deleteRewardPenaltyAPI, fetchRewardPenaltyAPI, filterRewardPenaltyAPI, updateRewardPenaltyAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { RewardPenalty } from "src/types/rewardPenalty/RequardPenalty";
import { create } from "zustand";

interface RewardPenaltyStore {
    rewardPenalties: RewardPenalty[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchRewardPenalty: (current?: number, pageSize?: number) => Promise<void>;
    filterRewardPenalty: (current?: number, pageSize?: number, type?: number) => Promise<void>;
    addRewardPenalty?: (payload: RewardPenalty) => Promise<void>;
    updateRewardPenalty?: (id: string, data: Partial<RewardPenalty>) => Promise<void>;
    deleteRewardPenalty?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useRewardPenaltyStore = create<RewardPenaltyStore>((set, get) => ({
    rewardPenalties: [],
    meta: null,
    isModalOpen: false,

    fetchRewardPenalty: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchRewardPenaltyAPI(current, pageSize);
            const data = res.data[0];
            const rewardPenalties = data.result;
            const meta = data.meta;
            set({ rewardPenalties, meta });
        } catch (err: any) {
            console.error("Fetch reward penalties failed:", err);
            throw err;
        }
    },

    filterRewardPenalty: async (current = 1, pageSize = 10, type = 0) => {
        try {
            if (type === 2) {
                get().fetchRewardPenalty(current, pageSize);
                return;
            }
            const res = await filterRewardPenaltyAPI(current, pageSize, type);
            const data = res.data[0];
            set({ rewardPenalties: data.result, meta: data.meta });
        } catch (err: any) {
            console.error("Filter reward OR penalties failed:", err);
            throw err;
        }
    },

    addRewardPenalty: async (payload) => {
        try {
            const res = await createRewardPenaltyAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ rewardPenalties: [...get().rewardPenalties, created] });
            }
            return created;
        } catch (err: any) {
            console.error("Thêm thưởng/phạt thất bại:", err);
            throw err;
        }
    },

    updateRewardPenalty: async (id, data) => {
        try {
            const res = await updateRewardPenaltyAPI(id, data);
            const updated = res.data.data || res.data;
            set({
                rewardPenalties: get().rewardPenalties.map((e) =>
                    e.id === id ? { ...e, ...updated } : e
                ),
            });
        } catch (err: any) {
            console.error("Cập nhật thưởng/phạt thất bại:", err);
            throw err;
        }
    },

    deleteRewardPenalty: async (id) => {
        try {
            const res = await deleteRewardPenaltyAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                set({
                    rewardPenalties: get().rewardPenalties.filter((e) => e.id !== id),
                });
            }
        } catch (err: any) {
            console.error("Xóa thưởng/phạt thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
