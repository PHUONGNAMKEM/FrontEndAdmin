// import axios from "axios";
import { RcFile } from "antd/es/upload";
import { GoalType } from "../types/Goal/GoalType";
import { TaskType } from "../types/TaskType";
import axios from "./axios.customize";
import dayjs, { Dayjs } from "dayjs";
import { ApiResponse } from "src/types/api";
import { Employee } from "src/types/employee/Employee";
import { Department } from "src/types/department/Department";
import { Position } from "src/types/position/Position";
import { Contract } from "src/types/contract/Contract";
import { RewardPenalty } from "src/types/rewardPenalty/RequardPenalty";
import { RewardPenaltyDetail } from "src/types/rewardPenalty/RewardPenaltyDetail";
import { SalaryConfig } from "src/types/salary/SalaryConfig";
import { SalaryRecord } from "src/types/salary/SalaryRecord";
import { Overtime } from "src/types/overtime/Overtime";
import { Course } from "src/types/course/Course";
import { CourseQuestion } from "src/types/course/CourseQuestion";
import { User } from "src/types/user/User";
import { Role } from "src/types/user/Role";
import { CreateNotificationPayload } from "src/types/notification/CreateNotificationPayload";
import { UpdateNotificationPayload } from "src/types/notification/UpdateNotificationPayload";
import { Dashboard } from "src/types/dashboard/Dashboard";
import { TrainingRecord } from "src/types/training_record/TrainingRecord";
import { UserAdd } from "src/types/user/UserAdd";
import { ForgotPasswordRequest } from "src/types/auth/ForgotPassword";
import { ShiftTemplate } from "src/types/shift/ShiftTemplate";
import { WorkScheduleBulkCreatePayload, WorkScheduleBulkDeletePayload, WorkScheduleFilters, WorkSchedulePayload } from "src/types/work/WorkSchedule";


// Employee
export const fetchEmployeeAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = current && pageSize
        ? `/api/Employee?${query}current=${current}&pageSize=${pageSize}`
        : `/api/Employee`;
    return axios.get(URL_BACKEND);
}

export const createEmployeeAPI = (payload: FormData): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Employee";
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };
    return axios.post(`${URL_BACKEND}`, payload, config);
};

export const updateEmployeeAPI = (id: string, payload: FormData): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Employee/${id}`;
    const config = {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    };
    // const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, payload, config);
};

//https://hrmadmin.huynhthanhson.io.vn/api/Employee/filter?fields=fullname&q=Hu%E1%BB%B3nh&current=1&pageSize=20
export const fetchFilteredEmployeesAPI = (filters: Record<string, any>, current = 1, pageSize = 10): Promise<ApiResponse> => {
    const params = new URLSearchParams;

    // Lấy ra các key hợp lý - có value, value ko bị null object[key] = value
    const validKeys = Object.keys(filters).filter(
        (key) => filters[key] !== null && filters[key] !== undefined && filters[key] !== ""
    );

    // Object.keys trả về mảng các key hợp lý -> thêm các key hợp lý vào fields
    // if (validKeys.length > 0) {
    //     params.append("fields", validKeys.join(','));
    // }

    // Thêm các query (key=value) vào url cách 1 (ở đây có validKeys rồi nên dùng lại luôn)
    validKeys.forEach((key) => {
        params.append(key, filters[key]);
    });

    // Thêm các query (key=value) vào url cách 2
    // Object.entries(filters).forEach(([key, value]) => {
    //     if (value) params.append(key, value);
    // });

    params.append("current", current.toString());
    params.append("pageSize", pageSize.toString());
    return axios.get(`/api/Employee/filter?${params.toString()}`);
};

export const deleteEmployeeAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Employee/${id}`;

    return axios.delete(`${URL_BACKEND}`);
};

// Change Password
export const changePasswordAPI = (currentPassword: string | undefined, newPassword: string | undefined): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Auth/change-password`;
    const data = {
        currentPassword,
        newPassword
    }
    return axios.post(URL_BACKEND, data);
}

// Forgot Password
export const forgotPasswordAPI = (payload: ForgotPasswordRequest): Promise<ApiResponse> => {
    return axios.post("/api/Auth/forgot-password", payload);
};

// Department
export const fetchDepartmentAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/Department?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createDepartmentAPI = (payload: Department): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Department";
    return axios.post(`${URL_BACKEND}`, payload);
}

export const updateDepartmentAPI = (id: string, payload: Partial<Department>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Department/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
}

export const deleteDepartmentAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Department/${id}`;
    return axios.delete(`${URL_BACKEND}`);
}

