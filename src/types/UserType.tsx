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


export interface User {
    idUser: number;
    username: string;
    email: string;
    point: number;
    rank: Rank;
    role: Role;
}
