import React, { useEffect, useMemo, useState } from "react";
import { Table, Card, List, Typography, Modal, Button, Input, Pagination, Space, Popconfirm, Form, notification, Tag, Descriptions, Select, } from "antd";
import { AlignJustify, PanelLeft, CirclePlus, Edit3, Trash, Ban, Check, Search, } from "lucide-react";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { User } from "src/types/user/User";
import { useUserStore } from "src/stores/useUserStore";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { UserAdd } from "src/types/user/UserAdd";
import { useEmployeeStore } from "src/stores/useEmployeeStore";

const { Title } = Typography;

export const UserManagementPage = () => {
    const { users, meta, fetchUsers, addUser, updateUser, deleteUser, isModalOpen, setModalOpen, searchText, setSearchText, roleFilter, setRoleFilter } = useUserStore();

    const [viewMode, setViewMode] = useState<"list" | "detail">("list");

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<Partial<User> | null>(null);

    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("current") || "1");
    const currentSize = Number(searchParams.get("pageSize") || "10");

    // Lấy danh sách employees từ store ra để so sánh với lại danh sách employee (employeeId) trong users để lọc ra những nhân viên chưa có tài khoản user
    const { employees, fetchEmployees, meta: employeeMeta } = useEmployeeStore();

    // Header
    const { setHeaderContent } =
        useOutletContext<HeaderOutletContextType>();

    useEffect(() => {
        setHeaderContent(
            <h2 className="text-xl font-bold text-[var(--text-color)]">
                Tổng số tài khoản: <span>{meta?.total || 0}</span>
            </h2>
        );
        return () => setHeaderContent(null);
    }, [meta?.total]);

    // Fetch
    useEffect(() => {
        fetchUsers(currentPage, currentSize, searchText, roleFilter);
        fetchEmployees(1, employeeMeta?.total); // Lấy danh sách nhân viên để hiển thị trong dropdown thêm user
    }, [searchParams, searchText, roleFilter]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
            q: searchText,
            role: roleFilter,
        });
    };

    const roleColors: Record<string, string> = {
        Admin: "red",
        Manager: "purple",
        HR: "orange",
        Employee: "green",
        User: "blue",
    };

    const handleSearch = () => {
        fetchUsers(1, currentSize, searchText);
        setSearchParams({
            current: "1",
            pageSize: currentSize.toString(),
            q: searchText,
        });
    };

    // ===== Edit =====
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedUser) setEditedUser({ ...selectedUser });
    };

    const handleChange = (field: keyof User, value: any) => {
        setEditedUser((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleUpdate = async () => {
        if (!selectedUser || !editedUser) return;

        const changed: Partial<User> = {};
        Object.entries(editedUser).forEach(([k, v]) => {
            if (v !== selectedUser[k as keyof User]) {
                changed[k as keyof User] = v as any;
            }
        });

        if (Object.keys(changed).length === 0) {
            notification.info({ message: "Không có thay đổi!" });
            return;
        }

        try {
            await updateUser(selectedUser.id, changed);
            notification.success({ message: "Cập nhật thành công!" });
            setIsEditing(false);
            setSelectedUser({ ...selectedUser, ...changed });
            fetchUsers(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        try {
            await deleteUser(selectedUser.id);
            notification.success({ message: "Xóa thành công!" });
            setSelectedUser(null);
            fetchUsers(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Xóa thất bại!" });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            const payload: UserAdd = {
                employeeId: values.employeeId,
                userName: values.userName,
                roleId: values.roleId,
                status: values.status,
                tempPassword: values.tempPassword,
            };
            await addUser(payload);

            notification.success({ message: "Thêm tài khoản thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchUsers(currentPage, currentSize, searchText);
        } catch {
            notification.error({ message: "Thêm thất bại!" });
        }
    };

    const columns = [
        {
            title: "Nhân viên",
            key: "employeeName",
            render: (u: User) => <span>{u.employeeName}</span>,
        },
        { title: "Username", dataIndex: "userName", key: "userName" },
        { title: "Email", dataIndex: "employeeEmail", key: "employeeEmail" },
        {
            title: "Role",
            dataIndex: "roleName",
            key: "roleName",
            render: (role: string) => (
                <Tag color={roleColors[role] || "default"}>{role}</Tag>
            ),
        },
    ];

    const handleSelectItem = (item: User) => {
        setSelectedUser(item);
        setIsEditing(false);
    };

    const availableEmployees = useMemo(() => {
        // tập các employeeId đã có tài khoản
        const employeeHasUser = new Set( // dùng Set để đảm bảo không trùng và tra nhanh trong đó
            users
                .filter(u => u.employeeId)         // phòng khi null
                .map(u => u.employeeId as string)
        );

        // lọc employees: chỉ giữ những nhân viên chưa có trong set trên
        return employees.filter(emp => !employeeHasUser.has(emp.id!)); // tra ở đây
    }, [employees, users]);


    const roleOptions = [
        { value: "00000000-0000-0000-0000-000000000001", label: "Admin" },
        { value: "00000000-0000-0000-0000-000000000002", label: "HR" },
        { value: "00000000-0000-0000-0000-000000000003", label: "Employee" },
        { value: "00000000-0000-0000-0000-000000000004", label: "User" },
        { value: "00000000-0000-0000-0000-000000000005", label: "Manager" },
    ];
    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== Toolbar ===== */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-between">
                    <Input
                        placeholder="Tìm theo tên hoặc email..."
                        prefix={<IconWrapper Icon={Search} />}
                        style={{ width: 320 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />

                    <Select
                        className="w-44 !ml-4"
                        placeholder="Lọc theo Role"
                        allowClear
                        value={roleFilter}
                        onChange={(val) => {
                            setRoleFilter(val);
                            setSelectedUser(null);
                            setIsEditing(false);
                            setSearchParams({
                                current: "1",
                                pageSize: currentSize.toString(),
                                q: searchText,
                                role: val ?? "",
                            });
                        }}
                        options={[
                            { value: "", label: "Tất cả" },
                            { value: "Admin", label: "Admin" },
                            { value: "Manager", label: "Manager" },
                            { value: "HR", label: "HR" },
                            { value: "Employee", label: "Employee" },
                            { value: "User", label: "User" },
                        ]}
                    />
                </div>

                <Space>
                    <Button
                        size="large"
                        type={viewMode === "list" ? "primary" : "default"}
                        icon={
                            <IconWrapper
                                Icon={AlignJustify}
                                color={viewMode === "list" ? "#fff" : undefined}
                            />
                        }
                        onClick={() => setViewMode("list")}
                    />

                    <Button
                        size="large"
                        type={viewMode === "detail" ? "primary" : "default"}
                        icon={
                            <IconWrapper
                                Icon={PanelLeft}
                                color={viewMode === "detail" ? "#fff" : undefined}
                            />
                        }
                        onClick={() => setViewMode("detail")}
                    />

                    {/* <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Thêm
                    </Button> */}
                </Space>
            </div>

            {/* ===== VIEW LIST ===== */}
            {viewMode === "list" && (
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        total: meta?.total,
                        pageSize: meta?.pageSize,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedUser(record);
                            setViewMode("detail");
                        },
                    })}
                />
            )}

            {/* ===== VIEW DETAIL ===== */}
            {viewMode === "detail" && (
                <div style={{ display: "flex", gap: 16 }}>
                    {/* View bên trái hiển thị danh sách */}
                    <Card
                        style={{ flex: "1 0 25%", minWidth: 300 }}
                        bodyStyle={{ padding: 8 }}
                    >
                        <List
                            dataSource={users}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleSelectItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background: selectedUser?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {item.employeeName}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            {item.employeeEmail}
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
                        {selectedUser ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {isEditing ? (
                                            <Input
                                                value={editedUser?.userName}
                                                onChange={(e) => handleChange("userName", e.target.value)}
                                            />
                                        ) : (
                                            selectedUser.userName
                                        )}
                                    </Title>

                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={handleEditToggle}
                                        />
                                        <Popconfirm
                                            title="Xóa tài khoản?"
                                            description="Bạn chắc chắn muốn xóa tài khoản này?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}>
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1} size="middle">

                                    {/* <Descriptions.Item label="Role">
                                        {isEditing ? (
                                            <Input
                                                value={editedUser?.roleId}
                                                onChange={(e) => handleChange("roleId", e.target.value)}
                                            />
                                        ) : (
                                            <Tag color={roleColors[selectedUser.roleName]}>
                                                {selectedUser.roleName}
                                            </Tag>
                                        )}
                                    </Descriptions.Item> */}

                                    <Descriptions.Item label="Role">
                                        {isEditing ? (
                                            <Select
                                                style={{ width: "100%" }}
                                                value={editedUser?.roleId}
                                                onChange={(val, option) => {
                                                    // cập nhật roleId để gửi lên API
                                                    handleChange("roleId", val);

                                                    // cập nhật luôn roleName cho UI 
                                                    const label = (option as any).label as string;
                                                    handleChange("roleName", label);
                                                }}
                                                options={roleOptions}
                                            />
                                        ) : (
                                            <Tag color={roleColors[selectedUser.roleName] || "default"}>
                                                {selectedUser.roleName}
                                            </Tag>
                                        )}
                                    </Descriptions.Item>


                                    <Descriptions.Item label="Tên nhân viên">
                                        {selectedUser.employeeName}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Email nhân viên">
                                        {selectedUser.employeeEmail}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Trạng thái">
                                        {isEditing ? (
                                            <Select
                                                style={{ width: "100%" }}
                                                value={editedUser?.status}
                                                onChange={(val) => handleChange("status", val)}
                                                options={[
                                                    { value: 0, label: "Active" },
                                                    { value: 1, label: "Locked" },
                                                ]}
                                            />
                                        ) : (
                                            selectedUser.status === 0 ? "Active" : "Locked"
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Lần đăng nhập cuối">
                                        {selectedUser.lastLoginAt || "Chưa bao giờ"}
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* ===== BUTTONS UPDATE ===== */}
                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button icon={<Ban size={16} />} onClick={handleCancel}>
                                            Hủy
                                        </Button>

                                        <Button
                                            type="primary"
                                            className="ml-3"
                                            icon={<Check size={16} />}
                                            onClick={handleUpdate}
                                        >
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn một tài khoản để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* ===== Modal Add ===== */}
            {/* <Modal
                title="Thêm tài khoản"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item
                        label="Nhân viên"
                        name="employeeId"
                        rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            options={availableEmployees.map(emp => ({
                                value: emp.id,  // gửi id nhân viên cho backend
                                label: `${emp.fullName} - ${emp.email}`, // show đẹp hơn
                            }))}
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Username"
                        name="userName"
                        rules={[{ required: true, message: "Vui lòng nhập username" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Role"
                        name="roleId"
                        rules={[{ required: true, message: "Vui lòng chọn role" }]}
                    >
                        <Select
                            placeholder="Chọn role"
                            options={[
                                { value: "1", label: "Admin" },
                                { value: "2", label: "Manager" },
                                { value: "3", label: "HR" },
                                { value: "4", label: "Employee" },
                                { value: "5", label: "User" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        initialValue={0}
                    >
                        <Select
                            options={[
                                { value: 0, label: "Active" },
                                { value: 1, label: "Locked" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu tạm"
                        name="tempPassword"
                        rules={[{ required: true, message: "Nhập mật khẩu tạm" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>

            </Modal> */}
        </div>
    );
};
