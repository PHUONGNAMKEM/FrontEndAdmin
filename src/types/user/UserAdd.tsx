export interface UserAdd {
    employeeId: string;
    userName: string;
    roleId: string;
    status: number; // 0 active, 1 locked, 2 ???
    tempPassword: string;
}