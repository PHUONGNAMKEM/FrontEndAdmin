import { create } from "zustand";
import { forgotPasswordAPI } from "src/services/api.services";
import { ForgotPasswordRequest } from "src/types/auth/ForgotPassword";

interface ForgotPasswordStore {
    loading: boolean;
    successMessage?: string | null;
    errorMessage?: string | null;

    forgotPassword: (payload: ForgotPasswordRequest) => Promise<void>;
    resetState: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordStore>((set) => ({
    loading: false,
    successMessage: null,
    errorMessage: null,

    forgotPassword: async (payload) => {
        set({ loading: true, successMessage: null, errorMessage: null });

        try {
            const res = await forgotPasswordAPI(payload);

            const msg =
                (res.data && (res.data.message as string)) ||
                "Vui lòng kiểm tra email để reset mật khẩu.";

            set({ successMessage: msg });
        } catch (error: any) {
            const msg =
                error?.response?.data?.message ||
                "Gửi email reset mật khẩu thất bại, vui lòng thử lại.";

            set({ errorMessage: msg });
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    resetState: () => set({ successMessage: null, errorMessage: null }),
}));
