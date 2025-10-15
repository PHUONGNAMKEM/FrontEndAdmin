export interface Employee {
    id?: string;
    code?: string;
    fullName: string;
    gender: 0 | 1 | 2;
    dob: string;
    cccd: string;
    email: string;
    phone: string;
    address: string;
    hireDate: string;
    departmentId: string;
    positionId: string;
    status: 0 | 1 | 2; // active | unactive | khác
    avatarUrl?: string;
    departmentName?: string;
    positionName?: string;
}
