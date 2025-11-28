import { Dayjs } from "dayjs";

export interface WorkSchedule {
    id: string;
    employeeId: string;
    employeeFullName: string;
    date: string; // "YYYY-MM-DD"
    shiftTemplateId: string;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    note?: string;
    totalWorkingHours: number;
    workDay: number;
}

// Dùng cho query filter
export interface WorkScheduleFilters {
    employeeId?: string;
    departmentId?: string;
    shiftTemplateId?: string;
    from?: string; // "YYYY-MM-DD"
    to?: string;   // "YYYY-MM-DD"
}

// Dùng cho create/update
export interface WorkSchedulePayload {
    employeeId: string;
    date: string; // "YYYY-MM-DD"
    shiftTemplateId: string;
    note?: string;
}

// Dùng cho BULK (Insert và Update thôi)
export interface WorkScheduleBulkCreatePayload {
    employeeIds?: string[];   // nếu chọn 1 số nhân viên (nhiều á)
    departmentId?: string;    // hoặc chọn cả phòng ban (lấy toàn bộ nv trong pban)
    fromDate: string;         // "YYYY-MM-DD"
    toDate: string;
    daysOfWeek?: number[];    // 0 = CN, 1 = Th2, ...
    shiftTemplateId: string;
    note?: string;
    overwrite?: boolean;
}

export interface WorkScheduleBulkDeletePayload {
    employeeIds?: string[];
    departmentId?: string;
    fromDate: string;
    toDate: string;
}
