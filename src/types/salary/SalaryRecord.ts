export interface SalaryRecord {
    month: string;
    thongTinNhanVien: {
        employeeId: string;
        contractType: string;
        basicSalary: number;
        insuranceSalary: number;
    };
    chamCong: {
        soCongPhanCong: number;
        soCongThucTe: number;
        soLanDiMuon: number;
        soLanVang: number;
        soLanVeSom: number;
    };
    luong: {
        tongPhuCap: number;
        tongThuong: number;
        tongPhat: number;
        luongMotNgayCong: number;
        luongMotGio: number;
        soGioOT: number;
        heSoOT: number;
        tongGioOTThucTe: number;
        luongOT: number;
        bhxh: number;
        bhyt: number;
        bhtn: number;
        baoHiem: number;
        luongThucNhan: number;
    };
}