// Position
export const fetchPositionAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/Position?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createPositionAPI = (payload: Position): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Position";
    return axios.post(`${URL_BACKEND}`, payload);
}

export const updatePositionAPI = (id: string, payload: Partial<Position>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Position/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
}

export const deletePositionAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Position/${id}`;
    return axios.delete(`${URL_BACKEND}`);
}

// Contract
export const fetchContractAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/Contract?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const fetchContractExpiresAPI = (current: number, pageSize: number, withinDays: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract/expiring?withinDays=${withinDays}&current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const createContractAPI = (payload: Contract): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Contract";
    return axios.post(`${URL_BACKEND}`, payload);
}

export const updateContractAPI = (id: string, payload: Partial<Contract>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
}

export const deleteContractAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Contract/${id}`;
    return axios.delete(`${URL_BACKEND}`);
}

// Request
export const fetchRequestAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/Request?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const updateRequestStatusAPI = (id: string, newStatus: string | number, approverUserId: string, reason: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Request/process/${id}`;
    return axios.put(URL_BACKEND, { newStatus, approverUserId, reason });
};

// Salary Config
export const fetchSalaryConfigAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/GlobalSettings?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const createSalaryConfigAPI = (payload: SalaryConfig): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/GlobalSettings";
    return axios.post(`${URL_BACKEND}`, payload);
};

export const updateSalaryConfigAPI = (id: string, payload: Partial<SalaryConfig>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/GlobalSettings/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
};

export const deleteSalaryConfigAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/GlobalSettings/${id}`;
    return axios.delete(`${URL_BACKEND}`);
};

// RewardPenaltyType
export const fetchRewardPenaltyAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/RewardPenaltyTypes?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const filterRewardPenaltyAPI = (current: number, pageSize: number, type: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/RewardPenaltyTypes?type=${type}&current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const createRewardPenaltyAPI = (payload: RewardPenalty): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/RewardPenaltyTypes";
    return axios.post(`${URL_BACKEND}`, payload);
};

export const updateRewardPenaltyAPI = (id: string, payload: Partial<RewardPenalty>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/RewardPenaltyTypes/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
};

export const deleteRewardPenaltyAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/RewardPenaltyTypes/${id}`;
    return axios.delete(`${URL_BACKEND}`);
};

// RewardPenalties
export const fetchRewardPenaltiesAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/RewardPenalties?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const filterRewardPenaltiesAPI = (current: number, pageSize: number, type: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/RewardPenalties?kind=${type}&current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const createRewardPenaltiesAPI = (payload: RewardPenaltyDetail): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/RewardPenalties";
    return axios.post(`${URL_BACKEND}`, payload);
};

export const updateRewardPenaltiesAPI = (id: string, payload: Partial<RewardPenaltyDetail>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/RewardPenalties/${id}`;
    const data = { ...payload };
    return axios.put(`${URL_BACKEND}`, data);
};

export const deleteRewardPenaltiesAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/RewardPenalties/${id}`;
    return axios.delete(`${URL_BACKEND}`);
};

// Salary
export const fetchSalaryAllAPI = (month: string, current: number, pageSize: number, departmentId?: string): Promise<ApiResponse> => {
    const params = new URLSearchParams({
        month,
        current: String(current),
        pageSize: String(pageSize),
    });
    if (departmentId) {
        params.append("departmentId", departmentId);
    }
    // const URL_BACKEND = `/api/Payroll/performance-batch?month=${month}&current=${current}&pageSize=${pageSize}`;
    const URL_BACKEND = `/api/Payroll/performance-batch?${params.toString()}`;
    return axios.get(URL_BACKEND);
};

// Salary for employee and month detail
export const fetchSalaryDetailAPI = (employeeId: string, month: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Payroll/performance/${employeeId}?month=${month}`;
    return axios.get(URL_BACKEND);
};

// Salary DAILY of employee and month detail
export const fetchSalaryDailyAPI = (employeeId: string, month: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Payroll/daily/${employeeId}?month=${month}`;
    return axios.get(URL_BACKEND);
};

// Final batch salary
export const finalBatchSalaryAPI = (month: string): Promise<ApiResponse> => {
    const payload = { month };
    return axios.post(`/api/Payroll/finalize-batch`, payload);
};

// Overtime
export const fetchOvertimeAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/Overtimes?${query}current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
};

export const createOvertimeAPI = (payload: Overtime): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Overtimes";
    return axios.post(URL_BACKEND, payload);
};

export const updateOvertimeAPI = (id: string, payload: Partial<Overtime>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Overtimes/${id}`;
    const data = { ...payload };
    return axios.put(URL_BACKEND, data);
};

