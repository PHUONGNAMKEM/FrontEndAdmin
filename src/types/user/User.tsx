import { Employee } from "../employee/Employee";
import { Role } from "./Role";

export interface User {
    id: string;
    employee_id: string;
    username: string;
    password_hash?: string; // có thể không trả về ở FE
    role_id: string;
    status: "active" | "inactive";
    is_first_login: boolean;
    last_login_at: string | null;
    employee?: Employee
    role?: Role
}
