import React, { useEffect } from "react";
import { Table, Card, Typography, Tag, Button, Space, Spin, Alert } from "antd";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { ArrowLeft, StepBack } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { usePayrollRunSalaryStore } from "src/stores/payroll/usePayrollRunSalaryStore";
import dayjs from "dayjs";

const { Title } = Typography;

export const PayrollRunSalaryPage = () => {
    const { salaries, meta, loading, error, fetchPayrollRunSalary } =
        usePayrollRunSalaryStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { id } = useParams(); // lấy id payrollRun

    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "20");

    // Fetch data 
    useEffect(() => {
        if (id) fetchPayrollRunSalary(id, currentPage, currentSize);
    }, [id, currentPage, currentSize]);

    // Header context
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <Button
                    icon={<IconWrapper Icon={StepBack} />}
                    onClick={() => navigate(-1)}
                >
                    Trở về
                </Button>
                <h2 className="text-xl font-bold">
                    Chi tiết kỳ lương ({meta?.total || 0} nhân viên)
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    };

    const columns = [
        {
            title: "Tên nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
            width: 200,
        },
        { title: "Kỳ lương", dataIndex: "period", key: "period", width: 120 },
        {
            title: "Tổng thu nhập (Gross)",
            dataIndex: "gross",
            key: "gross",
            render: (v: number) => `${v.toLocaleString("vi-VN")} ₫`,
            align: "right" as const,
        },
        {
            title: "Thực nhận (Net)",
            dataIndex: "net",
            key: "net",
            render: (v: number) => (
                <Tag color={v >= 0 ? "green" : "red"}>
                    {v.toLocaleString("vi-VN")} ₫
                </Tag>
            ),
            align: "right" as const,
        },
        {
            title: "Chi tiết",
            dataIndex: "details",
            key: "details",
            render: (text: string) => <span style={{ whiteSpace: "pre-line" }}>{text}</span>,
        },
    ];

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={4}>Danh sách lương chi tiết đã chốt tháng {salaries.length > 0 && salaries[0].period ? `tháng ${dayjs(salaries[0].period).format("MM-YYYY")}` : ""}</Title>

            {loading && <Spin tip="Đang tải dữ liệu..." />}

            {error && (
                <Alert
                    message="Lỗi tải dữ liệu"
                    description={error}
                    type="error"
                    showIcon
                />
            )}

            {!loading && !error && (
                <Table
                    columns={columns}
                    dataSource={salaries}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        total: meta?.total,
                        pageSize: meta?.pageSize,
                        onChange: handlePageChange,
                        showSizeChanger: false,
                    }}
                    onRow={(record) => ({
                        onClick: () => navigate(`/salary/accept/payroll/run/${record.payrollRunId}/salary/${record.id}`)
                    })}

                // salary/accept/payroll/run/ id kỳ lương / salary/ id của bảng lương -> ra được chi tiết của dòng lương đó
                // salary/accept/payroll/run/:runId/salary/:salaryId
                />
            )}
        </Space>
    );
};
