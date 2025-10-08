import { User } from "./UserType";

export type AuthContextType = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isAppLoading: boolean;
    setIsAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
