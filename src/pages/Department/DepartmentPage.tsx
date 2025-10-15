import React, { useEffect, useState } from "react";
import {
    Table, Space, Button, Input, Card, Descriptions, List, Typography, message, Dropdown, Pagination, Popconfirm, Modal, Form,
    notification,
    Select,
    Avatar,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, Check, CirclePlus, Edit3, Trash, Search, Ban } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useDepartmentStore } from "src/stores/useDepartmentStore";
import { Department } from "src/types/department/Department";
import { useEmployeeStore } from "src/stores/useEmployeeStore";

const { Title } = Typography;

export const DepartmentPage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedDept, setSelectedDept] = useState<Department | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDept, setEditedDept] = useState<Department | null>(null);
    const [form] = Form.useForm();

    const {
        departments,
        meta,
        fetchDepartment,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        isModalOpen,
        setModalOpen,
    } = useDepartmentStore();

    const { employees, fetchEmployees, meta: metaEmployee } = useEmployeeStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch data Department
    useEffect(() => {
        fetchDepartment(currentPage, currentSize);
        fetchEmployees(undefined, metaEmployee?.total);
    }, [currentPage, currentSize]);

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
                    Tổng số phòng ban: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    // Toggle edit cho Update phòng ban
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedDept) setEditedDept({ ...selectedDept });
    };

    const handleChange = (field: keyof Department, value: any) => {
        setEditedDept((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => {
        setIsEditing(!isEditing);
    }

    const handleUpdate = async () => {
        if (!editedDept || !selectedDept) return;

        const changedFields: Partial<Department> = {};
        Object.entries(editedDept).forEach(([key, newValue]) => {
            const oldValue = selectedDept[key as keyof Department];
            if (newValue !== oldValue && newValue !== undefined) {
                changedFields[key as keyof Department] = newValue as any;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            message.info("Không có thay đổi nào để cập nhật.");
            return;
        }

        try {
            await updateDepartment!(selectedDept.id!, changedFields);
            notification.success({ message: "Cập nhật phòng ban thành công!" });

            // Cập nhật hiển thị
            setSelectedDept((prev) => (prev ? { ...prev, ...changedFields } : prev));
            setIsEditing(false);
            fetchDepartment(currentPage, currentSize);
        } catch (err) {
            console.error("Update department failed:", err);
            notification.error({
                message: "Cập nhật phòng ban thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    // Xóa phòng ban
    const confirmDelete = async () => {
        if (!selectedDept?.id) return;
        try {
            await deleteDepartment!(selectedDept.id);
            notification.success({ message: "Xóa phòng ban thành công!" });
            setSelectedDept(null);
            fetchDepartment(currentPage, currentSize);
        } catch (err) {
            console.error("Delete department failed:", err);
            notification.error({
                message: "Xóa phòng ban thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    // Thêm mới phòng ban
    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addDepartment!(values);
            notification.success({ message: "Thêm phòng ban thành công!" });

            setModalOpen(false);
            form.resetFields();
            fetchDepartment(currentPage, currentSize);
        } catch (err) {
            notification.error({
                message: "Thêm phòng ban thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    const columns = [
        {
            title: "Tên phòng ban",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Số lượng nhân viên",
            dataIndex: "employeesCount",
            key: "employeesCount",
        },
        {
            title: "Trưởng phòng",
            dataIndex: "managerName",
            key: "managerName",
            render: (text: string) => text || "—",
        },
    ];

    // Employee Options để bỏ vào option trong Select input
    const employeeOptions = employees
        .filter(
            (emp) =>
                emp.positionId === "B8E14F90-BD6A-415E-A105-6AA098BA92B5" ||
                emp.positionName! === "Trưởng phòng"
        )
        .map((emp) => ({
            value: emp.id,
            label: emp.fullName,
            email: emp.email,
            avatarUrl: emp.avatarUrl,
        }));

    // Reset form khi click đổi nhân viên
    const handleChangeItem = (selectedEmployee: Department) => {
        if (selectedEmployee) {
            setSelectedDept(selectedEmployee);
            setSelectedDept({ ...selectedEmployee });
            setIsEditing(false); // tắt chế độ edit nếu đang bật
        } else {
            setSelectedDept(null);
        }
    }

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== HEADER TOOLBAR ===== */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    alignItems: "center",
                }}
            >
                <div className="flex items-center">
                    <Input
                        placeholder="Tìm kiếm phòng ban..."
                        prefix={<IconWrapper Icon={Search} />}
                        style={{ width: 320 }}
                    />
                </div>

                <Space>
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
                        Thêm phòng ban
                    </Button>
                    <Dropdown
                        menu={{
                            items: [
                                { key: "1", label: "Tùy chọn 1" },
                                { key: "2", label: "Tùy chọn 2" },
                            ],
                        }}
                    >
                        <Button size="large" icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Space>
            </div>

            {/* ===== VIEW ===== */}
            {viewMode === "list" ? (
                <Table
                    columns={columns}
                    dataSource={departments}
                    rowKey="id"
                    pagination={{
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedDept(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <div style={{ display: "flex", gap: 16 }}>
                    <div className="flex flex-col">
                        {/* DANH SÁCH BÊN TRÁI */}
                        <Card
                            style={{ flex: "1 0 25%", minWidth: 320 }}
                            bodyStyle={{ padding: 8 }}
                        >
                            <List
                                dataSource={departments}
                                renderItem={(item: Department) => (
                                    <List.Item
                                        // onClick={() => setSelectedDept(item)}
                                        onClick={() => handleChangeItem(item)}
                                        style={{
                                            cursor: "pointer",
                                            background:
                                                selectedDept?.id === item.id
                                                    ? "#e6f4ff"
                                                    : "transparent",
                                            borderRadius: 6,
                                            padding: 8,
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>
                                                {item.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#888",
                                                }}
                                            >
                                                {item.employeesCount} nhân viên
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                        <div style={{ marginTop: 16, textAlign: "center" }}>
                            <Pagination
                                current={meta?.current}
                                total={meta?.total}
                                pageSize={meta?.pageSize}
                                onChange={handlePageChange}
                            />
                        </div>
                    </div>

                    {/* CHI TIẾT BÊN PHẢI */}
                    <Card style={{ flex: 1 }}>
                        {selectedDept ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {isEditing ? (
                                            <Input
                                                value={editedDept?.name}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            selectedDept.name
                                        )}
                                    </Title>
                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={handleEditToggle}
                                        />
                                        <Popconfirm
                                            title="Xóa phòng ban"
                                            description="Bạn chắc chắn muốn xóa phòng ban này?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button
                                                danger
                                                icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}
                                            >
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1} size="middle">
                                    <Descriptions.Item label="Mô tả">
                                        {isEditing ? (
                                            <Input.TextArea
                                                value={editedDept?.description}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            selectedDept.description
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trưởng phòng">
                                        {isEditing ? (
                                            // <Input.TextArea
                                            //     value={editedDept?.managerName}
                                            //     onChange={(e) =>
                                            //         handleChange(
                                            //             "description",
                                            //             e.target.value
                                            //         )
                                            //     }
                                            // />
                                            <Select
                                                value={editedDept?.managerId}
                                                className="w-full"
                                                placeholder="Chọn trưởng phòng"
                                                options={employeeOptions}
                                                showSearch // cho phép gõ để lọc
                                                optionFilterProp="label"
                                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                }
                                                optionRender={(option) =>
                                                (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar src={option.data.avatarUrl} />
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{option.data.label}</div>
                                                            <div style={{ fontSize: 12, color: "#888" }}>{option.data.email}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                onChange={(value) => handleChange("managerId", value)}
                                            />
                                        ) : (
                                            selectedDept.managerName || "—"
                                        )}
                                    </Descriptions.Item>
                                    {/* <Descriptions.Item label="Số nhân viên">
                                        {isEditing ? (
                                            <Select
                                                className="w-full"
                                                placeholder="Chọn số lượng nhân viên"
                                                options={[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(
                                                    (num) => ({
                                                        value: num,
                                                        label: `${num}`,
                                                    })
                                                )}
                                                value={editedDept?.employeesCount}
                                                onChange={(value) => handleChange("employeesCount", value)}
                                                showSearch // cho phép gõ để lọc
                                                optionFilterProp="label"
                                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                }
                                            />
                                        ) : (
                                            selectedDept.employeesCount || "—"
                                        )}
                                    </Descriptions.Item> */}
                                </Descriptions>



                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button
                                            type="default"
                                            icon={<Ban size={16} />}
                                            onClick={handleCancel}
                                        >
                                            Hủy
                                        </Button>

                                        <Button
                                            className="ml-4"
                                            type="primary"
                                            icon={<Check size={16} />}
                                            onClick={handleUpdate}
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn một phòng ban để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* MODAL THÊM MỚI */}
            <Modal
                title="Thêm phòng ban mới"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên phòng ban"
                        name="name"
                        rules={[
                            { required: true, message: "Vui lòng nhập tên!" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

