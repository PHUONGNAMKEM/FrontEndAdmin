export interface Role {
    id: string;
    name: "Admin" | "HR" | "Staff" | string;
    description?: string;
}
