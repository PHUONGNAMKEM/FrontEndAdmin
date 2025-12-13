import React, { useState, useEffect } from "react";
import {
    Table, Button, Space, Input, Modal, Form, Typography, notification,
    Popconfirm, Descriptions, Card, List, Pagination, Row, Col, Tag
} from "antd";

import { AlignJustify, PanelLeft, CirclePlus, Edit3, Trash, Ban, Check, Search, Grid2X2 } from "lucide-react";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";

import { useShiftTemplateStore } from "src/stores/shift/useShiftTemplateStore";
import { useSearchParams, useOutletContext } from "react-router-dom";

import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { ShiftTemplate } from "src/types/shift/ShiftTemplate";

const { Title } = Typography;

export const ShiftTemplatePage = () => {

    const [viewMode, setViewMode] = useState<"dashboard" | "list" | "detail">("dashboard");
    const [selectedItem, setSelectedItem] = useState<ShiftTemplate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<Partial<ShiftTemplate> | null>(null);

    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const {
        templates, meta, fetchTemplates, addTemplate, updateTemplate,
        deleteTemplate, isModalOpen, setModalOpen
    } = useShiftTemplateStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // ===== FETCH =====
    useEffect(() => {
        fetchTemplates(currentPage, currentSize, searchText);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: String(current),
            pageSize: String(pageSize)
        });
    };

    // ===== HEADER =====
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <h2 className="text-xl font-bold text-[var(--text-color)]">
                Tổng số mẫu ca: <span>{meta?.total || 0}</span>
            </h2>
        );
        return () => setHeaderContent(null);
    }, [meta?.total]);

    // ===== CRUD =====
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedItem) setEditedItem({ ...selectedItem });
    };

    const handleChange = (field: keyof ShiftTemplate, value: any) => {
        setEditedItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleUpdate = async () => {
        if (!selectedItem || !editedItem) return;

        const changed: Partial<ShiftTemplate> = {};
        Object.entries(editedItem).forEach(([k, v]) => {
            const oldVal = selectedItem[k as keyof ShiftTemplate];
            if (v !== oldVal) changed[k as keyof ShiftTemplate] = v as any;
        });

        if (Object.keys(changed).length === 0) {
            notification.info({ message: "Không có thay đổi!" });
            return;
        }

        try {
            await updateTemplate(selectedItem.id, changed);
            notification.success({ message: "Cập nhật thành công!" });
            fetchTemplates(currentPage, currentSize, searchText);
            setSelectedItem({ ...selectedItem, ...changed });
            setIsEditing(false);
        } catch {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            await deleteTemplate(selectedItem.id);
            notification.success({ message: "Xóa thành công!" });
            setSelectedItem(null);
            fetchTemplates(currentPage, currentSize, searchText);
        } catch (error: any) {
            notification.error({ message: "Xóa thất bại!", description: error.message });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addTemplate(values);
            notification.success({ message: "Thêm thành công!" });
            form.resetFields();
            setModalOpen(false);
            fetchTemplates(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Thêm thất bại!" });
        }
    };

    const handleSearch = () => {
        fetchTemplates(1, currentSize, searchText);
        setSearchParams({
            current: "1",
            pageSize: String(currentSize),
            q: searchText
        });
    };

    // ===== COLUMNS TABLE =====
    const columns = [
        { title: "Mã ca", dataIndex: "code", key: "code" },
        { title: "Tên ca", dataIndex: "name", key: "name" },
        {
            title: "Thời gian",
            key: "time",
            render: (_: any, r: ShiftTemplate) => (
                <span>{r.startTime} - {r.endTime}</span>
            )
        },
        {
            title: "Số giờ",
            dataIndex: "totalWorkingHours",
            render: (v: number) => <Tag color="blue">{v} giờ</Tag>
        }
    ];

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>

            {/* ===== TOOLBAR ===== */}
            <div className="flex items-center justify-between mb-4">

                <Input
                    placeholder="Tìm kiếm mẫu ca..."
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
                        Thêm mẫu ca
                    </Button>
                </Space>
            </div>

            {/* ===== DASHBOARD ===== */}
            {viewMode === "dashboard" && (
                <>
                    <Title level={4}>Danh sách mẫu ca</Title>

                    <Row gutter={[16, 16]} className="mt-2">
                        {templates.map(t => (
                            <Col xs={24} sm={12} md={8} lg={6} key={t.id}>
                                <Card
                                    hoverable={false}
                                    className="
                                    transition-shadow
                                    duration-300 
                                    cursor-pointer 
                                    hover:shadow-[0_2px_8px_rgba(99,99,99,0.2)]"
                                    onClick={() => {
                                        setSelectedItem(t);
                                        setViewMode("detail");
                                    }}
                                >
                                    <Title className="min-h-[48px] max-h-[48px]" level={5}>{t.code} – {t.name}</Title>
                                    <div>{t.startTime} - {t.endTime}</div>
                                    <Tag color="blue">{t.totalWorkingHours} giờ</Tag>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="mt-4 text-center">
                        <Pagination
                            current={meta?.current}
                            total={meta?.total}
                            pageSize={meta?.pageSize}
                            onChange={handlePageChange}
                        />
                    </div>
                </>
            )}

            {/* ===== LIST ===== */}
            {viewMode === "list" && (
                <Table
                    columns={columns}
                    dataSource={templates}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        total: meta?.total,
                        pageSize: meta?.pageSize,
                        onChange: handlePageChange
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedItem(record);
                            setViewMode("detail");
                        }
                    })}
                />
            )}

            {/* ===== DETAIL VIEW ===== */}
            {viewMode === "detail" && (
                <div style={{ display: "flex", gap: 16 }}>
                    {/* Left list */}
                    <Card style={{ flex: "0 0 280px" }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={templates}
                            renderItem={(item: ShiftTemplate) => (
                                <List.Item
                                    style={{
                                        cursor: "pointer",
                                        background: selectedItem?.id === item.id ? "#e6f4ff" : "transparent",
                                        padding: 8,
                                        borderRadius: 6
                                    }}
                                    onClick={() => {
                                        setSelectedItem(item);
                                        setIsEditing(false);
                                    }}
                                >
                                    <b>{item.code}</b> – {item.name}
                                </List.Item>
                            )}
                        />

                        <Pagination
                            current={meta?.current}
                            total={meta?.total}
                            pageSize={meta?.pageSize}
                            onChange={handlePageChange}
                            className="mt-3 text-center"
                        />
                    </Card>

                    {/* Right detail */}
                    <Card style={{ flex: 1 }}>
                        {selectedItem ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4}>
                                        {isEditing ? (
                                            <Input
                                                value={editedItem?.name}
                                                onChange={e => handleChange("name", e.target.value)}
                                            />
                                        ) : (
                                            `${selectedItem.code} – ${selectedItem.name}`
                                        )}
                                    </Title>

                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={handleEditToggle}
                                        />

                                        <Popconfirm
                                            title="Xóa mẫu ca?"
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

                                    <Descriptions.Item label="Mã ca">
                                        {isEditing ? (
                                            <Input
                                                value={editedItem?.code}
                                                onChange={e => handleChange("code", e.target.value)}
                                            />
                                        ) : selectedItem.code}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Giờ làm việc">
                                        {isEditing ? (
                                            <>
                                                <Input
                                                    value={editedItem?.startTime}
                                                    onChange={e => handleChange("startTime", e.target.value)}
                                                    style={{ marginBottom: 8 }}
                                                />
                                                <Input
                                                    value={editedItem?.endTime}
                                                    onChange={e => handleChange("endTime", e.target.value)}
                                                />
                                            </>
                                        ) : (
                                            `${selectedItem.startTime} → ${selectedItem.endTime}`
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Phút nghỉ">
                                        {isEditing ? (
                                            <Input
                                                value={editedItem?.breakDurationMinutes}
                                                onChange={e =>
                                                    handleChange("breakDurationMinutes", Number(e.target.value))
                                                }
                                            />
                                        ) : selectedItem.breakDurationMinutes}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Tổng giờ làm">
                                        <Tag color="blue">{selectedItem.totalWorkingHours} giờ</Tag>
                                    </Descriptions.Item>

                                    {/* <Descriptions.Item label="WorkDay">
                                        {isEditing ? (
                                            <Input
                                                value={editedItem?.workDay}
                                                onChange={e => handleChange("workDay", Number(e.target.value))}
                                            />
                                        ) : selectedItem.workDay}
                                    </Descriptions.Item> */}

                                    <Descriptions.Item label="Mô tả">
                                        {isEditing ? (
                                            <Input.TextArea
                                                rows={3}
                                                value={editedItem?.description}
                                                onChange={e => handleChange("description", e.target.value)}
                                            />
                                        ) : selectedItem.description}
                                    </Descriptions.Item>

                                </Descriptions>

                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button icon={<Ban size={16} />} onClick={() => setIsEditing(false)}>
                                            Hủy
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<Check size={16} />}
                                            className="ml-3"
                                            onClick={handleUpdate}
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn mẫu ca để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* ===== Modal Add ===== */}
            <Modal
                title="Thêm mẫu ca"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Mã ca"
                        name="code"
                        rules={[{ required: true, message: "Nhập mã ca" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Tên ca"
                        name="name"
                        rules={[{ required: true, message: "Nhập tên ca" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Giờ bắt đầu" name="startTime">
                        <Input placeholder="HH:mm:ss" />
                    </Form.Item>

                    <Form.Item label="Giờ kết thúc" name="endTime">
                        <Input placeholder="HH:mm:ss" />
                    </Form.Item>

                    <Form.Item label="Phút nghỉ" name="breakDurationMinutes">
                        <Input />
                    </Form.Item>

                    {/* <Form.Item label="WorkDay" name="workDay">
                        <Input />
                    </Form.Item> */}

                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
