import React, { useEffect, useState } from "react";
import { Table, Tag, Space, Button, Typography, notification, Popconfirm, Modal, Input, } from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { RefreshCcw, Check, Ban, CircleCheck, BanIcon, Search } from "lucide-react";
import { useRequestStore } from "src/stores/useRequestStore";
import { useSearchParams } from "react-router-dom";
import TextArea from "antd/es/input/TextArea";
import { Request } from "src/types/request/Request";
import dayjs from "dayjs";

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

    // Hàm tính giờ
    const calcApprovedHours = (fromDate: string, startTime: string, endTime: string) => {
        if (!fromDate || !startTime || !endTime) return 0;

        // parse theo format
        const start = dayjs(`${fromDate} ${startTime}`, "YYYY-MM-DD HH:mm:ss");
        const end = dayjs(`${fromDate} ${endTime}`, "YYYY-MM-DD HH:mm:ss");

        if (!start.isValid() || !end.isValid()) return 0;

        // nếu end < start (OT qua đêm) thì cộng 1 ngày
        const safeEnd = end.isBefore(start) ? end.add(1, "day") : end;

        // giờ dạng số (có thể lẻ)
        const hours = safeEnd.diff(start, "minute") / 60;

        // làm tròn 2 chữ số (tuỳ bạn)
        return Math.round(hours * 100) / 100;
    };

    // Khi chấp nhận yêu cầu
    const handleApprove = async (id: string, category: string | number, fromDate: string, startTime: string, endTime: string) => {
        try {
            let approvedHour = 0;

            if (category === "ot") {
                approvedHour = calcApprovedHours(fromDate, startTime, endTime);

                // updateStatus có param approvedHour
                const res = await updateStatus(id, 1, approverUserId!, undefined, approvedHour);

                if (res?.success) {
                    notification.success({ message: "Thành công", description: res.message || "Yêu cầu đã được duyệt!" });
                    fetchRequests(currentPage, currentSize);
                } else {
                    notification.error({ message: "Duyệt thất bại", description: res?.message || "Vui lòng thử lại" });
                }
                return;
            }

            // các loại khác (leave, etc.)
            const res = await updateStatus(id, 1, approverUserId!);

            if (res?.success) {
                notification.success({ message: "Thành công", description: res.message || "Yêu cầu đã được duyệt!" });
                fetchRequests(currentPage, currentSize);
            } else {
                notification.error({ message: "Duyệt thất bại", description: res?.message || "Vui lòng thử lại" });
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
            render: (record: Request) => {
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
                                onConfirm={() => handleApprove(record.id, record.category, record.fromDate, record.startTime, record.endTime)}
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

    const [searchText, setSearchText] = useState("");
    const handleSearch = () => {
        fetchRequests(1, currentSize, searchText);
        setSearchParams({
            current: "1",
            pageSize: String(currentSize),
            q: searchText
        });
    };

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
                <Input
                    className="flex-1 mx-4"
                    placeholder="Tìm kiếm yêu cầu (approved, pending, rejected)..."
                    prefix={<IconWrapper Icon={Search} />}
                    style={{ width: 320 }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                />
                <div>
                    <Button
                        icon={<IconWrapper Icon={RefreshCcw} />}
                        onClick={() => fetchRequests(currentPage, currentSize, "pending")}
                        loading={loading}
                        size="large"
                        className="mr-4"
                    >
                        Yêu cần chưa được duyệt
                    </Button>
                    <Button
                        icon={<IconWrapper Icon={RefreshCcw} />}
                        onClick={() => fetchRequests(currentPage, currentSize)}
                        loading={loading}
                        size="large"
                    >
                        Làm mới
                    </Button>
                </div>
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