export const deleteOvertimeAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Overtimes/${id}`;
    return axios.delete(URL_BACKEND);
};

// Payroll Run
export const fetchPayrollRunAllAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `https://hrmadmin.huynhthanhson.io.vn/api/Payroll/payrollruns?${query}current=${current}&pageSize=${pageSize}&sort=Period%20desc`;
    return axios.get(URL_BACKEND);
};

export const fetchPayrollRunSalaryAPI = (idPayRollRun: string, current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `https://hrmadmin.huynhthanhson.io.vn/api/Salary?q=${idPayRollRun}&current=${current}&pageSize=${pageSize}&sort=PayrollRun.Period%20desc`;
    return axios.get(URL_BACKEND);
};

export const fetchPayrollRunSalaryDetailAPI = (salaryId: string): Promise<ApiResponse> => {
    const URL_BACKEND = `https://hrmadmin.huynhthanhson.io.vn/api/Salary/details/${salaryId}`;
    return axios.get(URL_BACKEND);
};

// Course
export const fetchCourseAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `&q=${encodeURIComponent(q)}` : "";
    const URL_BACKEND = `/api/Course?current=${current}&pageSize=${pageSize}${query}&sort=Name`;
    return axios.get(URL_BACKEND);
};

export const createCourseAPI = (payload: Partial<Course>): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Course";
    return axios.post(URL_BACKEND, payload);
};

export const updateCourseAPI = (id: string, payload: Partial<Course>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Course/${id}`;
    return axios.put(URL_BACKEND, payload);
};

export const deleteCourseAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Course/${id}`;
    return axios.delete(URL_BACKEND);
};

// Course Question
export const fetchCourseQuestionsAPI = (courseId: string, current = 1, pageSize = 20, q?: string): Promise<ApiResponse> => {
    let URL_BACKEND = `/api/CourseQuestions?courseId=${courseId}&current=${current}&pageSize=${pageSize}&sort=Content`;
    if (q && q.trim()) URL_BACKEND += `&q=${encodeURIComponent(q.trim())}`;
    return axios.get(URL_BACKEND);
};

export const createCourseQuestionAPI = (payload: CourseQuestion): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/CourseQuestions`;
    return axios.post(URL_BACKEND, payload);
};

export const updateCourseQuestionAPI = (id: string, payload: Partial<CourseQuestion>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/CourseQuestions/${id}`;
    return axios.put(URL_BACKEND, payload);
};

export const deleteCourseQuestionAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/CourseQuestions/${id}`;
    return axios.delete(URL_BACKEND);
};

// Notification History
export const fetchAllNotificationsHistoryAPI = (current: number, pageSize: number): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/Notifications/list?current=${current}&pageSize=${pageSize}&sort=Id desc`;
    return axios.get(URL_BACKEND);
};

export const fetchNotificationsHistoryAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `&q=${encodeURIComponent(q)}` : "";
    const URL_BACKEND = `/api/Notifications/list?current=${current}&pageSize=${pageSize}${query}&sort=Id desc`;

    return axios.get(URL_BACKEND);
};

// Fetch List Notification
export const fetchNotificationsAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `&q=${encodeURIComponent(q)}` : "";
    const URL_BACKEND = `/api/Notifications?current=${current}&pageSize=${pageSize}${query}&sort=CreatedAt desc`;
    return axios.get(URL_BACKEND);
};

export const createNotificationAPI = (payload: Partial<CreateNotificationPayload>): Promise<ApiResponse> => {
    const actorId = localStorage.getItem("userId");
    const URL_BACKEND = `/api/Notifications/create-hr`;
    return axios.post(URL_BACKEND, { ...payload, actorId, });
};

export const updateNotificationAPI = (id: string, payload: Partial<UpdateNotificationPayload>): Promise<ApiResponse> => {
    const actorId = localStorage.getItem("userId");
    const URL_BACKEND = `/api/Notifications/${id}`;
    return axios.put(URL_BACKEND, { ...payload, actorId });
};

export const deleteNotificationAPI = (id: string, payload: Partial<UpdateNotificationPayload>): Promise<ApiResponse> => {
    const actorId = localStorage.getItem("userId");
    const URL_BACKEND = `/api/Notifications/${id}`;
    return axios.put(URL_BACKEND, { ...payload, actorId });
};

