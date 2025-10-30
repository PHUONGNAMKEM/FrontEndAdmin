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
    notification,
    Pagination,
    Popconfirm,
    Modal,
    Form,
    DatePicker,
    InputNumber,
    Select,
} from "antd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, CirclePlus, Edit3, Trash, Ban, Check, Search } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useOvertimeStore } from "src/stores/useOvertimeStore";
import { Overtime } from "src/types/overtime/Overtime";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import dayjs from "dayjs";

const { Title } = Typography;

export const OvertimePage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedOT, setSelectedOT] = useState<Overtime | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedOT, setEditedOT] = useState<Overtime | null>(null);
    const [form] = Form.useForm();

    const { overtimes, meta, fetchOvertime, addOvertime, updateOvertime, deleteOvertime, isModalOpen, setModalOpen } =
        useOvertimeStore();
    const { employees, fetchEmployees } = useEmployeeStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch data
    useEffect(() => {
        fetchOvertime(currentPage, currentSize);
        fetchEmployees(undefined, 1000);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    };

    // Header context
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                    Tổng số OT: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [meta?.total]);

    // Columns
    const columns = [
        { title: "Nhân viên", dataIndex: "employeeFullName", key: "employeeFullName" },
        { title: "Phòng ban", dataIndex: "departmentName", key: "departmentName" },
        { title: "Chức vụ", dataIndex: "positionName", key: "positionName" },
        { title: "Ngày", dataIndex: "date", key: "date", render: (val: string) => dayjs(val).format("DD/MM/YYYY") },
        { title: "Giờ", dataIndex: "hours", key: "hours" },
        { title: "Hệ số", dataIndex: "rate", key: "rate" },
        { title: "Lý do", dataIndex: "reason", key: "reason", ellipsis: true },
    ];

    // CRUD logic
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedOT) setEditedOT({ ...selectedOT });
    };
    const handleChange = (field: keyof Overtime, value: any) => {
        setEditedOT((prev) => (prev ? { ...prev, [field]: value } : prev));
    };
    const handleCancel = () => setIsEditing(false);

    const handleUpdate = async () => {
        if (!editedOT || !selectedOT) return;
        const changed: Partial<Overtime> = {};
        Object.entries(editedOT).forEach(([k, v]) => {
            const old = selectedOT[k as keyof Overtime];
            if (v !== old && v !== undefined) changed[k as keyof Overtime] = v as any;
        });
        if (!Object.keys(changed).length) return message.info("Không có thay đổi nào.");

        try {
            await updateOvertime(selectedOT.id, changed);
            notification.success({ message: "Cập nhật OT thành công!" });
            setSelectedOT((prev) => (prev ? { ...prev, ...changed } : prev));
            setIsEditing(false);
            fetchOvertime(currentPage, currentSize);
        } catch {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedOT) return;
        try {
            await deleteOvertime(selectedOT.id);
            notification.success({ message: "Xóa OT thành công!" });
            setSelectedOT(null);
            fetchOvertime(currentPage, currentSize);
        } catch {
            notification.error({ message: "Xóa OT thất bại!" });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addOvertime(values);
            notification.success({ message: "Thêm OT thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchOvertime(currentPage, currentSize);
        } catch {
            notification.error({ message: "Thêm OT thất bại!" });
        }
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Input placeholder="Tìm kiếm OT..." prefix={<IconWrapper Icon={Search} />} style={{ width: 320 }} />
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
                        Thêm OT
                    </Button> */}
                </Space>
            </div>

            {/* View */}
            {viewMode === "list" ? (
                <Table
                    columns={columns}
                    dataSource={overtimes}
                    rowKey="id"
                    pagination={{
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({ onClick: () => { setSelectedOT(record); setViewMode("detail"); } })}
                />
            ) : (
                <Card>
                    {selectedOT ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <Title level={4}>{selectedOT.employeeFullName}</Title>
                                <Space>
                                    <Button icon={<IconWrapper Icon={Edit3} />} onClick={handleEditToggle} />
                                    <Popconfirm title="Xóa OT?" onConfirm={confirmDelete}>
                                        <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />} />
                                    </Popconfirm>
                                </Space>
                            </div>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Ngày">
                                    {isEditing ? (
                                        <DatePicker value={dayjs(editedOT?.date)} onChange={(d) => handleChange("date", d?.toISOString())} />
                                    ) : (
                                        dayjs(selectedOT.date).format("DD/MM/YYYY")
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Giờ">
                                    {isEditing ? (
                                        <InputNumber value={editedOT?.hours} onChange={(v) => handleChange("hours", v)} />
                                    ) : (
                                        selectedOT.hours
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Hệ số">
                                    {isEditing ? (
                                        <InputNumber value={editedOT?.rate} onChange={(v) => handleChange("rate", v)} />
                                    ) : (
                                        selectedOT.rate
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Lý do">
                                    {isEditing ? (
                                        <Input.TextArea value={editedOT?.reason} onChange={(e) => handleChange("reason", e.target.value)} />
                                    ) : (
                                        selectedOT.reason
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                            {isEditing && (
                                <div className="flex justify-end mt-4">
                                    <Button icon={<Ban size={16} />} onClick={handleCancel}>Hủy</Button>
                                    <Button type="primary" icon={<Check size={16} />} className="ml-4" onClick={handleUpdate}>
                                        Cập nhật
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Chọn một bản ghi OT để xem chi tiết.</p>
                    )}
                </Card>
            )}

            {/* Modal Add */}
            <Modal title="Thêm OT mới" open={isModalOpen} onCancel={() => setModalOpen(false)} onOk={handleAdd}>
                <Form form={form} layout="vertical">
                    <Form.Item label="Nhân viên" name="employeeId" rules={[{ required: true, message: "Chọn nhân viên" }]}>
                        <Select
                            showSearch
                            placeholder="Chọn nhân viên"
                            options={employees.map((e) => ({
                                value: e.id,
                                label: e.fullName,
                            }))}
                        />
                    </Form.Item>
                    <Form.Item label="Ngày" name="date" rules={[{ required: true, message: "Chọn ngày" }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item label="Giờ làm thêm" name="hours" rules={[{ required: true }]}>
                        <InputNumber min={0.5} max={10} step={0.5} className="w-full" />
                    </Form.Item>
                    <Form.Item label="Hệ số OT" name="rate" rules={[{ required: true }]}>
                        <InputNumber min={1} max={3} step={0.1} className="w-full" />
                    </Form.Item>
                    <Form.Item label="Lý do" name="reason">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
