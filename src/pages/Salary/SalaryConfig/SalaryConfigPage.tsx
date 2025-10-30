import React, { useEffect, useState } from "react";
import { Table, Space, Button, Input, Card, Descriptions, List, Typography, message, Dropdown, Pagination, Popconfirm, Modal, Form, notification, } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, Check, CirclePlus, Edit3, Trash, Search, Ban } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useSalaryConfigStore } from "src/stores/useSalaryConfigStore";
import { SalaryConfig } from "src/types/salary/SalaryConfig";

const { Title } = Typography;

export const SalaryConfigPage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedItem, setSelectedItem] = useState<SalaryConfig | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<SalaryConfig | null>(null);
    const [form] = Form.useForm();

    const {
        salaryConfigs,
        meta,
        fetchSalaryConfig,
        addSalaryConfig,
        updateSalaryConfig,
        deleteSalaryConfig,
        isModalOpen,
        setModalOpen,
    } = useSalaryConfigStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    useEffect(() => {
        fetchSalaryConfig(currentPage, currentSize);
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
                    Tổng số cấu hình lương: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedItem) setEditedItem({ ...selectedItem });
    };

    const handleChange = (field: keyof SalaryConfig, value: any) => {
        setEditedItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => setIsEditing(false);

    const handleUpdate = async () => {
        if (!editedItem || !selectedItem) return;

        const changedFields: Partial<SalaryConfig> = {};
        Object.entries(editedItem).forEach(([key, newValue]) => {
            const oldValue = selectedItem[key as keyof SalaryConfig];
            if (newValue !== oldValue && newValue !== undefined) {
                changedFields[key as keyof SalaryConfig] = newValue as any;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            message.info("Không có thay đổi nào để cập nhật.");
            return;
        }

        try {
            await updateSalaryConfig(selectedItem.id, changedFields);
            notification.success({ message: "Cập nhật thành công!" });
            setSelectedItem((prev) => (prev ? { ...prev, ...changedFields } : prev));
            setIsEditing(false);
            fetchSalaryConfig(currentPage, currentSize);
        } catch (err) {
            notification.error({
                message: "Cập nhật thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem?.id) return;
        try {
            await deleteSalaryConfig(selectedItem.id);
            notification.success({ message: "Xóa thành công!" });
            setSelectedItem(null);
            fetchSalaryConfig(currentPage, currentSize);
        } catch (err) {
            notification.error({
                message: "Xóa thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addSalaryConfig(values);
            notification.success({ message: "Thêm cấu hình thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchSalaryConfig(currentPage, currentSize);
        } catch (err) {
            notification.error({
                message: "Thêm thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    const columns = [
        { title: "Key", dataIndex: "key", key: "key" },
        { title: "Giá trị", dataIndex: "value", key: "value" },
        { title: "Mô tả", dataIndex: "description", key: "description", ellipsis: true },
    ];

    const handleSelectItem = (item: SalaryConfig) => {
        setSelectedItem(item);
        setIsEditing(false);
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== TOOLBAR ===== */}
            <div className="flex justify-between mb-4">
                <Input
                    placeholder="Tìm kiếm cấu hình..."
                    prefix={<IconWrapper Icon={Search} />}
                    style={{ width: 320 }}
                />
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
                        Thêm cấu hình
                    </Button>
                    <Dropdown
                        menu={{ items: [{ key: "1", label: "Tùy chọn khác" }] }}
                    >
                        <Button size="large" icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Space>
            </div>

            {/* ===== VIEW ===== */}
            {viewMode === "list" ? (
                <Table
                    columns={columns}
                    dataSource={salaryConfigs}
                    rowKey="id"
                    pagination={{
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedItem(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <div style={{ display: "flex", gap: 16 }}>
                    {/* DANH SÁCH BÊN TRÁI */}
                    <Card style={{ flex: "1 0 25%", minWidth: 320 }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={salaryConfigs}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleSelectItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background: selectedItem?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.key}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>{item.value}</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* CHI TIẾT BÊN PHẢI */}
                    <Card style={{ flex: 1 }}>
                        {selectedItem ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4}>
                                        {isEditing ? (
                                            <Input
                                                value={editedItem?.key}
                                                onChange={(e) => handleChange("key", e.target.value)}
                                            />
                                        ) : (
                                            selectedItem.key
                                        )}
                                    </Title>
                                    <Space>
                                        <Button type="text" icon={<IconWrapper Icon={Edit3} />} onClick={handleEditToggle} />
                                        <Popconfirm
                                            title="Xóa cấu hình?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}>
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Giá trị">
                                        {isEditing ? (
                                            <Input
                                                value={editedItem?.value}
                                                onChange={(e) => handleChange("value", e.target.value)}
                                            />
                                        ) : (
                                            selectedItem.value
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Mô tả">
                                        {isEditing ? (
                                            <Input.TextArea
                                                rows={3}
                                                value={editedItem?.description}
                                                onChange={(e) => handleChange("description", e.target.value)}
                                            />
                                        ) : (
                                            selectedItem.description
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>

                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button type="default" icon={<Ban size={16} />} onClick={handleCancel}>
                                            Hủy
                                        </Button>
                                        <Button className="ml-4" type="primary" icon={<Check size={16} />} onClick={handleUpdate}>
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn một cấu hình để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* MODAL THÊM MỚI */}
            <Modal
                title="Thêm cấu hình mới"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Key" name="key" rules={[{ required: true, message: "Vui lòng nhập key!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Giá trị" name="value" rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}>
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
