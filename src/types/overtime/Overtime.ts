export interface Overtime {
    id: string;
    employeeId: string;
    employeeFullName: string;
    departmentId: string;
    departmentName: string;
    positionId: string;
    positionName: string;
    date: string;
    hours: number;
    rate: number;
    reason: string;
}