export interface Dashboard {
    summary: Summary;
    charts: Charts;
    employeesByDepartment: EmployeeDepartmentCount[];
    expiringContracts: ExpiringContracts;
    attendanceToday: AttendanceToday;
    leaveStats: LeaveStats;
    disciplineStats: DisciplineStats;
    courseStats: CourseStats;
    salaryStats: SalaryStats;
    performanceStats: PerformanceStats;
}

export interface Summary {
    totalEmployees: number;
    totalDepartments: number;
    workingCount: number;
    contractsExpiring: number;
    contractsExpiringWithinDays: number;
}

export interface Charts {
    hiresQuits: {
        labels: string[];
        hires: number[];
        quits: number[];
    };
}

export interface EmployeeDepartmentCount {
    departmentId: string;
    departmentName: string;
    count: number;
}

export interface ExpiringContracts {
    meta: { count: number };
    items: ExpiringContractItem[];
}

export interface ExpiringContractItem {
    id: string;
    employeeId: string;
    employeeName: string;
    contractNumber: string;
    endDate: string;
    status: string;
}

export interface AttendanceToday {
    totalWorkingToday: number;
    checkedIn: number;
    onTime: number;
    late: number;
    onLeave: number;
    absent: number;
    notCheckedInYet: number;
}

export interface LeaveStats {
    onLeaveToday: number;
    pendingApproval: number;
    approvedThisMonth: number;
}

export interface DisciplineStats {
    penaltiesThisMonth: number;
    penaltiesToday: number;
}

export interface CourseStats {
    total: number;
    newThisMonth: number;
}

export interface SalaryStats {
    lastFinalizedPeriod: string;
    totalGross: number;
    totalNet: number;
}

export interface PerformanceStats {
    attendanceThisMonth: {
        totalLate: number;
        totalAbsent: number;
        totalOnTime: number;
    };
    trainingAllTime: {
        completed: number;
        failed: number;
        inProgress: number;
        averageScore: number;
    };
}
