export interface Request {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeCode: string;
    title: string;
    description: string;
    // category: "ot" | "leave" | " resignation" | " business_trip" | " incident" | " proposal" | "other";
    category: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    // status: "pending" | "approved" | "rejected" | "cancelled";
    status: 0 | 1 | 2 | string;
    date: string;
    fromDate: string;
    toDate: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    approvedBy?: string | null;
}