import React, { useEffect, useState } from "react";
import {
    Table,
    Tag,
    Space,
    Button,
    Select,
    Typography,
    notification,
    Popconfirm,
} from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { RefreshCcw, Check, Ban } from "lucide-react";
import { useRequestStore } from "src/stores/useRequestStore";
import { useSearchParams } from "react-router-dom";

const { Title } = Typography;

export const RequestPage = () => {
    const { requests, meta, fetchRequests, updateStatus } = useRequestStore();
    const [loading, setLoading] = useState(false);
    const [pendingChange, setPendingChange] = useState<{ id: string; value: string } | null>(null);
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

    const handleStatusChange = async (id: string, value: string) => {
        setPendingChange({ id, value });
    };

    const confirmChange = async () => {
        if (!pendingChange) return;
        const { id, value } = pendingChange;

        try {
            await updateStatus(id, value as any);
            notification.success({
                message: "Cập nhật trạng thái thành công!",
            });
        } catch (err) {
            notification.error({
                message: "Cập nhật trạng thái thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        } finally {
            setPendingChange(null);
        }
    };

    const cancelChange = () => {
        setPendingChange(null);
    };

    const statusColors: Record<string, string> = {
        pending: "gold",
        approved: "green",
        rejected: "red",
        cancelled: "gray",
    };

    const columns = [
        {
            title: "Mã NV",
            dataIndex: "employeeCode",
            key: "employeeCode",
        },
        {
            title: "Tên nhân viên",
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
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>
            ),
        },
        {
            title: "Cập nhật trạng thái",
            key: "action",
            render: (record: any) => (
                <Popconfirm
                    title="Xác nhận cập nhật trạng thái"
                    description={`Bạn có chắc muốn đổi trạng thái sang "${pendingChange?.value || ""}"?`}
                    open={pendingChange?.id === record.id}
                    onConfirm={confirmChange}
                    onCancel={cancelChange}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <Select
                        defaultValue={record.status}
                        onChange={(value) => handleStatusChange(record.id, value)}
                        style={{ width: 140 }}
                        options={[
                            { value: 0, label: "Pending" },
                            { value: 1, label: "Approved" },
                            { value: 2, label: "Rejected" },
                            { value: 3, label: "Cancelled" },
                        ]}
                    />
                </Popconfirm>
            ),
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
        </div>
    );
};
