import React, { useEffect, useState } from "react";
import { Card, List, Button, Input, Typography, Space, Popconfirm, Badge, Modal, Form, Tag, Pagination, notification } from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { BellDot, Trash, Check, PlusCircle, Search } from "lucide-react";
import { NotificationHistory } from "src/types/notification/NotificationHistory";
import { ApiResponse } from "src/types/api";
import { useSearchParams } from "react-router-dom";
import { useNotificationHistoryStore } from "src/stores/notification/useNotificationHistoryStore";
import './Notification.scss';

const { Title } = Typography;

export const NotificationHistoryPage = () => {

    const { notifications, meta, fetchNotificationsHistory, searchText, setSearchText, isModalOpen, setModalOpen
    } = useNotificationHistoryStore();

    const [filterUnread, setFilterUnread] = useState(false);
    const [form] = Form.useForm();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Này để bên header truyền unread qua -> hiển thị danh sách những noti chưa đọc của nvien
    const unreadFlag = searchParams.get("unread") === "true";
    useEffect(() => {
        if (unreadFlag) {
            setFilterUnread(true);
        }
    }, [unreadFlag]);

    // Fetch lần đầu
    useEffect(() => {
        fetchNotificationsHistory(currentPage, currentSize, searchText);
    }, [currentPage]);

    // Bấm Enter mới search
    const handleSearch = async () => {
        try {
            const res = await fetchNotificationsHistory(1, currentSize, searchText);
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
        // await addNotification(values);
        form.resetFields();
        setModalOpen(false);

        fetchNotificationsHistory(currentPage, currentSize, searchText);
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
                    className="w-[320]"
                />

                <Space>
                    <Button
                        size="large"
                        type={filterUnread ? "primary" : "default"}
                        icon={<IconWrapper Icon={BellDot} color={filterUnread ? "#fff" : undefined} />}
                        onClick={() => setFilterUnread(!filterUnread)}
                    >
                        Chưa đọc
                    </Button>

                    {/* <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={PlusCircle} color="#fff" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Tạo thông báo
                    </Button> */}
                </Space>
            </div>

            {/* ===== LIST ===== */}
            <Title level={4} className="!my-6">Lịch sử thông báo</Title>

            <Card>
                <List
                    dataSource={visibleNotifications}
                    renderItem={(item: NotificationHistory, index: number) => (
                        <List.Item
                            extra={
                                <Space>
                                    {/* {!item.readAt && (
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Check} />}
                                        // onClick={() => markAsRead(item.id)}
                                        >
                                            Đánh dấu đã đọc
                                        </Button>
                                    )} */}

                                    {/* <Popconfirm
                                        title="Bạn chắc chắn muốn xóa?"
                                    // onConfirm={() => deleteNotification(item.id)}
                                    >
                                        <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />} />
                                    </Popconfirm> */}
                                </Space>
                            }
                        >
                            <List.Item.Meta
                                className="align-item-center"
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
                                        {!item.readAt && <Badge color="#ff4d4f" />}
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
