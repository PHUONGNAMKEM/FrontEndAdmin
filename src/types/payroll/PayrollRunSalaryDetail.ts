export interface PayrollRunSalaryDetail {
    employee: {
        id: string;
        fullName: string;
        code: string;
    };
    payroll: {
        salaryId: string;
        period: string;
        grossSalary: number;
        netSalary: number;
        totalEarnings: number;
        totalDeductions: number;
        detailsJson: string;
    };
    items: {
        itemId: string;
        type: "bonus" | "insurance" | "basic" | "deduction" | string;
        amount: number;
        note: string;
    }[];
}
