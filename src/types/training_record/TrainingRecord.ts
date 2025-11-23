export interface TrainingRecord {
    id: string;
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    courseId: string;
    courseName: string;
    score: number;
    status: number; // 0,1,2,3
    evaluatedBy: string;
    evaluatedByUserName: string;
    evaluationNote: string;
}