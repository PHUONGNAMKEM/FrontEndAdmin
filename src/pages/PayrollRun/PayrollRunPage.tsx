import React, { useEffect, useState } from "react";
import {
    Table,
    Space,
    Button,
    Input,
    Card,
    Descriptions,
    List,
    Typography,
    message,
    Dropdown,
    Pagination,
    Popconfirm,
    Modal,
    Form,
    notification,
    Tag,
} from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, Check, CirclePlus, Edit3, Trash, Ban, FastForward, FastForwardIcon, FileDown } from "lucide-react";
import { useSearchParams, useOutletContext, useNavigate } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";

import { PayrollRun } from "src/types/payroll/PayrollRun";
import dayjs from "dayjs";
import { usePayrollRunStore } from "src/stores/payroll/usePayrollRunStore";
import { useExcelStore } from "src/stores/report/excel";

const { Title } = Typography;

export const PayrollRunPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedRun, setEditedRun] = useState<PayrollRun | null>(null);
    const [form] = Form.useForm();
    const [searchParams, setSearchParams] = useSearchParams();

    const { payrollRuns, meta, fetchPayrollRuns, createPayrollRun, updatePayrollRun, deletePayrollRun, isModalOpen, setModalOpen } =
        usePayrollRunStore();

    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch
    useEffect(() => {
        fetchPayrollRuns(currentPage, currentSize);
    }, [currentPage, currentSize]);

    // Pagination
    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    };

    // Header
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                    Tổng số kỳ lương: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [meta?.total, setHeaderContent]);

    // Edit toggle
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedRun) setEditedRun({ ...selectedRun });
    };

    const handleChange = (field: keyof PayrollRun, value: any) => {
        setEditedRun((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => setIsEditing(false);

    const handleUpdate = async () => {
        if (!selectedRun || !editedRun) return;
        const changed: Partial<PayrollRun> = {};
        Object.entries(editedRun).forEach(([k, v]) => {
            const oldV = selectedRun[k as keyof PayrollRun];
            if (v !== oldV && v !== undefined) changed[k as keyof PayrollRun] = v;
        });
        if (!Object.keys(changed).length) return message.info("Không có thay đổi.");
        try {
            await updatePayrollRun!(selectedRun.id, changed);
            notification.success({ message: "Cập nhật kỳ lương thành công!" });
            setSelectedRun((prev) => (prev ? { ...prev, ...changed } : prev));
            setIsEditing(false);
            fetchPayrollRuns(currentPage, currentSize);
        } catch (err) {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedRun) return;
        try {
            await deletePayrollRun!(selectedRun.id);
            notification.success({ message: "Xóa kỳ lương thành công!" });
            setSelectedRun(null);
            fetchPayrollRuns(currentPage, currentSize);
        } catch {
            notification.error({ message: "Xóa kỳ lương thất bại!" });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await createPayrollRun!(values);
            notification.success({ message: "Tạo kỳ lương thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchPayrollRuns(currentPage, currentSize);
        } catch {
            notification.error({ message: "Tạo kỳ lương thất bại!" });
        }
    };

    const { downloadSalarySummary } = useExcelStore();

    const columns = [
        { title: "Kỳ lương", dataIndex: "period", key: "period" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: PayrollRun["status"]) => {
                const colorMap: any = {
                    draft: "blue",
                    processed: "green",
                    locked: "volcano",
                };
                return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
            },
        },
        {
            title: "Xem chi tiết", dataIndex: "actions", key: "actions", render: (_: any, record: PayrollRun) => {
                return <Button
                    onClick={() => navigate(`/salary/accept/payroll/run/${record.id}`)}
                    icon={<IconWrapper Icon={FastForward} className="!mt-2.5" />
                    }
                >Chi tiết kỳ lương</Button>
            }
        },
        {
            title: "Xuất file Excel", key: "export-batch-salary", render: (_: any, record: PayrollRun) => {
                return <Button
                    size="large"
                    icon={<IconWrapper Icon={FileDown} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        downloadSalarySummary(record.id);
                    }}
                >
                    Tải xuống
                </Button>
            }
        }
    ];

    const handleSelectItem = (item: PayrollRun) => {
        setSelectedRun(item);
        setIsEditing(false);
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== TOOLBAR ===== */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Input placeholder="Tìm kỳ lương..." prefix={<SearchOutlined />} style={{ width: 320 }} />
                <Space>
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
                    {/* <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Thêm kỳ lương
                    </Button> */}
                </Space>
            </div>

            {viewMode === "list" ? (
                <Table
                    columns={columns}
                    dataSource={payrollRuns}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        total: meta?.total,
                        pageSize: meta?.pageSize,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedRun(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <div style={{ display: "flex", gap: 16 }}>
                    {/* DANH SÁCH BÊN TRÁI */}
                    <Card style={{ flex: "1 0 25%", minWidth: 320 }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={payrollRuns}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleSelectItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background: selectedRun?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.period}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>{item.status}</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* CHI TIẾT BÊN PHẢI */}
                    <Card style={{ flex: 1 }}>
                        {selectedRun ? (
                            <>
                                <div className="flex justify-between mb-4">
                                    <Title level={4}>
                                        {isEditing ? (
                                            <Input
                                                value={editedRun?.period}
                                                onChange={(e) => handleChange("period", e.target.value)}
                                            />
                                        ) : (
                                            selectedRun.period
                                        )}
                                    </Title>
                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<IconWrapper Icon={Edit3} />}
                                            onClick={handleEditToggle}
                                        />
                                        <Popconfirm
                                            title="Xóa kỳ lương"
                                            description="Bạn chắc chắn muốn xóa kỳ lương này?"
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
                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Trạng thái">
                                        {isEditing ? (
                                            <Input
                                                value={editedRun?.status}
                                                onChange={(e) => handleChange("status", e.target.value)}
                                            />
                                        ) : (
                                            selectedRun.status
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>

                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button icon={<Ban size={16} />} onClick={handleCancel}>
                                            Hủy
                                        </Button>
                                        <Button type="primary" className="ml-3" icon={<Check size={16} />} onClick={handleUpdate}>
                                            Cập nhật
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn một kỳ lương để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* Modal thêm mới */}
            <Modal
                title="Thêm kỳ lương mới"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Kỳ lương (YYYY-MM)" name="period" rules={[{ required: true }]}>
                        <Input placeholder="Ví dụ: 2025-11" />
                    </Form.Item>
                    <Form.Item label="Trạng thái" name="status" initialValue="draft">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
