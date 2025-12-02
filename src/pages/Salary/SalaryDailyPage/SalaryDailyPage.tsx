// src/pages/SalaryDailyPage.tsx
import React, { useEffect, useMemo } from "react";
import { Table, Tag, Card, Space, Button, Typography, message } from "antd";
import { useSearchParams, useNavigate, useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { useSalaryDailyStore } from "src/stores/useSalaryDailyStore";
import type { SalaryDaily } from "src/types/salary/SalaryDaily";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify } from "lucide-react";

const { Title } = Typography;

const statusTag = (s: SalaryDaily["trangThai"]) => {
    switch (s) {
        case "present":
            return <Tag color="green">Đi làm</Tag>;
        case "absent":
            return <Tag color="red">Vắng</Tag>;
        case "late":
            return <Tag color="orange">Đi muộn</Tag>;
        case "leave":
            return <Tag color="blue">Nghỉ phép</Tag>;
        case "ot":
            return <Tag color="purple">OT</Tag>;
        case "completed":
            return <Tag color="geekblue">Hoàn tất</Tag>;
        case null:
        case undefined:
            return <Tag>—</Tag>;
        default:
            // nếu API trả số (ví dụ mã trạng thái)
            return <Tag>{String(s)}</Tag>;
    }
};

export const SalaryDailyPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const employeeId = searchParams.get("employeeId") ?? "";
    const month = searchParams.get("month") ?? dayjs().format("YYYY-MM");

    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    const { records, loading, error, fetchDaily, clear } = useSalaryDailyStore();

    useEffect(() => {
        if (!employeeId) {
            message.error("Thiếu employeeId");
            return;
        }
        fetchDaily(employeeId, month);
        return () => clear();
    }, [employeeId, month]);

    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                    Chi tiết lương theo ngày • {month} • {employeeId}
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, employeeId, month]);

    const columns: ColumnsType<SalaryDaily> = [
        {
            title: "Ngày",
            dataIndex: "ngay",
            key: "ngay",
            render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
            fixed: "left",
        },
        {
            title: "Trạng thái",
            dataIndex: "trangThai",
            key: "trangThai",
            render: statusTag,
        },
        {
            title: "Số công",
            dataIndex: "soCong",
            key: "soCong",
            align: "right",
        },
        {
            title: "Phụ cấp",
            dataIndex: "phuCap",
            key: "phuCap",
            align: "right",
            render: (v: number) => v.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Thưởng",
            dataIndex: "thuong",
            key: "thuong",
            align: "right",
            render: (v: number) => v.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Giờ OT duyệt",
            dataIndex: "gioOtDuocDuyet",
            key: "gioOtDuocDuyet",
            align: "right",
        },
        {
            title: "Giờ OT thực tế",
            dataIndex: "gioOtThucTe",
            key: "gioOtThucTe",
            align: "right",
        },
        {
            title: "Lương OT",
            dataIndex: "luongOt",
            key: "luongOt",
            align: "right",
            render: (v: number) => v.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Phạt",
            dataIndex: "phat",
            key: "phat",
            align: "right",
            render: (v: number) => v.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Lương ngày",
            dataIndex: "luongNgay",
            key: "luongNgay",
            align: "right",
            render: (v: number) => v.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Ghi chú",
            dataIndex: "ghiChu",
            key: "ghiChu",
            width: 260,
            ellipsis: true,
        },
    ];

    const totals = useMemo(() => {
        const sum = (k: keyof SalaryDaily) =>
            records.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
        return {
            soCong: sum("soCong"),
            phuCap: sum("phuCap"),
            thuong: sum("thuong"),
            gioOtDuocDuyet: sum("gioOtDuocDuyet"),
            gioOtThucTe: sum("gioOtThucTe"),
            luongOt: sum("luongOt"),
            phat: sum("phat"),
            luongNgay: sum("luongNgay"),
        };
    }, [records]);

    return (
        <Card style={{ borderRadius: 8 }}>
            <Space className="mb-3">
                <Button onClick={() => navigate(-1)} icon={<IconWrapper Icon={AlignJustify} />}>
                    Quay lại
                </Button>
            </Space>

            <Table<SalaryDaily>
                rowKey={(r) => `${r.ngay}-${r.trangThai ?? ""}`}
                columns={columns}
                dataSource={records}
                loading={loading}
                pagination={{ pageSize: 15 }}
                scroll={{ x: 1000 }}
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={2}>
                                <b>Tổng</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} align="right">
                                <b>{totals.soCong}</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={3} align="right">
                                <b>{totals.phuCap.toLocaleString("vi-VN")} đ</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align="right">
                                <b>{totals.thuong.toLocaleString("vi-VN")} đ</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={5} align="right">
                                <b>{totals.gioOtDuocDuyet}</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={6} align="right">
                                <b>{totals.gioOtThucTe}</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={7} align="right">
                                <b>{totals.luongOt.toLocaleString("vi-VN")} đ</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={8} align="right">
                                <b>{totals.phat.toLocaleString("vi-VN")} đ</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={9} align="right">
                                <b>{totals.luongNgay.toLocaleString("vi-VN")} đ</b>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={10} />
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
                locale={{
                    emptyText: error ? `Lỗi: ${error}` : "Không có dữ liệu",
                }}
            />
        </Card>
    );
};

export default SalaryDailyPage;
