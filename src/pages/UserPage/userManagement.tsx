import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Avatar, Typography, Select, Card, message } from "antd";
import dayjs from "dayjs";
import { useUserStore } from "src/stores/useUserStore";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { Copy } from "lucide-react";

const { Title } = Typography;

const UserManagementPage = () => {
    const { users, meta, fetchUsers } = useUserStore();
    const [filter, setFilter] = useState("all"); // all | company | noncompany
    const [filteredUsers, setFilteredUsers] = useState(users);

    useEffect(() => {
        fetchUsers(1, 10);
    }, [fetchUsers]);

    useEffect(() => {
        if (filter === "company") {
            setFilteredUsers(users.filter((u) => u.employeeEmail?.endsWith("@company.com")));
        } else if (filter === "noncompany") {
            setFilteredUsers(users.filter((u) => !u.employeeEmail?.endsWith("@company.com")));
        } else {
            setFilteredUsers(users);
        }
    }, [filter, users]);

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: ["employee", "full_name"],
            key: "full_name",
            render: (_: any, record: any) => (
                <Space>
                    <Avatar src={record.employee?.avatar_url} />
                    {record.employee?.full_name || "-"}
                </Space>
            ),
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Email",
            dataIndex: ["employee", "email"],
            key: "email",
            render: (email: string) => {
                const handleCopy = async () => {
                    if (!email) return;
                    try {
                        await navigator.clipboard.writeText(email);
                        message.success("Copied!");
                    } catch (err) {
                        message.error("Can not copy!");
                    }
                };

                return (
                    <div className="flex items-center justify-between w-full">
                        <Tag
                            color={email?.endsWith("@company.com") ? "green" : "volcano"}
                            className="truncate max-w-[220px]"
                        >
                            {email}
                        </Tag>
                        <button
                            onClick={handleCopy}
                            className="transition bg-transparent border-none hover:text-blue-600"
                            title="Copy email"
                        >
                            <IconWrapper Icon={Copy} className="cursor-pointer" />
                        </button>
                    </div>
                );
            }
        },
        {
            title: "Vai trò",
            dataIndex: ["role", "name"],
            key: "role",
            render: (role: string) => (
                <Tag color={role === "Admin" ? "blue" : role === "HR" ? "orange" : "default"}>
                    {role}
                </Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) =>
                status === "active" ? (
                    <Tag color="green">Đang hoạt động</Tag>
                ) : (
                    <Tag color="red">Vô hiệu</Tag>
                ),
        },
        {
            title: "Lần đăng nhập cuối",
            dataIndex: "last_login_at",
            key: "last_login_at",
            render: (value: string) =>
                value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-",
        },
    ];

    return (
        <div style={{ padding: 20 }}>
            <Card>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 16,
                        alignItems: "center",
                    }}
                >
                    <Title level={4} style={{ margin: 0 }}>
                        Quản lý người dùng
                    </Title>
                    <Select
                        style={{ width: 260 }}
                        value={filter}
                        onChange={setFilter}
                        options={[
                            { value: "all", label: "Tất cả người dùng" },
                            { value: "company", label: "Người có email công ty (@company.com)" },
                            { value: "noncompany", label: "Người chưa được cấp email công ty" },
                        ]}
                    />
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredUsers}
                    pagination={{
                        total: meta?.total,
                        pageSize: meta?.pageSize || 10,
                        current: meta?.current || 1,
                        showSizeChanger: true,
                        onChange: (page, size) => fetchUsers(page, size),
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
};

export default UserManagementPage;
