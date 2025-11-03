import React, { useEffect } from "react";
import { Card, Typography, Descriptions, Table, Tag, Button, Space, Spin, Alert } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { ArrowLeft, StepBack } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { usePayrollRunSalaryDetailStore } from "src/stores/payroll/usePayrollRunSalaryDetailStore";

const { Title, Text } = Typography;

export const PayrollRunSalaryDetailPage = () => {
    const { detail, loading, error, fetchPayrollRunSalaryDetail } =
        usePayrollRunSalaryDetailStore();
    const { salaryId } = useParams(); // đường dẫn sẽ như sau: /payroll/run/:runId/salary/:salaryId
    const navigate = useNavigate();

    useEffect(() => {
        if (salaryId) fetchPayrollRunSalaryDetail(salaryId);
    }, [salaryId]);

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
                <h2 className="text-xl font-bold">Chi tiết bảng lương nhân viên</h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent]);

    if (loading) return <Spin tip="Đang tải chi tiết..." />;
    if (error) return <Alert message="Lỗi tải dữ liệu" description={error} type="error" />;

    if (!detail) return <p>Không có dữ liệu chi tiết.</p>;

    const { employee, payroll, items } = detail;

    const columns = [
        { title: "Loại", dataIndex: "type", key: "type", render: (t: string) => t.toUpperCase() },
        {
            title: "Số tiền",
            dataIndex: "amount",
            key: "amount",
            align: "right" as const,
            render: (v: number) => (
                <Tag color={v >= 0 ? "green" : "red"}>
                    {v.toLocaleString("vi-VN")} ₫
                </Tag>
            ),
        },
        { title: "Ghi chú", dataIndex: "note", key: "note" },
    ];

    return (
        <Card style={{ background: "#fff", padding: 20, borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                <Title level={4}>Thông tin nhân viên</Title>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Mã nhân viên">{employee.code}</Descriptions.Item>
                    <Descriptions.Item label="Họ tên">{employee.fullName}</Descriptions.Item>
                    <Descriptions.Item label="Kỳ lương">{payroll.period}</Descriptions.Item>
                    <Descriptions.Item label="Chi tiết công việc">{payroll.detailsJson}</Descriptions.Item>
                </Descriptions>

                <Title level={4}>Tổng quan lương</Title>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Tổng thu nhập (Gross)">
                        {payroll.grossSalary.toLocaleString("vi-VN")} ₫
                    </Descriptions.Item>
                    <Descriptions.Item label="Thực nhận (Net)">
                        <Tag color={payroll.netSalary >= 0 ? "green" : "red"}>
                            {payroll.netSalary.toLocaleString("vi-VN")} ₫
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng cộng cộng thêm (Earnings)">
                        {payroll.totalEarnings.toLocaleString("vi-VN")} ₫
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng khấu trừ (Deductions)">
                        <Tag color="volcano">
                            {payroll.totalDeductions.toLocaleString("vi-VN")} ₫
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>

                <Title level={4}>Chi tiết các khoản</Title>
                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="itemId"
                    pagination={false}
                    bordered
                />
            </Space>
        </Card>
    );
};
