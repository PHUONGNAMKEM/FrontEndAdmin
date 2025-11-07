import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, Typography, notification, Popconfirm, Modal, } from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { RefreshCcw, Check, Ban, CircleCheck, BanIcon } from "lucide-react";
import { useRequestStore } from "src/stores/useRequestStore";
import { useSearchParams } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";

const { Title } = Typography;

export const RequestPage = () => {
    const { requests, meta, fetchRequests, updateStatus } = useRequestStore();
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    useEffect(() => {
        setLoading(true);
        fetchRequests(currentPage, currentSize).finally(() => setLoading(false));
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    const approverUserId = localStorage.getItem("userId");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

    // Khi chấp nhận yêu cầu
    const handleApprove = async (id: string) => {
        try {
            const res = await updateStatus(id, 1, approverUserId!);
            if (res?.success) {
                notification.success({
                    message: "Thành công",
                    description: res.message || "Yêu cầu đã được duyệt!",
                });
                fetchRequests(currentPage, currentSize);
            } else {
                notification.error({
                    message: "Duyệt thất bại",
                    description: res?.message || "Vui lòng thử lại",
                });
            }
        } catch (err) {
            notification.error({
                message: "Duyệt thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại",
            });
        }
    };

    const openRejectModal = (id: string) => {
        setSelectedRequestId(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        setRejectModalOpen(false);
        setRejectReason("");
        setSelectedRequestId(null);
    };

    // Khi từ chối yêu cầu - vì API backend chỉ chấp nhận 2 trạng thái approve và reject
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            notification.warning({ message: "Vui lòng nhập lý do từ chối!" });
            return;
        }

        try {
            const res = await updateStatus(selectedRequestId!, 2, approverUserId!, rejectReason);
            console.log("Response from updateStatus:", res);
            if (res?.success) {
                notification.success({
                    message: "Yêu cầu đã bị từ chối!",
                    description: res.message || "Đã gửi lý do từ chối",
                });
                closeRejectModal();
                fetchRequests(currentPage, currentSize);
            } else {
                notification.error({
                    message: "Từ chối thất bại",
                    description: res?.message || "Vui lòng thử lại",
                });
            }
        } catch (err) {
            notification.error({
                message: "Từ chối thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại",
            });
        }
    };

    const statusColors: Record<string, string> = {
        pending: "gold",
        approved: "green",
        rejected: "red",
        cancelled: "gray",
    };

    const columns = [
        // {
        //     title: "Mã NV",
        //     dataIndex: "employeeCode",
        //     key: "employeeCode",
        // },
        {
            title: "Nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Loại yêu cầu",
            dataIndex: "category",
            key: "category",
            render: (text: string) => text.toUpperCase(),
        },
        {
            title: "Nội dung",
            dataIndex: "description",
            key: "description",
            // render: (text: string) => text.toUpperCase(),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status]} style={{ textTransform: "capitalize" }}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "Duyệt yêu cầu",
            key: "action",
            render: (record: any) => {
                const status = record.status;

                if (status === "approved") {
                    return (
                        <Space>
                            <IconWrapper Icon={CircleCheck} color="#53C41B" />
                        </Space>
                    );
                }

                if (status === "pending") {
                    return (
                        <Space>
                            <Popconfirm
                                title="Xác nhận duyệt yêu cầu"
                                onConfirm={() => handleApprove(record.id)}
                                okText="Duyệt"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    icon={<IconWrapper Icon={CircleCheck} color="#53C41B" />}
                                />
                            </Popconfirm>

                            <Popconfirm
                                title="Xác nhận từ chối yêu cầu"
                                onConfirm={() => openRejectModal(record.id)}
                                okText="Từ chối"
                                cancelText="Hủy"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<IconWrapper Icon={BanIcon} color="red" />}
                                />
                            </Popconfirm>
                        </Space>
                    );
                }

                // Các trạng thái khác (rejected, cancelled)
                return <IconWrapper Icon={BanIcon} color="red" />;
            },
        },
    ];

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Title level={4} style={{ margin: 0 }}>
                    Danh sách yêu cầu ({meta?.total || 0})
                </Title>
                <Button
                    icon={<IconWrapper Icon={RefreshCcw} />}
                    onClick={() => fetchRequests(currentPage, currentSize)}
                    loading={loading}
                    size="large"
                >
                    Làm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: meta?.current || 1,
                    pageSize: meta?.pageSize || 10,
                    total: meta?.total || 0,
                    onChange: handlePageChange,
                }}
            />

            {/* Nếu từ chối thì nhập lý do  */}
            <Modal
                title="Nhập lý do từ chối"
                open={rejectModalOpen}
                onOk={handleReject}
                onCancel={() => setRejectModalOpen(false)}
                okText="Gửi"
                cancelText="Hủy"
            >
                <TextArea
                    rows={4}
                    placeholder="Nhập lý do từ chối yêu cầu này..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>
        </div>
    );
};
