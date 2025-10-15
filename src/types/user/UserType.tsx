export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum Rank {
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD",
    DIAMOND = "DIAMOND",
    ELITE = "ELITE",
    MASTER = "MASTER",
    WARLORD = "WARLORD"
}


export interface UserAuth {
    // idUser: number;
    // username: string;
    // email: string;
    // point: number;
    // rank: Rank;
    // role: Role;
    userId: string;
    username: string;
    fullName: string;
    role: string;
    permissions: string[];
}


export const DEFAULT_USER: UserAuth = {
    userId: "Không tồn tại",
    username: "Guest",
    fullName: "Guest User",
    role: "Guest",
    permissions: [],
};
