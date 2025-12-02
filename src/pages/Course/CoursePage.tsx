import React, { useEffect, useState } from "react";
import { Table, Button, Space, Input, Modal, Form, Typography, notification, Popconfirm, Descriptions, Card, List, Pagination, Row, Col, message, } from "antd";
import { useSearchParams, useOutletContext, useNavigate } from "react-router-dom";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, CirclePlus, Edit3, Trash, Ban, Check, Search, Grid2X2, FileDown, FolderDown, Copy, } from "lucide-react";
import { useCourseStore } from "src/stores/course/useCourseStore";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { Course } from "src/types/course/Course";
import Meta from "antd/es/card/Meta";
import ElectricBorder from "@components/electricBorder/ElectricBorder";
import { useExcelStore } from "src/stores/report/excel";

const { Title } = Typography;

export const CoursePage = () => {
    const [viewMode, setViewMode] = useState<"dashboard" | "list" | "detail">("dashboard");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCourse, setEditedCourse] = useState<Partial<Course> | null>(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const { courses, meta, fetchCourses, addCourse, updateCourse, deleteCourse, isModalOpen, setModalOpen, } = useCourseStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Load data
    useEffect(() => {
        fetchCourses(currentPage, currentSize);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    };

    // Header outlet
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                    Tổng số khóa học: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    // CRUD 
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedCourse) setEditedCourse({ ...selectedCourse });
    };

    const handleChange = (field: keyof Course, value: any) => {
        setEditedCourse((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        if (!editedCourse || !selectedCourse) return;
        const changed: Partial<Course> = {};
        Object.entries(editedCourse).forEach(([key, val]) => {
            const oldVal = selectedCourse[key as keyof Course];
            if (val !== oldVal && val !== undefined) {
                changed[key as keyof Course] = val as any;
            }
        });

        if (Object.keys(changed).length === 0) {
            notification.info({ message: "Không có thay đổi để cập nhật" });
            return;
        }

        try {
            await updateCourse!(selectedCourse.id, changed);
            notification.success({ message: "Cập nhật khóa học thành công!" });
            setSelectedCourse({ ...selectedCourse, ...changed });
            setIsEditing(false);
            fetchCourses(currentPage, currentSize);
        } catch (err) {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedCourse?.id) return;
        try {
            await deleteCourse!(selectedCourse.id);
            notification.success({ message: "Xóa khóa học thành công!" });
            setSelectedCourse(null);
            fetchCourses(currentPage, currentSize);
        } catch {
            notification.error({ message: "Xóa thất bại!" });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addCourse!(values);
            notification.success({ message: "Thêm khóa học thành công!" });
            form.resetFields();
            setModalOpen(false);
            fetchCourses(currentPage, currentSize);
        } catch (err) {
            notification.error({ message: "Thêm khóa học thất bại!" });
        }
    };

    // Search
    const handleSearch = () => {
        fetchCourses(1, currentSize, searchText);
        setSearchParams({ current: "1", pageSize: currentSize.toString(), q: searchText });
    };

    const columns = [
        { title: "Tên khóa học", dataIndex: "name", key: "name" },
        { title: "Ngưỡng đạt (%)", dataIndex: "passThreshold", key: "passThreshold" },
        { title: "Số câu hỏi", dataIndex: "questionCount", key: "questionCount" },
        { title: "Mã lớp", dataIndex: "classCode", key: "classCode", render: (text: string | null) => text || "Chưa có" },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
    ];

    // Tạo đề thi cho khóa học
    const navigate = useNavigate();

    // Tải báo cáo kết quả đào tạo cho từng khóa học
    const { downloadTrainingResults, downloadCourseSummaryReport } = useExcelStore();

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== Toolbar ===== */}
            <div className="flex items-center justify-between mb-4">
                <Input
                    placeholder="Tìm kiếm khóa học..."
                    prefix={<IconWrapper Icon={Search} />}
                    style={{ width: 320 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                />
                <Space>
                    <Button
                        size="large"
                        type={viewMode === "dashboard" ? "primary" : "default"}
                        icon={<IconWrapper Icon={Grid2X2} color={viewMode === "dashboard" ? "#fff" : undefined} />}
                        onClick={() => setViewMode("dashboard")}
                    />
                    <Button
                        size="large"
                        type={viewMode === "list" ? "primary" : "default"}
                        icon={<IconWrapper Icon={AlignJustify} color={viewMode === "list" ? "#fff" : undefined} />}
                        onClick={() => setViewMode("list")}
                    />
                    <Button
                        size="large"
                        type={viewMode === "detail" ? "primary" : "default"}
                        icon={<IconWrapper Icon={PanelLeft} color={viewMode === "detail" ? "#fff" : undefined} />}
                        onClick={() => setViewMode("detail")}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Thêm khóa học
                    </Button>

                    <Button
                        // type="primary"
                        size="large"
                        color="cyan"
                        variant="solid"
                        icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadCourseSummaryReport();
                        }}
                    >
                        Xuất danh sách ra file Excel
                    </Button>
                </Space>
            </div>

            {/* ===== List / Detail View ===== */}
            {
                viewMode === "dashboard" ? (
                    <div style={{ padding: "12px 0" }}>
                        <div style={{ marginBottom: 16 }}>
                            <Title level={4} style={{ margin: 0 }}>
                                Danh sách khóa học
                            </Title>
                        </div>

                        <div style={{ minHeight: 400 }}>
                            <Row gutter={[16, 16]} className="flex flex-wrap items-stretch">
                                {courses.map((course) => (
                                    <Col
                                        key={course.id}
                                        xs={24}  // 1 cột trên mobile
                                        sm={12}  // 2 cột tablet
                                        md={8}   // 3 cột desktop
                                        lg={6}   // 4 cột lớn
                                        className="flex"
                                    >
                                        {/* <ElectricBorder
                                            color="#f0cd0a"
                                            speed={1}
                                            chaos={0.5}
                                            thickness={2}
                                            style={{ borderRadius: 16 }}
                                        > */}
                                        <div
                                            className="p-4 flex flex-col flex-1 overflow-hidden bg-white rounded-lg 
                                                    [box-shadow:rgba(99,99,99,0.2)_0px_2px_8px_0px]
                                                    hover:[box-shadow:rgba(0,0,0,0.05)_0px_6px_24px_0px,rgba(0,0,0,0.08)_0px_0px_0px_1px]
                                                    transition-shadow duration-200 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation(); // ngăn chặn sự kiện click lan truyền, click luôn phần tử cha
                                                setSelectedCourse(course);
                                                setViewMode("detail");
                                            }}>
                                            {/* Ảnh khóa học */}
                                            <div className="w-full h-[200px] overflow-hidden">
                                                <img
                                                    src="https://plus.unsplash.com/premium_vector-1721494020721-45d7295df5e0?ixlib=rb-4.1.0&auto=format&fit=crop&q=60&w=352&dpr=1&h=367"
                                                    alt={course.name}
                                                    className="object-cover w-full h-full"
                                                />
                                            </div>

                                            {/* Nội dung */}
                                            <div className="flex flex-col justify-between flex-1 p-4">
                                                <div>
                                                    <h3 className="mb-2 text-lg font-semibold line-clamp-2 min-h-[3.5rem]">{course.name}</h3>
                                                    <p>Ngưỡng đạt: {course.passThreshold}%</p>
                                                    <p>Số câu hỏi: {course.questionCount}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p>Mã lớp: {course.classCode || "Chưa có"}</p>

                                                        {course.classCode && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigator.clipboard.writeText(course.classCode!)
                                                                    message.success("Copied mã lớp thành công!");
                                                                }}
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                                title="Copy mã lớp"
                                                            >
                                                                <IconWrapper Icon={Copy} className="cursor-pointer" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500">{new Date(course.createdAt).toLocaleDateString()}</p>
                                                </div>

                                                <div className="mt-3 text-right">
                                                    <Button
                                                        type="primary"
                                                        size="middle"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // ngăn chặn sự kiện click lan truyền, click luôn phần tử cha
                                                            setSelectedCourse(course);
                                                            setViewMode("detail");
                                                        }}
                                                    >
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* </ElectricBorder> */}

                                    </Col>
                                ))}
                            </Row>

                            {/* Phân trang */}
                            <div style={{ marginTop: 20, textAlign: "center" }}>
                                <Pagination
                                    current={meta?.current}
                                    total={meta?.total}
                                    pageSize={meta?.pageSize}
                                    onChange={handlePageChange}
                                />
                            </div>
                        </div>
                    </div>

                ) :
                    viewMode === "list" ? (
                        <Table
                            columns={columns}
                            dataSource={courses}
                            rowKey="id"
                            pagination={{
                                current: meta?.current || 1,
                                pageSize: meta?.pageSize || 10,
                                total: meta?.total || 0,
                                onChange: handlePageChange,
                            }}
                            onRow={(record) => ({
                                onClick: () => {
                                    setSelectedCourse(record);
                                    setViewMode("detail");
                                },
                            })}
                        />
                    ) : (
                        <div style={{ display: "flex", gap: 16 }}>
                            {/* View bên trái hiển thị List */}
                            <Card style={{ flex: "1 0 25%", minWidth: 300 }} bodyStyle={{ padding: 8 }}>
                                <List
                                    dataSource={courses}
                                    renderItem={(item: Course) => (
                                        <List.Item
                                            onClick={() => setSelectedCourse(item)}
                                            style={{
                                                cursor: "pointer",
                                                background: selectedCourse?.id === item.id ? "#e6f4ff" : "transparent",
                                                borderRadius: 6,
                                                padding: 8,
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                <div style={{ fontSize: 12, color: "#888" }}>
                                                    {item.questionCount} câu hỏi
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                                <Pagination
                                    current={meta?.current}
                                    total={meta?.total}
                                    pageSize={meta?.pageSize}
                                    onChange={handlePageChange}
                                    style={{ marginTop: 16, textAlign: "center" }}
                                />
                            </Card>

                            {/* View bên phải hiển thị Detail */}
                            <Card style={{ flex: 1 }}>
                                {selectedCourse ? (
                                    <>
                                        <div className="flex items-center justify-between mb-4">
                                            <Title level={4} style={{ margin: 0 }}>
                                                {isEditing ? (
                                                    <Input
                                                        value={editedCourse?.name}
                                                        onChange={(e) => handleChange("name", e.target.value)}
                                                    />
                                                ) : (
                                                    selectedCourse.name
                                                )}
                                            </Title>
                                            <Space>
                                                <Button
                                                    type="text"
                                                    icon={<IconWrapper Icon={Edit3} />}
                                                    onClick={handleEditToggle}
                                                />
                                                <Popconfirm
                                                    title="Xóa khóa học"
                                                    description="Bạn có chắc muốn xóa khóa học này?"
                                                    onConfirm={confirmDelete}
                                                >
                                                    <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}>
                                                        Xóa
                                                    </Button>
                                                </Popconfirm>
                                            </Space>
                                        </div>

                                        <Descriptions bordered column={1} size="middle">
                                            <Descriptions.Item label="Ngưỡng đạt (%)">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        value={editedCourse?.passThreshold}
                                                        onChange={(e) =>
                                                            handleChange("passThreshold", Number(e.target.value))
                                                        }
                                                    />
                                                ) : (
                                                    selectedCourse.passThreshold
                                                )}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Mã lớp">
                                                {isEditing ? (
                                                    <Input
                                                        value={editedCourse?.classCode || ""}
                                                        onChange={(e) => handleChange("classCode", e.target.value)}
                                                    />
                                                ) : (
                                                    selectedCourse.classCode || "—"
                                                )}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Số câu hỏi">
                                                {selectedCourse.questionCount}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Ngày tạo">
                                                {new Date(selectedCourse.createdAt).toLocaleString()}
                                            </Descriptions.Item>
                                        </Descriptions>

                                        {isEditing && (
                                            <div className="flex justify-end mt-4">
                                                <Button
                                                    icon={<Ban size={16} />}
                                                    onClick={handleCancel}
                                                >
                                                    Hủy
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    icon={<Check size={16} />}
                                                    onClick={handleUpdate}
                                                    className="ml-3"
                                                >
                                                    Cập nhật
                                                </Button>
                                            </div>
                                        )}

                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                                            onClick={() => navigate(`/courses/${selectedCourse.id}/questions`)}
                                            className="w-full mt-4"
                                        >
                                            Tạo đề thi cho khóa học
                                        </Button>
                                        <Button
                                            color="cyan"
                                            variant="outlined"
                                            size="large"
                                            icon={<IconWrapper Icon={FileDown} color="#13c2c2" />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadTrainingResults(selectedCourse.id);
                                            }}
                                            className="w-full mt-4"
                                        >
                                            Xuất kết quả đào tạo ra Excel
                                        </Button>

                                        <Button
                                            type="primary"
                                            size="large"
                                            icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                                            onClick={() =>
                                                navigate(`/course/training-record/${selectedCourse.id}`)
                                            }
                                            className="w-full mt-4"
                                        >
                                            Xem danh sách học viên đã học khóa này
                                        </Button>
                                    </>
                                ) : (
                                    <p>Chọn một khóa học để xem chi tiết.</p>
                                )}
                            </Card>
                        </div>
                    )}

            {/* Thêm mới khóa học */}
            <Modal
                title="Thêm khóa học mới"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên khóa học"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên khóa học!" }]}
                    >
                        {/* <Input /> */}
                        <Input.TextArea
                            rows={2}
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>
                    <Form.Item label="Ngưỡng đạt (%)" name="passThreshold" initialValue={70}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item label="Mã lớp (Classroom)" name="classCode">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
