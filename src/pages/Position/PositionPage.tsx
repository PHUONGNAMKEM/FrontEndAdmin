import React, { useEffect, useState } from "react";
import {
    Table, Space, Button, Input, Card, Descriptions, List, Typography, message, Dropdown, Pagination, Popconfirm, Modal, Form, notification, Avatar,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, Check, Ban, CirclePlus, Search } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { usePositionStore } from "src/stores/usePositionStore";
import { Position } from "src/types/position/Position";

const { Title } = Typography;

export const PositionPage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedPos, setSelectedPos] = useState<Position | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedPos, setEditedPos] = useState<Position | null>(null);
    const [form] = Form.useForm();

    const {
        positions,
        meta,
        fetchPosition,
        addPosition,
        updatePosition,
        deletePosition,
        isModalOpen,
        setModalOpen,
    } = usePositionStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch data
    useEffect(() => {
        fetchPosition(currentPage, currentSize);
    }, [currentPage, currentSize]);

    useEffect(() => {
        if (selectedPos) {
            const updated = positions.find(p => p.id === selectedPos.id);
            if (updated) {
                setSelectedPos(updated);
            }
        }
    }, [positions]);

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
                    Tổng số chức vụ: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    // Toggle edit
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedPos) setEditedPos({ ...selectedPos });
    };

    const handleChange = (field: keyof Position, value: any) => {
        setEditedPos((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => {
        setIsEditing(!isEditing);
    }

    const handleUpdate = async () => {
        if (!editedPos || !selectedPos) return;

        const changedFields: Partial<Position> = {};
        Object.entries(editedPos).forEach(([key, newValue]) => {
            const oldValue = selectedPos[key as keyof Position];
            if (newValue !== oldValue && newValue !== undefined) {
                changedFields[key as keyof Position] = newValue as any;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            message.info("Không có thay đổi nào để cập nhật.");
            return;
        }

        try {
            await updatePosition!(selectedPos.id!, changedFields);
            notification.success({ message: "Cập nhật chức vụ thành công!" });

            setSelectedPos((prev) => (prev ? { ...prev, ...changedFields } : prev));
            setIsEditing(false);
            fetchPosition(currentPage, currentSize);
        } catch (err) {
            console.error("Update position failed:", err);
            notification.error({
                message: "Cập nhật chức vụ thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    // Xóa
    const confirmDelete = async () => {
        if (!selectedPos?.id) return;
        try {
            await deletePosition!(selectedPos.id);
            notification.success({ message: "Xóa chức vụ thành công!" });
            setSelectedPos(null);
            fetchPosition(currentPage, currentSize);
        } catch (err) {
            console.error("Delete position failed:", err);
            notification.error({
                message: "Xóa chức vụ thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    // Thêm mới
    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addPosition!(values);
            notification.success({ message: "Thêm chức vụ thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchPosition(currentPage, currentSize);
        } catch (err) {
            notification.error({
                message: "Thêm chức vụ thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    const columns = [
        {
            title: "Tên chức vụ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Cấp bậc",
            dataIndex: "level",
            key: "level",
            ellipsis: true,
        },
        {
            title: "Số lượng nhân viên",
            dataIndex: "employeesCount",
            key: "employeesCount",
        },
    ];

    const handleChangeItem = (selectedPosition: Position) => {
        if (selectedPosition) {
            setSelectedPos(selectedPosition);
            setEditedPos({ ...selectedPosition });
            setIsEditing(false);
        } else {
            setSelectedPos(null);
        }
    };

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
                        Thêm chức vụ
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
                    dataSource={positions}
                    rowKey="id"
                    pagination={{
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedPos(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <div style={{ display: "flex", gap: 16 }}>
                    {/* DANH SÁCH BÊN TRÁI */}
                    <Card
                        style={{ flex: "1 0 25%", minWidth: 320 }}
                        bodyStyle={{ padding: 8 }}
                    >
                        <List
                            dataSource={positions}
                            renderItem={(item: Position) => (
                                <List.Item
                                    onClick={() => handleChangeItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background:
                                            selectedPos?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            {item.level}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* CHI TIẾT BÊN PHẢI */}
                    <Card style={{ flex: 1 }}>
                        {selectedPos ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {isEditing ? (
                                            <Input
                                                value={editedPos?.name}
                                                onChange={(e) =>
                                                    handleChange("name", e.target.value)
                                                }
                                            />
                                        ) : (
                                            selectedPos.name
                                        )}
                                    </Title>
                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={handleEditToggle}
                                        />
                                        <Popconfirm
                                            title="Xóa chức vụ"
                                            description="Bạn chắc chắn muốn xóa chức vụ này?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button danger icon={<DeleteOutlined />}>
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1} size="middle">
                                    <Descriptions.Item label="Cấp bậc">
                                        {isEditing ? (
                                            <Input
                                                value={editedPos?.level}
                                                onChange={(e) =>
                                                    handleChange("level", e.target.value)
                                                }
                                            />
                                        ) : (
                                            selectedPos.level
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số nhân viên">
                                        {selectedPos.employeesCount || "—"}
                                    </Descriptions.Item>
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
                            <p>Chọn một chức vụ để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* MODAL THÊM MỚI */}
            <Modal
                title="Thêm chức vụ mới"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên chức vụ"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Cấp bậc" name="level">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