// Dashboard
export const fetchDashboardAPI = (expiringWithinDays: number = 30): Promise<{ data: { result: Dashboard } }> => {
    const URL = `/api/Dashboard?expiringWithinDays=${expiringWithinDays}`;
    return axios.get(URL);
};

// Report PDF
export const fetchPayslipEmployeeAPI = (salaryId: string) => {
    return axios.get(`/api/PdfReport/payslip-report-pdf/${salaryId}`, {
        responseType: "blob", // do responseType: "blob"
    });
};
// vì axios coi response về mặc định là JSON, mà PDF với excel đồ á là data dạng binary, nên dùng response type là blob (Binary Large Object) kiểu dạng nhị phân

export const fetchProfileEmployeeAPI = (employeeId: string) => {
    return axios.get(`/api/PdfReport/profile-report-pdf/${employeeId}`, {
        responseType: "blob", // do responseType: "blob"
    });
};

export const fetchGeneralReportAPI = (month: string, year: string, returnType = "stream") => {
    return axios.get(`/api/PdfReport/general-report-pdf?month=${month}&year=${year}&returnType=${returnType}`, {
        responseType: "blob", // do responseType: "blob"
    });
};

// Report Excel
export const fetchEmployeesReportAPI = () => {
    return axios.get(`/api/Report/employees-report`, {
        responseType: "blob", // do responseType: "blob"
    });
};

export const fetchTrainingResultsAPI = (courseId?: string, status?: number) => {
    return axios.get(`/api/Report/training-record-report`, {
        params: { courseId, status },
        responseType: "blob",
    });
};

export const fetchCourseSummaryReportAPI = () => {
    return axios.get(`/api/Report/course-summary-report`, {
        responseType: "blob",
    });
};

export const fetchPersonalTranscriptAPI = (employeeId: string) => {
    return axios.get(`/api/Report/personal-training-record-report/${employeeId}`, {
        responseType: "blob",
    });
};

export const fetchAttendanceReportAPI = (params: { fromDate?: string; toDate?: string; departmentId?: string; employeeId?: string; }) => {
    return axios.get(`/api/Report/attendance-report`, {
        params,
        responseType: "blob",
    });
};

export const fetchSalaryTableReportAPI = (params: {
    fromDate?: string; toDate?: string; departmentId?: string; employeeId?: string; kind?: number; // 0 reward, 1 penalty
}) => {
    return axios.get(`/api/Report/salaries-table-report`, {
        params,
        responseType: "blob",
    });
};

export const fetchSalarySummaryAPI = (payrollRunId: string) => {
    return axios.get(`/api/Report/export-summary`, {
        params: { payrollRunId },
        responseType: "blob",
    });
};

// Training Record
export const fetchTrainingRecordAPI = (current: number, pageSize: number,
    filters?: {
        courseId?: string;
        employeeName?: string;
        status?: number;
    }
): Promise<ApiResponse> => {
    let URL_BACKEND = `/api/TrainingRecord?current=${current}&pageSize=${pageSize}&sort=-Score`;

    if (filters?.courseId) {
        URL_BACKEND += `&courseId=${filters.courseId}`;
    }
    if (filters?.employeeName) {
        URL_BACKEND += `&employeeName=${encodeURIComponent(filters.employeeName)}`;
    }
    if (filters?.status !== null && filters?.status !== undefined) {
        URL_BACKEND += `&status=${filters.status}`;
    }

    return axios.get(URL_BACKEND);
};

export const updateTrainingRecordAPI = (id: string, payload: Partial<TrainingRecord>): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/TrainingRecord/${id}`;
    return axios.put(URL_BACKEND, payload);
};

export const deleteTrainingRecordAPI = (id: string): Promise<ApiResponse> => {
    const URL_BACKEND = `/api/TrainingRecord/${id}`;
    return axios.delete(URL_BACKEND);
};

export const createTrainingRecordAPI = (payload: { employeeId: string; courseId: string; evaluatedBy: string; evaluationNote?: string; }) => {
    return axios.post(`/api/TrainingRecord`, payload);
};

// Shift Template
export const fetchShiftTemplatesAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/ShiftTemplate?${query}current=${current}&pageSize=${pageSize}&sort=Code`;
    return axios.get(URL_BACKEND);
};

export const createShiftTemplateAPI = (payload: Partial<ShiftTemplate>): Promise<ApiResponse> => {
    return axios.post("/api/ShiftTemplate", payload);
};

export const updateShiftTemplateAPI = (id: string, payload: Partial<ShiftTemplate>): Promise<ApiResponse> => {
    return axios.put(`/api/ShiftTemplate/${id}`, payload);
};

