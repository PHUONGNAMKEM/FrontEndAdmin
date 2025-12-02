import { createContractAPI, deleteContractAPI, fetchContractAPI, fetchContractExpiresAPI, updateContractAPI } from "src/services/api.services";
import { PaginationMeta } from "src/types/api";
import { Contract } from "src/types/contract/Contract";
import { ContractExpires } from "src/types/contract/ContractExpires";
import { create } from "zustand";

interface ContractStore {
    contracts: Contract[];
    contractExpires?: ContractExpires[];
    meta?: PaginationMeta | null;
    searchText: string;
    isModalOpen: boolean;
    fetchContract: (current?: number, pageSize?: number, q?: string) => Promise<void>;
    fetchContractExpires: (current?: number, pageSize?: number, withinDays?: number) => Promise<void>;
    addContract?: (payload: Contract) => Promise<void>;
    updateContract?: (id: string, data: Partial<Contract>) => Promise<void>;
    deleteContract?: (id: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useContractStore = create<ContractStore>((set, get) => ({
    contracts: [],
    contractExpires: [],
    meta: null,
    searchText: "",
    isModalOpen: false,

    fetchContract: async (current = 1, pageSize = 10, q = "") => {
        try {
            const res = await fetchContractAPI(current, pageSize, q);
            const data = res.data[0];
            const contracts = data.result;
            const meta = data.meta;
            console.log(">>> check res: ", res)
            console.log(">>> check contracts: ", contracts)

            set({ contracts, meta, searchText: q });
        } catch (err: any) {
            console.error("Fetch contracts failed:", err);
            throw err;
        }
    },

    fetchContractExpires: async (current = 1, pageSize = 10, withinDays = 30) => {
        try {
            const res = await fetchContractExpiresAPI(current, pageSize, withinDays);
            const data = res.data[0];
            const contractExpires = data.result;
            const meta = data.meta;
            console.log(">>> check res: ", res)
            console.log(">>> check contractExpires: ", contractExpires)

            set({ contractExpires, meta });
        } catch (err: any) {
            console.error("Fetch contract Expires failed:", err);
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