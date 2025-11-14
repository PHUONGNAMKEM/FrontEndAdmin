import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, Modal, Form, Typography, notification, Popconfirm, Descriptions, Card, List, Pagination, Row, Col, Tag, } from "antd";
import { AlignJustify, PanelLeft, CirclePlus, Edit3, Trash, Ban, Check, Search, Grid2X2 } from "lucide-react";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { useRoleStore } from "src/stores/useRoleStore";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { Role } from "src/types/user/Role";

const { Title } = Typography;

export const RolePage = () => {

    const [viewMode, setViewMode] = useState<"dashboard" | "list" | "detail">("dashboard");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedRole, setEditedRole] = useState<Partial<Role> | null>(null);

    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();

    const { roles, meta, fetchRoles, addRole, updateRole, deleteRole, isModalOpen, setModalOpen } = useRoleStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch 
    useEffect(() => {
        fetchRoles(currentPage, currentSize, searchText);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    // Header
    const { setHeaderContent } =
        useOutletContext<HeaderOutletContextType>();

    useEffect(() => {
        setHeaderContent(
            <h2 className="text-xl font-bold">
                Tổng số role: <span>{meta?.total || 0}</span>
            </h2>
        );
        return () => setHeaderContent(null);
    }, [meta?.total]);

    // CRUD
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedRole) setEditedRole({ ...selectedRole });
    };

    const handleChange = (field: keyof Role, value: any) => {
        setEditedRole((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        if (!editedRole || !selectedRole) return;

        const changed: Partial<Role> = {};

        Object.entries(editedRole).forEach(([key, val]) => {
            const oldVal = selectedRole[key as keyof Role];
            if (val !== oldVal && val !== undefined) {
                changed[key as keyof Role] = val as any;
            }
        });

        if (Object.keys(changed).length === 0) {
            notification.info({ message: "Không có thay đổi để cập nhật" });
            return;
        }

        try {
            await updateRole!(selectedRole.id, changed);
            notification.success({ message: "Cập nhật role thành công!" });
            setSelectedRole({ ...selectedRole, ...changed });
            setIsEditing(false);
            fetchRoles(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedRole) return;
        try {
            await deleteRole!(selectedRole.id);
            notification.success({ message: "Xóa role thành công!" });
            setSelectedRole(null);
            fetchRoles(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Xóa thất bại!" });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addRole(values);
            notification.success({ message: "Thêm role thành công!" });
            form.resetFields();
            setModalOpen(false);
            fetchRoles(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Thêm thất bại!" });
        }
    };

    const handleSearch = () => {
        fetchRoles(1, currentSize, searchText);
        setSearchParams({
            current: "1",
            pageSize: currentSize.toString(),
            q: searchText,
        });
    };

    const columns = [
        { title: "Tên role", dataIndex: "name", key: "name" },
        { title: "Mô tả", dataIndex: "description", key: "description" },
        {
            title: "Số user",
            dataIndex: "usersCount",
            key: "usersCount",
            render: (v: number) => <Tag color="blue">{v}</Tag>,
        },
    ];

    const handleSelectItem = (item: Role) => {
        setSelectedRole(item);
        setIsEditing(false);
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>

            {/* ===== Toolbar ===== */}
            <div className="flex items-center justify-between mb-4">

                <Input
                    placeholder="Tìm kiếm role..."
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
                        Thêm role
                    </Button>
                </Space>
            </div>

            {/* ===== View Dashboard ===== */}
            {viewMode === "dashboard" ? (
                <div>
                    <Title level={4}>Danh sách role</Title>
                    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                        {roles.map((role) => (
                            <Col key={role.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable={false}
                                    className="
                                    transition-shadow
                                    duration-300 
                                    cursor-pointer 
                                    hover:shadow-[0_2px_8px_rgba(99,99,99,0.2)]"
                                    onClick={() => {
                                        setSelectedRole(role);
                                        setViewMode("detail");
                                    }}
                                >
                                    <Title level={5}>{role.name}</Title>
                                    <p>{role.description}</p>
                                    <Tag color="blue">{role.usersCount} users</Tag>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div style={{ textAlign: "center", marginTop: 20 }}>
                        <Pagination
                            current={meta?.current}
                            total={meta?.total}
                            pageSize={meta?.pageSize}
                            onChange={handlePageChange}
                        />
                    </div>
                </div>

            ) : viewMode === "list" ? (
                /* View List */
                <Table
                    columns={columns}
                    dataSource={roles}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        total: meta?.total,
                        pageSize: meta?.pageSize,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedRole(record);
                            setViewMode("detail");
                        },
                    })}
                />

            ) : (
                /* Detail */
                <div style={{ display: "flex", gap: 16 }}>
                    {/* View bên trái hiển thị danh sách */}
                    <Card style={{ flex: "1 0 5%", minWidth: 300 }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={roles}
                            renderItem={(item: Role) => (
                                <List.Item
                                    onClick={() => handleSelectItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background:
                                            selectedRole?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            {item.usersCount} users
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

                    {/* View bên phải hiển thị chi tiết */}
                    <Card style={{ flex: 1 }}>
                        {selectedRole ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {isEditing ? (
                                            <Input
                                                value={editedRole?.name}
                                                onChange={(e) => handleChange("name", e.target.value)}
                                            />
                                        ) : (
                                            selectedRole.name
                                        )}
                                    </Title>

                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={handleEditToggle}
                                        />

                                        <Popconfirm
                                            title="Xóa role?"
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
                                            <Input
                                                value={editedRole?.description}
                                                onChange={(e) =>
                                                    handleChange("description", e.target.value)
                                                }
                                            />
                                        ) : (
                                            selectedRole.description
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Số user">
                                        <Tag color="blue">{selectedRole.usersCount}</Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Các quyền">
                                        <List
                                            size="small"
                                            dataSource={selectedRole.permissions}
                                            renderItem={(p) => (
                                                <List.Item>
                                                    <Tag color="purple">{p.code}</Tag>
                                                    <span style={{ marginLeft: 8 }}>{p.description}</span>
                                                </List.Item>
                                            )}
                                        />
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
                            </>
                        ) : (
                            <p>Chọn một role để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* ===== Modal Add Role ===== */}
            <Modal
                title="Thêm role"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Tên role"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên role!" }]}
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
