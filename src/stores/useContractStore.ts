import { createContractAPI, deleteContractAPI, fetchContractAPI, updateContractAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Contract } from "src/types/contract/Contract";
import { create } from "zustand";

interface ContractStore {
    contracts: Contract[];
    meta?: PaginationMeta | null;
    isModalOpen: boolean;
    fetchContract: (current?: number, pageSize?: number) => Promise<void>;
    addContract?: (payload: Contract) => Promise<void>;
    updateContract?: (id: string, data: Partial<Contract>) => Promise<void>;
    deleteContract?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useContractStore = create<ContractStore>((set, get) => ({
    contracts: [],
    meta: null,
    isModalOpen: false,

    fetchContract: async (current = 1, pageSize = 10) => {
        try {
            const res = await fetchContractAPI(current, pageSize);
            const data = res.data[0];
            const contracts = data.result;
            const meta = data.meta;
            console.log(">>> check res: ", res)
            console.log(">>> check contracts: ", contracts)

            set({ contracts, meta });
        } catch (err: any) {
            console.error("Fetch contracts failed:", err);
            throw err;
        }
    },

    addContract: async (payload) => {
        try {
            const res = await createContractAPI(payload);
            const created = res.data.data || res.data;
            if (created) {
                set({ contracts: [...get().contracts, created] });
            }
            return created;
        } catch (err: any) {
            console.error("Thêm hợp đồng thất bại:", err);
            throw err;
        }
    },

    updateContract: async (id, data) => {
        try {
            const res = await updateContractAPI(id, data);
            const updated = res.data.data || res.data;

            // Cập nhật trong state
            set({
                contracts: get().contracts.map((e) =>
                    e.id === id ? { ...e, ...updated } : e
                ),
            });
        } catch (err: any) {
            console.error("Cập nhật hợp đồng thất bại:", err);
            throw err;
        }
    },

    deleteContract: async (id) => {
        try {
            const res = await deleteContractAPI(id);
            if (res.statusCode === 200 || res.data?.success) {
                // Cập nhật lại store
                set({
                    contracts: get().contracts.filter((e) => e.id !== id),
                });
            }
            set({ contracts: get().contracts.filter((e) => e.id !== id), });
        } catch (err: any) {
            console.error("Xóa hợp đồng thất bại:", err);
            throw err;
        }
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));