import React from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
} from "@mui/material";
import { Row, Col, Table, Tag, Progress } from "antd";
import { LineChart, BarChart, PieChart, RadarChart } from "@mui/x-charts";
import {
    UsergroupAddOutlined,
    ApartmentOutlined,
    SolutionOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// ================== MOCK DATA ==================
const employeesCount = 128;
const departmentsCount = 8;
const activeEmployees = 115;
const contractsExpiring = 7;

const attendanceToday = [
    { key: 1, name: "Nguyễn Văn A", date: "2025-10-05", status: "Có mặt", note: "" },
    { key: 2, name: "Lê Thị B", date: "2025-10-05", status: "Đi muộn", note: "15 phút" },
    { key: 3, name: "Trần C", date: "2025-10-05", status: "Vắng", note: "Nghỉ phép" },
    { key: 4, name: "Đỗ D", date: "2025-10-05", status: "Có mặt", note: "" },
];

const contractsEndingSoon = [
    { key: 1, name: "Nguyễn Văn E", type: "FT", start: "2023-11-01", end: "2025-11-01", status: "Còn hiệu lực" },
    { key: 2, name: "Lê Thị F", type: "PT", start: "2024-02-01", end: "2025-10-25", status: "Còn hiệu lực" },
];

// ================== COMPONENT ==================
const OverviewPage: React.FC = () => {
    return (
        <Box sx={{ minHeight: "100vh" }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Tổng quan công ty
            </Typography>

            {/* === STAT CARDS === */}
            <Row gutter={[16, 16]}>
                {[
                    { title: "Tổng nhân viên", value: employeesCount, icon: <UsergroupAddOutlined />, color: "#1677ff", trend: "+3.2% so với tháng trước" },
                    { title: "Phòng ban", value: departmentsCount, icon: <ApartmentOutlined />, color: "#13c2c2", trend: "+1 phòng ban mới" },
                    { title: "Đang làm việc", value: activeEmployees, icon: <SolutionOutlined />, color: "#52c41a", trend: "+5 người" },
                    { title: "Hợp đồng sắp hết hạn", value: contractsExpiring, icon: <FileTextOutlined />, color: "#faad14", trend: "+30 ngày tới" },
                ].map((item, i) => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <Card sx={{ borderRadius: 3 }} style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box
                                        sx={{
                                            backgroundColor: `${item.color}15`,
                                            color: item.color,
                                            width: 48,
                                            height: 48,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "50%",
                                            fontSize: 22,
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                                            {item.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                                            {item.value}
                                        </Typography>
                                        <Typography sx={{ color: item.color, fontSize: 13 }}>
                                            {item.trend}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* === ANALYTICS SECTION === */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={14}>
                    <Card sx={{ borderRadius: 3 }} style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Tuyển dụng & Nghỉ việc (12 tháng)
                            </Typography>
                            <LineChart
                                xAxis={[{ scaleType: "point", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] }]}
                                series={[
                                    { data: [2, 3, 4, 2, 5, 4, 6, 3, 5, 2, 3, 1], label: "Tuyển mới", color: "#1677ff" },
                                    { data: [1, 2, 1, 3, 2, 2, 1, 2, 3, 1, 1, 2], label: "Nghỉ việc", color: "#faad14" },
                                ]}
                                height={280}
                            />

                            <RadarChart
                                height={300}
                                width={500}
                                series={[
                                    {
                                        label: "Hiệu suất tổng thể",
                                        data: [92, 75, 80, 68, 85, 90],
                                        color: "#1677ff",
                                    },
                                ]}
                                radar={{
                                    max: 100,
                                    metrics: [
                                        "Hiệu suất nhân sự",
                                        "Đào tạo",
                                        "Kỷ luật",
                                        "Chấm công",
                                        "Năng suất",
                                        "Tài chính",
                                    ],
                                }}
                            />
                        </CardContent>
                    </Card>
                </Col>

                <Col xs={24} md={10}>
                    <Card sx={{ borderRadius: 3 }} style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Nhân sự theo phòng ban
                            </Typography>
                            <BarChart
                                xAxis={[{ data: ["Phòng Kỹ Thuật", "Phòng Kinh Doanh", "Phòng Kế Toán", "Phòng Hành Chính"] }]}
                                series={[{ data: [30, 25, 15, 20], color: "#1677ff" }]}
                                height={280}
                            />
                            <PieChart
                                series={[
                                    {
                                        data: [
                                            { id: 0, value: 10, label: "Phòng Kỹ Thuật" },
                                            { id: 1, value: 15, label: "Phòng Kinh Doanh" },
                                            { id: 2, value: 20, label: "Phòng Kế Toán" },
                                            { id: 2, value: 20, label: "Phòng Hành Chính" },
                                        ],
                                    },
                                ]}
                                width={200}
                                height={200}
                            />
                        </CardContent>
                    </Card>
                </Col>
            </Row>

            {/* === OPERATION SECTION === */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={14}>
                    <Card sx={{ borderRadius: 3 }} style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Tình hình chấm công hôm nay ({dayjs().format("DD/MM/YYYY")})
                            </Typography>
                            <Table
                                size="small"
                                columns={[
                                    { title: "Nhân viên", dataIndex: "name" },
                                    { title: "Ngày", dataIndex: "date" },
                                    {
                                        title: "Trạng thái",
                                        dataIndex: "status",
                                        render: (status: string) => {
                                            const colorMap: any = {
                                                "Có mặt": "green",
                                                "Đi muộn": "orange",
                                                "Vắng": "red",
                                            };
                                            return <Tag color={colorMap[status]}>{status}</Tag>;
                                        },
                                    },
                                    { title: "Ghi chú", dataIndex: "note" },
                                ]}
                                dataSource={attendanceToday}
                                pagination={false}
                            />
                        </CardContent>
                    </Card>
                </Col>

                <Col xs={24} md={10}>
                    <Card sx={{ borderRadius: 3 }} style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Hợp đồng sắp hết hạn
                            </Typography>
                            <Table
                                size="small"
                                columns={[
                                    { title: "Nhân viên", dataIndex: "name" },
                                    { title: "Loại", dataIndex: "type" },
                                    { title: "Ngày bắt đầu", dataIndex: "start" },
                                    { title: "Ngày hết hạn", dataIndex: "end" },
                                    {
                                        title: "Trạng thái",
                                        dataIndex: "status",
                                        render: (text: string) => <Tag color="green">{text}</Tag>,
                                    },
                                ]}
                                dataSource={contractsEndingSoon}
                                pagination={false}
                            />
                        </CardContent>
                    </Card>
                </Col>
            </Row>

            {/* === SUMMARY SECTION === */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                {[
                    { title: "Đào tạo", value: "15 khóa / 12 hoàn thành", desc: "80% hoàn thành", color: "#1890ff" },
                    { title: "Khen thưởng", value: "24", desc: "Tháng này", color: "#52c41a" },
                    { title: "Kỷ luật", value: "3", desc: "Cảnh cáo / đình chỉ", color: "#ff4d4f" },
                    { title: "Tăng ca", value: "86 giờ", desc: "Tháng này", color: "#722ed1" },
                ].map((item, i) => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <Card sx={{ borderRadius: 3, backgroundColor: `${item.color}10` }} style={{ boxShadow: "rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px" }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ color: item.color, fontWeight: 600 }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {item.value}
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                                    {item.desc}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Box>
    );
};

export default OverviewPage;
