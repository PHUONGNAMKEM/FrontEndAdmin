import { create } from "zustand";
import { fetchAttendanceReportAPI, fetchCourseSummaryReportAPI, fetchEmployeesReportAPI, fetchPersonalTranscriptAPI, fetchSalarySummaryAPI, fetchSalaryTableReportAPI, fetchTrainingResultsAPI } from "src/services/api.services";

interface ExcelStore {
    isModalOpen: boolean;

    downloadEmployeesReport: () => Promise<void>;
    downloadTrainingResults: (courseId?: string, status?: number) => Promise<void>;
    downloadCourseSummaryReport: () => Promise<void>;
    downloadPersonalTranscript: (employeeId: string) => Promise<void>;
    downloadAttendanceReport: (params: Record<string, any>) => Promise<void>;
    downloadSalaryTableReport: (params: Record<string, any>) => Promise<void>;
    downloadSalarySummary: (payrollRunId: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const useExcelStore = create<ExcelStore>((set, get) => ({
    isModalOpen: false,

    downloadEmployeesReport: async () => {
        const res = await fetchEmployeesReportAPI();

        // MIME TYPE chuẩn Excel (xlsx)
        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = "Employees_Report.xlsx";
        a.click();

        URL.revokeObjectURL(url);
    },

    downloadTrainingResults: async (courseId?: string, status?: number) => {
        const res = await fetchTrainingResultsAPI(courseId, status);

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = "Training_Results.xlsx";
        a.click();

        URL.revokeObjectURL(url);
    },

    downloadCourseSummaryReport: async () => {
        const res = await fetchCourseSummaryReportAPI();

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = "Course_Summary.xlsx";
        a.click();

        URL.revokeObjectURL(url);
    },

    downloadPersonalTranscript: async (employeeId: string) => {
        const res = await fetchPersonalTranscriptAPI(employeeId);

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = `Transcript_${employeeId}.xlsx`;
        a.click();

        URL.revokeObjectURL(url);
    },

    downloadAttendanceReport: async (params) => {
        const res = await fetchAttendanceReportAPI(params);

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = "Attendance_Detail.xlsx";
        a.click();

        URL.revokeObjectURL(url);
    },

    downloadSalaryTableReport: async (params) => {
        const res = await fetchSalaryTableReportAPI(params);

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = "Reward_Penalty_Report.xlsx";
        a.click();

        URL.revokeObjectURL(url);
    },

    downloadSalarySummary: async (payrollRunId: string) => {
        const res = await fetchSalarySummaryAPI(payrollRunId);

        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.download = `Payroll_Summary_${payrollRunId}.xlsx`;
        a.click();

        URL.revokeObjectURL(url);
    },

    setModalOpen: (value) => set({ isModalOpen: value }),
}));
