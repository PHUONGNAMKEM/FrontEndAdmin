export interface PayrollRun {
    id: string;
    period: string; // kỳ lương, ví dụ: "2025-10", truyền vào năm và tháng 
    status: "draft" | "processed" | "locked";
}