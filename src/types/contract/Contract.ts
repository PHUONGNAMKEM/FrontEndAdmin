export interface Contract {
    id?: string;
    employeeId: string;
    employeeCode?: string;
    employeeName?: string;
    contractNumber?: string;
    title: string;
    type: number;
    signedDate: string;
    startDate: string;
    endDate: string;
    workType: number;
    basicSalary: number;
    insuranceSalary?: number;
    representativeId: string;
    representativeUserName?: string;
    status: number;
    attachmentUrl?: string;
    notes?: string;
}