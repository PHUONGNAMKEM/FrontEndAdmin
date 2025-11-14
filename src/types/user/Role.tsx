import { Permission } from "../permission/Permission";

export interface Role {
    id: string;
    name: "Admin" | "HR" | "User" | string;
    description?: string;
    usersCount?: number;
    permissions?: Permission[];
}
