import { create } from "zustand";
import { fetchGeneralReportAPI, fetchPayslipEmployeeAPI, fetchProfileEmployeeAPI } from "src/services/api.services";
import { message } from "antd";

interface PDFStore {
    isModalOpen: boolean;

    downloadPayslipEmployee: (salaryId: string) => Promise<void>;
    downloadProfileEmployee: (salaryId: string) => Promise<void>;
    downloadGeneralReport: (month: string, year: string) => Promise<void>;
    setModalOpen: (value: boolean) => void;
}

export const usePDFStore = create<PDFStore>((set, get) => ({
    isModalOpen: false,

    downloadPayslipEmployee: async (salaryId: string) => {
        const res = await fetchPayslipEmployeeAPI(salaryId);

        const blob = new Blob([res.data], { type: "application/pdf" }); // blob là đối tượng đại diện cho dữ liệu dạng file, là data PDF nhận về từ API
        const url = window.URL.createObjectURL(blob); // tạo URL tạm thời trỏ đến file PDF đó

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.click();

        URL.revokeObjectURL(url); // url tạm chiếm ram, nên phải thu hồi sau khi dùng xong
    },

    downloadProfileEmployee: async (employeeId: string) => {
        const res = await fetchProfileEmployeeAPI(employeeId);

        const blob = new Blob([res.data], { type: "application/pdf" }); // blob là đối tượng đại diện cho dữ liệu dạng file, là data PDF nhận về từ API
        const url = window.URL.createObjectURL(blob); // tạo URL tạm thời trỏ đến file PDF đó

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.click();

        URL.revokeObjectURL(url); // url tạm chiếm ram, nên phải thu hồi sau khi dùng xong
    },

    downloadGeneralReport: async (month: string, year: string) => {
        const res = await fetchGeneralReportAPI(month, year);

        const blob = new Blob([res.data], { type: "application/pdf" }); // blob là đối tượng đại diện cho dữ liệu dạng file, là data PDF nhận về từ API
        const url = window.URL.createObjectURL(blob); // tạo URL tạm thời trỏ đến file PDF đó

        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.click();

        URL.revokeObjectURL(url); // url tạm chiếm ram, nên phải thu hồi sau khi dùng xong
    },


    setModalOpen: (value) => set({ isModalOpen: value }),
}));
