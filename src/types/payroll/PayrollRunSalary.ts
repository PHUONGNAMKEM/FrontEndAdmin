export interface PayrollRunSalary {
    id: string;
    employeeId: string;
    employeeName: string;
    payrollRunId: string;
    period: string; // Kỳ lương
    gross: number; // Tổng thu nhập
    net: number;   // Lương thực nhận
    details: string;
}