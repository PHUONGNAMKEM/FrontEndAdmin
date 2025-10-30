export interface SalaryDaily {
    ngay: string,
    trangThai: null | "present" | "absent" | "late" | "leave" | "ot" | "completed" | number,
    soCong: number,
    phuCap: number,
    thuong: number,
    gioOtDuocDuyet: number,
    gioOtThucTe: number,
    luongOt: number,
    phat: number,
    luongNgay: number,
    ghiChu: string
}
