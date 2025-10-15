export interface Role {
    id: string;
    name: "Admin" | "HR" | "User" | string;
    description?: string;
}