export const deleteShiftTemplateAPI = (id: string): Promise<ApiResponse> => {
    return axios.delete(`/api/ShiftTemplate/${id}`);
};

// Work Schedule
export const fetchWorkSchedulesAPI = (current: number, pageSize: number, filters?: WorkScheduleFilters): Promise<ApiResponse> => {
    let URL_BACKEND = `/api/WorkSchedule?current=${current}&pageSize=${pageSize}&sort=Date`;

    if (filters?.employeeId) {
        URL_BACKEND += `&employeeId=${filters.employeeId}`;
    }
    if (filters?.departmentId) {
        URL_BACKEND += `&departmentId=${filters.departmentId}`;
    }
    if (filters?.shiftTemplateId) {
        URL_BACKEND += `&shiftTemplateId=${filters.shiftTemplateId}`;
    }
    if (filters?.from) {
        URL_BACKEND += `&from=${filters.from}`;
    }
    if (filters?.to) {
        URL_BACKEND += `&to=${filters.to}`;
    }

    return axios.get(URL_BACKEND);
};

export const createWorkScheduleAPI = (payload: WorkSchedulePayload): Promise<ApiResponse> => {
    return axios.post("/api/WorkSchedule", payload);
};

export const updateWorkScheduleAPI = (id: string, payload: Partial<WorkSchedulePayload>): Promise<ApiResponse> => {
    return axios.put(`/api/WorkSchedule/${id}`, payload);
};

export const deleteWorkScheduleAPI = (id: string): Promise<ApiResponse> => {
    return axios.delete(`/api/WorkSchedule/${id}`);
};

// Work Schedule Bulk (Insert and Update)
export const bulkCreateWorkScheduleAPI = (payload: WorkScheduleBulkCreatePayload): Promise<ApiResponse> => {
    return axios.post("/api/WorkSchedule/bulk", payload);
};

export const bulkDeleteWorkScheduleAPI = (payload: WorkScheduleBulkDeletePayload): Promise<ApiResponse> => {
    // axios.delete muốn gửi body thì phải để trong field data
    return axios.delete("/api/WorkSchedule/bulk", { data: payload });
};


// Role
export const fetchRolesAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `q=${encodeURIComponent(q)}&` : "";
    const URL_BACKEND = `/api/Role?${query}current=${current}&pageSize=${pageSize}&sort=Name`;
    return axios.get(URL_BACKEND);
};

export const createRoleAPI = (payload: Partial<Role>): Promise<ApiResponse> => {
    return axios.post("/api/Role", payload);
};

export const updateRoleAPI = (id: string, payload: Partial<Role>): Promise<ApiResponse> => {
    return axios.put(`/api/Role/${id}`, payload);
};

export const deleteRoleAPI = (id: string): Promise<ApiResponse> => {
    return axios.delete(`/api/Role/${id}`);
};

// User
export const fetchUsersAPI = (current: number, pageSize: number, q?: string): Promise<ApiResponse> => {
    const query = q ? `&q=${encodeURIComponent(q)}` : ""; // encodeURIComponent là để mã hóa các ký tự đặc biệt trong chuỗi tìm kiếm
    const URL_BACKEND = `/api/Users/Search?${query}&current=${current}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

export const filterUsersAPI = (current: number, pageSize: number, q?: string, role?: string): Promise<ApiResponse> => {
    const queryQ = q ? `&q=${encodeURIComponent(q)}` : "";
    const queryRole = role ? `&role=${encodeURIComponent(role)}` : "";

    const URL_BACKEND = `/api/Users/Search?current=${current}&pageSize=${pageSize}${queryQ}${queryRole}`;

    return axios.get(URL_BACKEND);
};

export const createUserAPI = (payload: UserAdd): Promise<ApiResponse> => {
    return axios.post("/api/Users", payload);
};

export const updateUserAPI = (id: string, payload: Partial<User>): Promise<ApiResponse> => {
    return axios.put(`/api/Users/${id}`, payload);
};

export const deleteUserAPI = (id: string): Promise<ApiResponse> => {
    return axios.delete(`/api/Users/${id}`);
};

export const loginAPI = (email: string, password: string): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Auth/login";
    const data = {
        username: email,
        password: password,
        // delay: 2000
    }

    return axios.post(URL_BACKEND, data)
}

export const getAccountAPI = (): Promise<ApiResponse> => {
    const URL_BACKEND = "/api/Auth/me";
    return axios.get(URL_BACKEND)
}

const logoutAPI = () => {
    const URL_BACKEND = "/api/logout";
    return axios.post(URL_BACKEND)
}