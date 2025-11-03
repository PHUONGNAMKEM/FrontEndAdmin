import React, { useEffect, useState } from "react";
import {
    Table,
    Card,
    Descriptions,
    Space,
    Typography,
    Button,
    Tag,
    Pagination,
    Dropdown,
    DatePicker,
    message,
} from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { RefreshCcw, PanelLeft, AlignJustify, Icon, Ellipsis, NotebookTabs } from "lucide-react";
import { useSearchParams, useOutletContext, useNavigate } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useSalaryTableStore } from "src/stores/useSalaryTableStore";
import { SalaryRecord } from "src/types/salary/SalaryRecord";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import dayjs from "dayjs";

const { Title } = Typography;
const { MonthPicker } = DatePicker;

export const SalaryTablePage = () => {
    const { salaryRecords, fetchSalaryTable, fetchSalaryAll, meta } = useSalaryTableStore();
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedRecord, setSelectedRecord] = useState<SalaryRecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // const employeeId = "776EC5CF-8349-4EB9-A6EC-73C75A7C58DB";
    // const month = "2025-10";
    const [month, setMonth] = useState(dayjs());
    const { employees, meta: metaEmployee, fetchEmployees } = useEmployeeStore();

    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch Employees
    useEffect(() => {
        fetchEmployees(currentPage, metaEmployee?.total);
    }, [currentPage, metaEmployee?.total]);

    useEffect(() => {
        fetchSalaryAll(month.format("YYYY-MM"), currentPage, currentSize);
    }, [month, currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    // Header
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                    Bảng lương tháng {month.format("MM/YYYY")} ({salaryRecords?.length ?? 0} nhân viên)
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    const columns = [
        {
            title: "Mã nhân viên",
            dataIndex: ["thongTinNhanVien", "employeeId"],
            key: "employeeId",
        },
        {
            title: "Loại hợp đồng",
            dataIndex: ["thongTinNhanVien", "contractType"],
            key: "contractType",
            render: (text: string) => <Tag color="blue">{text === "FT" ? "Full-Time" : text === "PT" ? "Part-Time" : text === "Intern" ? "Thực tập sinh" : text === "Probation" ? "Thử việc" : text === "FixedTerm" ? "Có thời hạn" : "Thời vụ"}</Tag>,
        },
        {
            title: "Lương cơ bản",
            dataIndex: ["thongTinNhanVien", "basicSalary"],
            key: "basicSalary",
            render: (value: number) => value.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Lương bảo hiểm",
            dataIndex: ["thongTinNhanVien", "insuranceSalary"],
            key: "insuranceSalary",
            render: (value: number) => value.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Lương thực nhận",
            dataIndex: ["luong", "luongThucNhan"],
            key: "luongThucNhan",
            render: (value: number) => value.toLocaleString("vi-VN") + " đ",
        },
    ];

    const items = [
        {
            label: 'Chi tiết từng ngày',
            key: '1',
            icon: <IconWrapper Icon={NotebookTabs} className="!mr-2 !ml-0 !mb-0 !mt-0" size={24} />,
        },
    ];

    const navigate = useNavigate();

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== HEADER TOOLBAR ===== */}
            <div className="flex justify-between mb-4">
                <Space>
                    <Button
                        size="large"
                        type={viewMode === "list" ? "primary" : "default"}
                        icon={
                            <IconWrapper
                                Icon={AlignJustify}
                                color={viewMode === "list" ? "#fff" : undefined}
                            />
                        }
                        onClick={() => setViewMode("list")}
                    />
                    <Button
                        size="large"
                        type={viewMode === "detail" ? "primary" : "default"}
                        icon={
                            <IconWrapper
                                Icon={PanelLeft}
                                color={viewMode === "detail" ? "#fff" : undefined}
                            />
                        }
                        onClick={() => setViewMode("detail")}
                        disabled={!selectedRecord}
                    />
                </Space>

                <Space>
                    <MonthPicker
                        allowClear={false}
                        value={month}
                        format="MM/YYYY"
                        onChange={(month) => {
                            if (month) setMonth(month);
                        }}
                    />
                    <Button
                        size="large"
                        icon={<IconWrapper Icon={RefreshCcw} />}
                        onClick={() => {
                            fetchSalaryAll(month.format("YYYY-MM"), currentPage, currentSize);
                        }}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </Space>
            </div>

            {/* ===== VIEW MODE ===== */}
            {viewMode === "list" ? (
                <Table
                    columns={columns}
                    dataSource={salaryRecords}
                    rowKey={(record) => record.thongTinNhanVien.employeeId}
                    loading={loading}
                    pagination={{
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedRecord(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <Card className="rounded-lg">
                    {selectedRecord ? (
                        <>
                            <div className="flex items-center justify-between">
                                <Title level={4} className="mb-4">
                                    Thông tin chi tiết nhân viên:{" "}
                                    <Tag color="blue">
                                        {selectedRecord.thongTinNhanVien.employeeId}
                                    </Tag>
                                </Title>
                                {/* <Dropdown menu={{ items }} placement="bottomRight" arrow>
                                    <Button
                                        size="large"
                                        icon={<IconWrapper Icon={Ellipsis} size={24} />}
                                        type="default"
                                    />
                                </Dropdown> */}
                                <Dropdown
                                    menu={{
                                        items,
                                        onClick: ({ key }) => {
                                            if (key === "daily") {
                                                const monthStr = month.format("YYYY-MM");
                                                const empId = selectedRecord.thongTinNhanVien.employeeId;
                                                navigate(`http://localhost:3000//salary/daily?employeeId=${encodeURIComponent(empId)}&month=${encodeURIComponent(monthStr)}`);
                                            }
                                        },
                                    }}
                                    placement="bottomRight"
                                    arrow
                                >
                                    <Button
                                        size="large"
                                        icon={<IconWrapper Icon={Ellipsis} size={24} />}
                                        type="default"
                                    />
                                </Dropdown>
                            </div>

                            <Descriptions bordered column={1} title="Thông tin nhân viên" size="middle" layout="horizontal">
                                <Descriptions.Item label="Loại hợp đồng">
                                    {selectedRecord.thongTinNhanVien.contractType}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lương cơ bản">
                                    {selectedRecord.thongTinNhanVien.basicSalary.toLocaleString("vi-VN")} đ
                                </Descriptions.Item>
                                <Descriptions.Item label="Lương bảo hiểm">
                                    {selectedRecord.thongTinNhanVien.insuranceSalary.toLocaleString("vi-VN")} đ
                                </Descriptions.Item>
                            </Descriptions>

                            <Descriptions bordered column={2} title="Chấm công" size="middle" style={{ marginTop: 24 }}>
                                <Descriptions.Item label="Công phân công">
                                    {selectedRecord.chamCong.soCongPhanCong}
                                </Descriptions.Item>
                                <Descriptions.Item label="Công thực tế">
                                    {selectedRecord.chamCong.soCongThucTe}
                                </Descriptions.Item>
                                <Descriptions.Item label="Đi muộn">
                                    {selectedRecord.chamCong.soLanDiMuon}
                                </Descriptions.Item>
                                <Descriptions.Item label="Vắng">
                                    {selectedRecord.chamCong.soLanVang}
                                </Descriptions.Item>
                                <Descriptions.Item label="Về sớm">
                                    {selectedRecord.chamCong.soLanVeSom}
                                </Descriptions.Item>
                                <Descriptions.Item label="">
                                    <div></div>
                                </Descriptions.Item>
                            </Descriptions>

                            <Descriptions bordered column={2} title="Chi tiết lương" size="middle" style={{ marginTop: 24 }}>
                                <Descriptions.Item label="Tổng phụ cấp">
                                    {selectedRecord.luong.tongPhuCap.toLocaleString("vi-VN")} đ
                                </Descriptions.Item>
                                <Descriptions.Item label="Thưởng">
                                    <Tag color="orange" style={{ fontSize: 15 }}>
                                        +{selectedRecord.luong.tongThuong.toLocaleString("vi-VN")} đ
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phạt">
                                    <Tag color="red" style={{ fontSize: 15 }}>
                                        -{selectedRecord.luong.tongPhat.toLocaleString("vi-VN")} đ
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Bảo hiểm">
                                    {selectedRecord.luong.baoHiem.toLocaleString("vi-VN")} đ
                                </Descriptions.Item>
                                <Descriptions.Item label="Lương thực nhận">
                                    <Tag color="green" style={{ fontSize: 15 }}>
                                        {selectedRecord.luong.luongThucNhan.toLocaleString("vi-VN")} đ
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Hệ số OT">
                                    {selectedRecord.luong.heSoOT}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số giờ OT">
                                    {selectedRecord.luong.soGioOT}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lương OT">
                                    {selectedRecord.luong.luongOT.toLocaleString("vi-VN")} đ
                                </Descriptions.Item>
                            </Descriptions>

                            <div style={{ marginTop: 24, textAlign: "right" }}>
                                <Button onClick={() => setViewMode("list")}>Quay lại danh sách</Button>
                            </div>
                        </>
                    ) : (
                        <p>Chọn nhân viên để xem chi tiết lương.</p>
                    )}
                </Card>
            )}
        </div>
    );
};
