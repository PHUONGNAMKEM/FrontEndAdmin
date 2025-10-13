export interface Employee {
    id: string;
    code: string;
    full_name: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
    cccd: string;
    email: string;
    phone: string;
    address: string;
    hire_date: string;
    department_id: string;
    position_id: string;
    status: 'active' | 'inactive';
    avatar_url?: string;
    department: string;
    position: string;
}
