export interface ShiftTemplate {
    id: string;
    code: string;
    name: string;
    startTime: string;
    endTime: string;
    breakDurationMinutes: number;
    totalWorkingHours: number;
    description?: string;
    workDay: number;
}
