import { create } from "zustand";
import { fetchDashboardAPI } from "src/services/api.services";
import { Dashboard } from "src/types/dashboard/Dashboard";

interface DashboardStore {
    loading: boolean;
    dashboard: Dashboard | null;
    fetchDashboard: (expiringWithinDays?: number) => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    loading: false,
    dashboard: null,

    fetchDashboard: async (expiringWithinDays = 30) => {
        try {
            set({ loading: true });
            const res = await fetchDashboardAPI(expiringWithinDays);

            set({
                dashboard: res.data.result,
                loading: false,
            });
        } catch (err) {
            console.error("Dashboard fetch error", err);
            set({ loading: false });
        }
    },
}));
