import React, { useEffect } from "react";
import { Box, Card, CardContent, Typography, Stack } from "@mui/material";
import { Row, Col, Table, Tag } from "antd";
import {
    Users,
    Building2,
    Briefcase,
    ClipboardList,
    GraduationCap,
    Award,
    ShieldAlert,
    Timer,
} from "lucide-react";
import { LineChart, BarChart, PieChart, RadarChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useDashboardStore } from "src/stores/useDashboardStore";

const OverviewPage = () => {
    const { dashboard, fetchDashboard } = useDashboardStore();

    useEffect(() => {
        fetchDashboard(30);
    }, []);

    if (!dashboard) return <Typography>Đang tải dữ liệu...</Typography>;

    const {
        summary,
        charts,
        employeesByDepartment,
        expiringContracts,
        attendanceToday,
        leaveStats,
        disciplineStats,
        courseStats,
        salaryStats,
        performanceStats,
    } = dashboard;

    // ===================== SUMMARY CARDS =====================
    const summaryItems = [
        {
            title: "Tổng nhân viên",
            value: summary.totalEmployees,
            diff: "+3.2% so với tháng trước",
            icon: <Users size={32} color="#1677ff" />,
            bg: "#e6f4ff",
        },
        {
            title: "Phòng ban",
            value: summary.totalDepartments,
            diff: "+1 phòng ban mới",
            icon: <Building2 size={32} color="#13c2c2" />,
            bg: "#e6fffb",
        },
        {
            title: "Đang làm việc",
            value: summary.workingCount,
            diff: "+5 người",
            icon: <Briefcase size={32} color="#52c41a" />,
            bg: "#f6ffed",
        },
        {
            title: "HĐ sắp hết hạn",
            value: summary.contractsExpiring,
            diff: "+30 ngày tới",
            icon: <ClipboardList size={32} color="#faad14" />,
            bg: "#fff7e6",
        },
    ];

    // ===================== EXTRA STAT CARDS =====================
    // const extraStats = [
    //     {
    //         label: "Đào tạo",
    //         value: `${courseStats.completed}/${courseStats.total} khóa`,
    //         icon: <GraduationCap size={30} color="#1677ff" />,
    //         bg: "#e6f4ff",
    //     },
    //     {
    //         label: "Khen thưởng",
    //         value: disciplineStats.rewardsThisMonth,
    //         icon: <Award size={30} color="#52c41a" />,
    //         bg: "#f6ffed",
    //     },
    //     {
    //         label: "Kỷ luật",
    //         value: disciplineStats.penaltiesThisMonth,
    //         icon: <ShieldAlert size={30} color="#ff4d4f" />,
    //         bg: "#fff1f0",
    //     },
    //     {
    //         label: "Tăng ca",
    //         value: `${salaryStats.overtimeHours} giờ`,
    //         icon: <Timer size={30} color="#722ed1" />,
    //         bg: "#f9f0ff",
    //     },
    // ];

    return (
        <Box sx={{ minHeight: "100vh" }}>
            {/* ======================= HEADER ======================= */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                Tổng quan công ty
            </Typography>

            {/* ======================= SUMMARY ======================= */}
            <Row gutter={[16, 16]}>
                {summaryItems.map((item, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                padding: 1.5,
                                transition: "0.2s",
                                "&:hover": { boxShadow: "0 4px 14px rgba(0,0,0,0.12)" },
                            }}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "50%",
                                        background: item.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {item.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: 28, fontWeight: 700 }}>
                                        {item.value}
                                    </Typography>
                                    <Typography sx={{ fontSize: 13, color: "#8c8c8c" }}>
                                        {item.diff}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ======================= CHARTS ======================= */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={14}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Tuyển dụng & Nghỉ việc
                            </Typography>

                            <LineChart
                                height={280}
                                xAxis={[{ data: charts.hiresQuits.labels, scaleType: "point" }]}
                                series={[
                                    { data: charts.hiresQuits.hires, label: "Tuyển mới", color: "#1677ff" },
                                    { data: charts.hiresQuits.quits, label: "Nghỉ việc", color: "#fa541c" },
                                ]}
                            />

                            <RadarChart
                                height={300}
                                series={[
                                    {
                                        label: "Hiệu suất",
                                        data: [
                                            performanceStats.attendanceThisMonth.totalOnTime,
                                            performanceStats.attendanceThisMonth.totalLate,
                                            performanceStats.attendanceThisMonth.totalAbsent,
                                            performanceStats.trainingAllTime.averageScore,
                                        ],
                                    },
                                ]}
                                radar={{
                                    max: 100,
                                    metrics: ["Đúng giờ", "Đi muộn", "Vắng", "Điểm TB"],
                                }}
                            />
                        </CardContent>
                    </Card>
                </Col>

                <Col xs={24} md={10}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Nhân sự theo phòng ban
                            </Typography>

                            <BarChart
                                height={280}
                                xAxis={[
                                    {
                                        data: employeesByDepartment.map((d) => d.departmentName),
                                    },
                                ]}
                                series={[
                                    {
                                        data: employeesByDepartment.map((d) => d.count),
                                        color: "#1677ff",
                                    },
                                ]}
                            />

                            <PieChart
                                height={240}
                                series={[
                                    {
                                        data: employeesByDepartment.map((d, idx) => ({
                                            id: idx,
                                            value: d.count,
                                            label: d.departmentName,
                                        })),
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </Col>
            </Row>

            {/* ======================= ATTENDANCE & CONTRACTS ======================= */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                <Col xs={24} md={14}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Chấm công hôm nay ({dayjs().format("DD/MM/YYYY")})
                            </Typography>

                            <Table
                                size="small"
                                dataSource={[
                                    {
                                        name: "Đi làm",
                                        value: attendanceToday.checkedIn,
                                        tag: <Tag color="green">Có mặt</Tag>,
                                    },
                                    {
                                        name: "Đi trễ",
                                        value: attendanceToday.late,
                                        tag: <Tag color="orange">Đi trễ</Tag>,
                                    },
                                    {
                                        name: "Vắng",
                                        value: attendanceToday.absent,
                                        tag: <Tag color="red">Vắng</Tag>,
                                    },
                                ]}
                                columns={[
                                    { title: "Trạng thái", dataIndex: "name" },
                                    { title: "Số lượng", dataIndex: "value" },
                                    { title: "Ghi chú", dataIndex: "tag" },
                                ]}
                                pagination={false}
                            />
                        </CardContent>
                    </Card>
                </Col>

                <Col xs={24} md={10}>
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography sx={{ fontWeight: 600, mb: 1 }}>
                                Hợp đồng sắp hết hạn
                            </Typography>

                            <Table
                                size="small"
                                dataSource={expiringContracts.items.map((item) => ({
                                    key: item.id,
                                    name: item.employeeName,
                                    number: item.contractNumber,
                                    end: item.endDate,
                                    status: <Tag color="red">Sắp hết hạn</Tag>,
                                }))}
                                columns={[
                                    { title: "Nhân viên", dataIndex: "name" },
                                    { title: "Số HĐ", dataIndex: "number" },
                                    { title: "Kết thúc", dataIndex: "end" },
                                    { title: "Trạng thái", dataIndex: "status" },
                                ]}
                                pagination={false}
                            />
                        </CardContent>
                    </Card>
                </Col>
            </Row>

            {/* ======================= EXTRA STATS ======================= */}
            {/* ================== Extra Stats ================== */}
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                {[
                    { label: "Nghỉ phép", value: leaveStats.approvedThisMonth, color: "#1677ff" },
                    { label: "Kỷ luật", value: disciplineStats.penaltiesThisMonth, color: "#ff4d4f" },
                    { label: "Khoá học", value: courseStats.total, color: "#52c41a" },
                    { label: "Lương tháng", value: salaryStats.totalNet.toLocaleString(), color: "#722ed1" },
                ].map((item, i) => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: item.color }}>
                                    {item.label}
                                </Typography>
                                <Typography sx={{ fontSize: 24, fontWeight: 700 }}>
                                    {item.value}
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
