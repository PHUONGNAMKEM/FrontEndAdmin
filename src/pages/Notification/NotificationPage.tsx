import React, { useEffect, useState } from "react";
import { Card, List, Button, Input, Typography, Space, Popconfirm, Badge, Modal, Form, Tag, Pagination, notification } from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { BellDot, Trash, Check, PlusCircle, Search } from "lucide-react";
import { useNotificationStore } from "src/stores/useNotificationStore";
import { Notification } from "src/types/notification/Notification";
import { ApiResponse } from "src/types/api";
import { useSearchParams } from "react-router-dom";

const { Title } = Typography;

export const NotificationPage = () => {

    const {
        notifications,
        meta,
        fetchNotifications,
        searchText,
        setSearchText,
        markAsRead,
        deleteNotification,
        addNotification,
        isModalOpen,
        setModalOpen
    } = useNotificationStore();

    const [filterUnread, setFilterUnread] = useState(false);
    const [form] = Form.useForm();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch lần đầu
    useEffect(() => {
        fetchNotifications(currentPage, currentSize, searchText);
    }, [currentPage]);

    // Bấm Enter mới search
    const handleSearch = async () => {
        try {
            const res = await fetchNotifications(1, currentSize, searchText);
            console.log(">>> check res: ", res);
            setSearchParams({
                current: "1",
                pageSize: currentSize.toString(),
                q: searchText,
            });
        } catch (err: any) {
            console.log(">> Check fail noti: ", err);
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

    const visibleNotifications = filterUnread
        ? notifications.filter((n) => !n.readAt)
        : notifications;

    const handleSubmitCreate = async () => {
        const values = await form.validateFields();
        await addNotification(values);
        form.resetFields();
        setModalOpen(false);

        fetchNotifications(currentPage, currentSize, searchText);
    };

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    return (
        <div className="p-4">
            {/* ===== Toolbar ===== */}
            <div className="flex justify-between mb-4">
                <Input
                    placeholder="Tìm theo tiêu đề hoặc người gửi"
                    prefix={<IconWrapper Icon={Search} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 320 }}
                />

                <Space>
                    <Button
                        size="large"
                        type={filterUnread ? "primary" : "default"}
                        icon={<IconWrapper Icon={BellDot} color="#fff" />}
                        onClick={() => setFilterUnread(!filterUnread)}
                    >
                        Chưa đọc
                    </Button>

                    <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={PlusCircle} color="#fff" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Tạo thông báo
                    </Button>
                </Space>
            </div>

            {/* ===== LIST ===== */}
            <Card>
                <List
                    dataSource={visibleNotifications}
                    renderItem={(item: Notification, index: number) => (
                        <List.Item
                            extra={
                                <Space>
                                    {!item.readAt && (
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Check} />}
                                            onClick={() => markAsRead(item.id)}
                                        >
                                            Đánh dấu đã đọc
                                        </Button>
                                    )}

                                    <Popconfirm
                                        title="Bạn chắc chắn muốn xóa?"
                                        onConfirm={() => deleteNotification(item.id)}
                                    >
                                        <Button danger icon={<IconWrapper Icon={Trash} />} />
                                    </Popconfirm>
                                </Space>
                            }
                        >
                            <List.Item.Meta
                                avatar={
                                    <div className="w-8 text-right text-gray-500">
                                        <Tag color="blue">{index + 1 + (currentPage - 1) * currentSize}</Tag>
                                    </div>
                                }
                                title={
                                    <Space>
                                        <span style={{ fontWeight: 600 }}>
                                            {item.title}
                                        </span>
                                        {!item.readAt && <Badge color="red" />}
                                    </Space>
                                }
                                description={
                                    <>
                                        <div>{item.content}</div>
                                        <div style={{ color: "#888", fontSize: 12 }}>
                                            {item.userName} —{" "}
                                            {new Date(item.createdAt).toLocaleString()}
                                        </div>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />

                {/* Pagination */}
                <Pagination
                    current={meta?.current}
                    total={meta?.total}
                    pageSize={meta?.pageSize}
                    onChange={handlePageChange}
                />
            </Card>

            {/* ===== MODAL ADD ===== */}
            <Modal
                title="Tạo thông báo"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmitCreate}
                okText="Tạo"
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Nội dung" name="content" rules={[{ required: true }]}>
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item label="UserId nhận" name="userId">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
