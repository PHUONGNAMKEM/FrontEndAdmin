import React, { useState, useEffect } from "react";
import {
    Table, Button, Space, Input, Form, Typography, notification,
    Popconfirm, Descriptions, Card, List, Pagination, Row, Col, Tag, Checkbox, Radio,
    message
} from "antd";
import {
    AlignJustify, PanelLeft, CirclePlus, Edit3, Trash, Ban, Check, Search, Grid2X2
} from "lucide-react";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";

import { Notification as Noti } from "src/types/notification/Notification";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useNotificationStore } from "src/stores/notification/useNotificationStore";
import { NotificationAdd } from "./NotificationAdd";
import { useUserStore } from "src/stores/useUserStore";

const { Title } = Typography;

export const NotificationPage = () => {

    const [viewMode, setViewMode] =
        useState<"dashboard" | "list" | "detail">("dashboard");

    const [selected, setSelected] = useState<Noti | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState<Partial<Noti> | null>(null);

    const [form] = Form.useForm();

    const {
        notifications,
        meta,
        fetchNotifications,
        addNotification,
        updateNotification,
        deleteNotification,
        searchText,
        setSearchText,
        isModalOpen,
        setModalOpen,
    } = useNotificationStore();

    const { users, fetchUsers } = useUserStore();

    // --- UPDATE STATES ---
    const [updateMode, setUpdateMode] = useState<"one" | "multi" | "all">("all");
    const [updateSelectedUserIds, setUpdateSelectedUserIds] = useState<string[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    /* FETCH */
    useEffect(() => {
        fetchNotifications(currentPage, currentSize, searchText);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    /* Header Count */
    const { setHeaderContent } =
        useOutletContext<HeaderOutletContextType>();

    useEffect(() => {
        setHeaderContent(
            <h2 className="text-xl font-bold">
                Tổng số thông báo: <span>{meta?.total || 0}</span>
            </h2>
        );
        return () => setHeaderContent(null);
    }, [meta?.total]);

    /* CRUD */
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selected) {
            setEdited({ ...selected });

            // load user list để chọn người nhận
            fetchUsers(1, 9999);
        }
    };

    const handleChange = (field: keyof Noti, value: any) => {
        setEdited((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => setIsEditing(false);

    const handleUpdate = async () => {
        if (!edited || !selected) return;

        const hasContentChanged =
            edited.title !== selected.title ||
            edited.content !== selected.content ||
            edited.type !== selected.type ||
            (edited.actionUrl || "") !== (selected.actionUrl || "");

        // Nếu không có bất cứ thay đổi nào
        if (!hasContentChanged) {
            // notification.info({
            //     message: "Không có thay đổi nào!",
            //     description: "Bạn chưa chỉnh sửa bất kỳ thông tin nào.",
            //     placement: "topRight",
            // });
            message.info("Không có thay đổi nào để cập nhật.");

            return; // ko có thay đổi -> k gọi api
        }

        // LUÔN gửi đủ dữ liệu chính
        const changed: any = {
            type: edited.type,
            title: edited.title,
            content: edited.content,
            actionUrl: edited.actionUrl ?? null,
        };

        // Logic hình thức người nhận
        if (updateMode === "one") {
            changed.userId = updateSelectedUserIds[0] || null;
            changed.targetUserIds = null;
        }
        else if (updateMode === "multi") {
            changed.userId = null;
            changed.targetUserIds =
                updateSelectedUserIds.length > 0 ? updateSelectedUserIds : null;
        }
        else {
            changed.userId = null;
            changed.targetUserIds = null;
        }

        try {
            await updateNotification(selected.id, changed);

            notification.success({ message: "Cập nhật thành công!" });

            fetchNotifications(currentPage, currentSize, searchText);
            setSelected({ ...selected, ...changed });
            setIsEditing(false);

        } catch (err) {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };


    const confirmDelete = async () => {
        if (!selected) return;
        try {
            await deleteNotification(selected.id);
            notification.success({ message: "Xóa thành công!" });
            setSelected(null);
            fetchNotifications(currentPage, currentSize, searchText);
        } catch (err: any) {
            console.error("Delete contract failed:", err);
            notification.error({
                message: "Xóa thông báo thất bại!",
                description: err?.message || "Vui lòng thử lại.",
            });
        }
    };

    // const confirmDelete = async () => {
    //     if (!selectedContract?.id) return;
    //     try {
    //         await deleteContract!(selectedContract.id);
    //         notification.success({ message: "Xóa hợp đồng thành công!" });
    //         setSelectedContract(null);
    //         fetchContract(currentPage, currentSize);
    //     } catch (err: any) {
    //         console.error("Delete contract failed:", err);
    //         notification.error({
    //             message: "Xóa hợp đồng thất bại!",
    //             description: err?.message || "Vui lòng thử lại.",
    //         });
    //     }
    // };

    /* Search */
    const handleSearch = async () => {
        try {
            await fetchNotifications(1, currentSize, searchText);
            setSearchParams({
                current: "1",
                pageSize: currentSize.toString(),
                q: searchText,
            });
        } catch (err: any) {
            const backendMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Đã xảy ra lỗi không xác định.";

            notification.warning({
                message: "Không tìm thấy kết quả",
                description: backendMsg,
            });
        }
    };

    /* Table */
    const columns = [
        { title: "Tiêu đề", dataIndex: "title", key: "title" },
        { title: "Loại", dataIndex: "type", key: "type" },
        {
            title: "Tác giả",
            dataIndex: "actorName",
            key: "actorName",
            render: (v: string) => <Tag color="blue">{v}</Tag>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (v: string) => new Date(v).toLocaleString(),
        },
    ];

    const handleSelectItem = (item: Noti) => {
        setSelected(item);
        setIsEditing(false);
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">

                <Input
                    placeholder="Tìm thông báo..."
                    prefix={<IconWrapper Icon={Search} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 320 }}
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
                        Tạo thông báo
                    </Button>
                </Space>
            </div>

            {/* ===== Dashboard ===== */}
            {viewMode === "dashboard" ? (
                <div>
                    <Title level={4}>Danh sách thông báo</Title>
                    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
                        {notifications.map((item) => (
                            <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                                <Card
                                    hoverable
                                    className="transition-shadow duration-300 cursor-pointer hover:shadow-[0_2px_8px_rgba(99,99,99,0.2)]"
                                    onClick={() => {
                                        setSelected(item);
                                        setViewMode("detail");
                                    }}
                                >
                                    <Title level={5}>{item.title}</Title>
                                    <p>{item.content}</p>
                                    <Tag color="blue">{item.actorName}</Tag>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Pagination
                        current={meta?.current}
                        total={meta?.total}
                        pageSize={meta?.pageSize}
                        onChange={handlePageChange}
                        style={{ marginTop: 20, textAlign: "center" }}
                    />
                </div>
            ) : viewMode === "list" ? (

                /* ===== List View ===== */
                <Table
                    columns={columns}
                    dataSource={notifications}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        total: meta?.total,
                        pageSize: meta?.pageSize,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelected(record);
                            setViewMode("detail");
                        },
                    })}
                />

            ) : (

                /* ===== Detail View ===== */
                <div style={{ display: "flex", gap: 16 }}>

                    {/* LEFT */}
                    <Card style={{ flex: "1 0 25%", minWidth: 280 }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={notifications}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleSelectItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background:
                                            selected?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.title}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            {new Date(item.createdAt).toLocaleString()}
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

                    {/* RIGHT */}
                    <Card style={{ flex: 1 }}>
                        {selected ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {isEditing ? (
                                            <Input
                                                value={edited?.title}
                                                onChange={(e) => handleChange("title", e.target.value)}
                                            />
                                        ) : (
                                            selected.title
                                        )}
                                    </Title>

                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={handleEditToggle}
                                        />

                                        <Popconfirm
                                            title="Xóa thông báo?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}>
                                                Xóa
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1} size="middle">

                                    <Descriptions.Item label="Nội dung">
                                        {isEditing ? (
                                            <Input.TextArea
                                                rows={3}
                                                value={edited?.content}
                                                onChange={(e) =>
                                                    handleChange("content", e.target.value)
                                                }
                                            />
                                        ) : (
                                            selected.content
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Loại">
                                        {isEditing ? (
                                            <Input
                                                value={edited?.type}
                                                onChange={(e) => handleChange("type", e.target.value)}
                                            />
                                        ) : (
                                            selected.type
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Người tạo">
                                        <Tag color="blue">{selected.actorName}</Tag>
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ngày tạo">
                                        {new Date(selected.createdAt).toLocaleString()}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="URL hành động">
                                        {isEditing ? (
                                            <Input
                                                value={edited?.actionUrl}
                                                onChange={(e) => handleChange("actionUrl", e.target.value)}
                                            />
                                        ) : (
                                            selected.actionUrl || "—"
                                        )}
                                    </Descriptions.Item>

                                    {/* ------- Khi up date thì hỏi coi chọn 1, nhiều hay tất cả ------- */}
                                    {isEditing && (
                                        <>
                                            <Descriptions.Item label="Gửi thông báo cho">
                                                <Radio.Group
                                                    value={updateMode}
                                                    onChange={(e) => {
                                                        setUpdateMode(e.target.value);
                                                        setUpdateSelectedUserIds([]);
                                                    }}
                                                >
                                                    <Radio value="one">Một nhân viên</Radio>
                                                    <Radio value="multi">Nhiều nhân viên</Radio>
                                                    <Radio value="all">Tất cả nhân viên</Radio>
                                                </Radio.Group>
                                            </Descriptions.Item>

                                            {updateMode !== "all" && (
                                                <div
                                                    style={{
                                                        border: "1px solid #eee",
                                                        borderRadius: 6,
                                                        padding: 8,
                                                        maxHeight: 200,
                                                        overflowY: "auto",
                                                        marginBottom: 16,
                                                    }}
                                                >
                                                    <List
                                                        dataSource={users}
                                                        renderItem={(u) => (
                                                            <List.Item key={u.id}>
                                                                <Checkbox
                                                                    disabled={
                                                                        updateMode === "one" &&
                                                                        updateSelectedUserIds.length > 0 &&
                                                                        updateSelectedUserIds[0] !== u.id
                                                                    }
                                                                    checked={updateSelectedUserIds.includes(u.id!)}
                                                                    onChange={(e) => {
                                                                        if (updateMode === "one") {
                                                                            setUpdateSelectedUserIds(
                                                                                e.target.checked
                                                                                    ? [u.id!] // khi check
                                                                                    : [] // khi bỏ check
                                                                            );
                                                                        } else {
                                                                            setUpdateSelectedUserIds((prev) =>
                                                                                e.target.checked
                                                                                    ? [...prev, u.id!] // khi check
                                                                                    : prev.filter((x) => x !== u.id) // khi bỏ check
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {u.employeeName} – {u.employeeEmail}
                                                                </Checkbox>
                                                            </List.Item>
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

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
                            <p>Chọn thông báo để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            <NotificationAdd
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    fetchNotifications(currentPage, currentSize, searchText);
                }}
            />
        </div>
    );
};
