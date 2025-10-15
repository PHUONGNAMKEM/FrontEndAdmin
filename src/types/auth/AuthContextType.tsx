import { UserAuth } from "../user/UserType";

export type AuthContextType = {
    user: UserAuth | null;
    setUser: React.Dispatch<React.SetStateAction<UserAuth | null>>;
    isAppLoading: boolean;
    setIsAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
