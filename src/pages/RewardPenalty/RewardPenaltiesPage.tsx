import React, { useEffect, useState } from "react";
import {
    Table, Space, Button, Input, Card, Descriptions, List, Typography, message, Dropdown, Pagination, Popconfirm, Modal, Form,
    notification, Select, DatePicker,
    Avatar,
    Tag
} from "antd";
import { SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, Check, CirclePlus, Edit3, Trash, Search, Ban, FileDown } from "lucide-react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useRewardPenaltiesStore } from "src/stores/useRewardPenaltiesStore";
import { RewardPenaltyDetail } from "src/types/rewardPenalty/RewardPenaltyDetail";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import dayjs from "dayjs";
import { render } from "react-dom";
import { useExcelStore } from "src/stores/report/excel";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { useRewardPenaltyStore } from "src/stores/useRewardPenaltyStore";

const { Title } = Typography;

export const RewardPenaltiesPage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedItem, setSelectedItem] = useState<RewardPenaltyDetail | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<RewardPenaltyDetail | null>(null);
    const [form] = Form.useForm();

    const {
        rewardPenalties,
        meta,
        fetchRewardPenalties,
        filterRewardPenalties,
        addRewardPenalty,
        updateRewardPenalty,
        deleteRewardPenalty,
        isModalOpen,
        setModalOpen,
    } = useRewardPenaltiesStore();

    // loại thưởng phạt
    const { rewardPenalties: rewardPenaltyTypes, fetchRewardPenalty, meta: metaRewardPenalty } = useRewardPenaltyStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");
    const { employees, fetchEmployees, meta: metaEmployee } = useEmployeeStore();

    useEffect(() => {
        fetchRewardPenalties(currentPage, currentSize);
        fetchEmployees(undefined, metaEmployee?.total);
        fetchRewardPenalty(1, metaRewardPenalty?.total);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    };

    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                    Tổng số thưởng/phạt: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedItem) setEditedItem({ ...selectedItem });
    };

    const handleChange = (field: keyof RewardPenaltyDetail, value: any) => {
        setEditedItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    };
    // Nhân viên: dùng employeeId (emp.id)
    const employeeOptions = employees.map((emp) => ({
        value: emp.id,
        label: emp.fullName,
        email: emp.email,
        avatarUrl: emp.avatarUrl,
    }));

    // Người quyết định: dùng userId (emp.userId)
    const decidedByOptions = employees
        .filter((emp) => !!emp.userId)
        .map((emp) => ({
            value: emp.userId,
            label: emp.fullName,
            email: emp.email,
            avatarUrl: emp.avatarUrl,
            roleName: emp.positionName
        }));

    // Loại thưởng/phạt: gom unique typeId từ rewardPenalties
    // const typeOptions = Array.from(
    //     new Map(
    //         rewardPenalties.map((item) => [
    //             item.typeId,
    //             {
    //                 value: item.typeId,
    //                 label: item.typeName,
    //                 kind: item.kind,
    //             },
    //         ])
    //     ).values()
    // );
    const typeOptions = rewardPenaltyTypes.map((t) => ({
        value: t.id,
        label: t.name,
        kind: t.type === 0 || t.type === "reward" ? "reward" : "penalty",
    }));

    const commonAmounts = [200000, 300000, 500000, 1000000, 2000000, 5000000];

    const commonAmountOptions = commonAmounts.map((v) => ({
        value: v, // giữ là number để gửi đúng kiểu
        label: `${v.toLocaleString("vi-VN")} đ`,
    }));

    const handleCancel = () => setIsEditing(false);

    const handleUpdate = async () => {
        if (!editedItem || !selectedItem) return;

        const changed: Partial<RewardPenaltyDetail> = {};
        Object.entries(editedItem).forEach(([key, newValue]) => {
            const oldValue = selectedItem[key as keyof RewardPenaltyDetail];
            if (newValue !== oldValue && newValue !== undefined)
                changed[key as keyof RewardPenaltyDetail] = newValue as any;
        });

        if (Object.keys(changed).length === 0) return message.info("Không có thay đổi nào.");

        try {
            await updateRewardPenalty(selectedItem.id, changed);
            notification.success({ message: "Cập nhật thành công!" });
            setIsEditing(false);
            setSelectedItem((p) => (p ? { ...p, ...changed } : p));
        } catch (err) {
            notification.error({ message: "Cập nhật thất bại!" });
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem?.id) return;
        try {
            await deleteRewardPenalty(selectedItem.id);
            notification.success({ message: "Xóa thành công!" });
            setSelectedItem(null);
            fetchRewardPenalties(currentPage, currentSize);
        } catch (error: any) {
            notification.error({ message: "Xóa thất bại!", description: error.message });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addRewardPenalty({
                ...values,
                decidedAt: values.decidedAt.format("YYYY-MM-DD"),
            });
            notification.success({ message: "Thêm mới thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchRewardPenalties(currentPage, currentSize);
        } catch {
            notification.error({ message: "Thêm mới thất bại!" });
        }
    };

    const columns = [
        {
            title: "Nhân viên", dataIndex: "employeeFullName", key: "employeeFullName", render: (fullName: string, record: RewardPenaltyDetail) => (
                <Space>
                    <Avatar src={record.employeeAvatarUrl} />
                    <div>
                        <div style={{ fontWeight: 600 }}>{fullName}</div>
                    </div>
                </Space>
            ),
        },
        { title: "Loại", dataIndex: "typeName", key: "typeName" },
        { title: "Hình thức", dataIndex: "kind", key: "kind", render: (v: string) => v === "reward" ? "Thưởng" : "Phạt" },
        { title: "Số tiền", dataIndex: "finalAmount", key: "finalAmount" },
        { title: "Ngày", dataIndex: "decidedAt", key: "decidedAt" },
    ];

    const handleChangeItem = (item: RewardPenaltyDetail) => {
        setSelectedItem(item);
        setIsEditing(false);
    };

    // Xuất báo cáo bảng chấm công ra file Excel
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [fromDate, setFromDate] = useState(dayjs());
    const [toDate, setToDate] = useState(dayjs());

    const { downloadAttendanceReport, downloadSalaryTableReport } = useExcelStore();

    const [searchText, setSearchText] = useState("");
    const handleSearch = () => {
        fetchRewardPenalties(1, currentSize, searchText);
        setSearchParams({
            current: "1",
            pageSize: String(currentSize),
            q: searchText
        });
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== TOOLBAR ===== */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="flex items-center">
                    <Input
                        placeholder="Tìm kiếm..."
                        prefix={<IconWrapper Icon={Search} />}
                        style={{ width: 320, marginRight: "16px" }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Select
                        defaultValue={2}
                        style={{ width: 100 }}
                        onChange={(value) => filterRewardPenalties(1, 10, value)}
                        options={[
                            { value: 2, label: "Tất cả" },
                            { value: 0, label: "Thưởng" },
                            { value: 1, label: "Phạt" },
                        ]}
                    />
                </div>
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
                    <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={CirclePlus} color="#fff" />}
                        onClick={() => setModalOpen(true)}
                    >
                        Thêm mới
                    </Button>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    type: "group",
                                    label: (
                                        <div className="w-full py-1 font-semibold text-center text-black cursor-default pointer-events-none select-none">
                                            Xuất file Excel Tháng này
                                        </div>
                                    ),
                                    children: []
                                },
                                {
                                    key: "attendance",
                                    label: "Xuất file Excel Chấm công",
                                    icon: <IconWrapper Icon={FileDown} />,
                                    onClick: ({ domEvent }) => {
                                        domEvent.stopPropagation();
                                        setExportModalOpen(true);
                                    },
                                },
                                {
                                    key: "attendance-reward-penalty",
                                    label: "Xuất file Excel Khen thưởng / Kỷ luật",
                                    icon: <IconWrapper Icon={FileDown} />,
                                    onClick: ({ domEvent }) => {
                                        domEvent.stopPropagation();
                                        setExportModalOpen(true);
                                    },
                                },
                            ],
                        }}
                    >
                        <Button size="large" icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Space>
            </div>

            {/* ===== VIEW ===== */}
            {viewMode === "list" ? (
                <Table
                    columns={columns}
                    dataSource={rewardPenalties}
                    rowKey="id"
                    pagination={{
                        current: meta?.current,
                        pageSize: meta?.pageSize,
                        total: meta?.total,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedItem(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <div style={{ display: "flex", gap: 16 }}>
                    <Card style={{ flex: "1 0 25%", minWidth: 320 }} bodyStyle={{ padding: 8 }}>
                        <List
                            dataSource={rewardPenalties}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => handleChangeItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background: selectedItem?.id === item.id ? "#e6f4ff" : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{item.typeName}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>{item.kind === "reward" ? "Thưởng" : "Phạt"}</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card style={{ flex: 1 }}>
                        {selectedItem ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4}>
                                        {isEditing ? (
                                            <Input value={editedItem?.typeName} onChange={(e) => handleChange("typeName", e.target.value)} />
                                        ) : (
                                            selectedItem.typeName
                                        )}
                                    </Title>
                                    <Space>
                                        <Button type="text" icon={<IconWrapper Icon={Edit3} />} onClick={handleEditToggle} />
                                        <Popconfirm title="Xóa?" onConfirm={confirmDelete}>
                                            <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}>Xóa</Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Loại">
                                        {selectedItem.kind === "penalty" ? "Phạt" : "Thưởng"}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Nhân viên">
                                        <Space>
                                            <Avatar src={selectedItem.employeeAvatarUrl} />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{selectedItem.employeeFullName}</div>
                                            </div>
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số tiền">{selectedItem.finalAmount}</Descriptions.Item>
                                    {/* <Descriptions.Item label="Ngày quyết định">{selectedItem.decidedAt}</Descriptions.Item> */}
                                    <Descriptions.Item label="Ngày quyết định">
                                        {isEditing ? (
                                            <DatePicker
                                                className="w-full"
                                                format="YYYY-MM-DD"
                                                value={
                                                    editedItem?.decidedAt
                                                        ? dayjs(editedItem.decidedAt)
                                                        : undefined
                                                }
                                                onChange={(date) =>
                                                    handleChange(
                                                        "decidedAt",
                                                        date ? date.format("YYYY-MM-DD") : undefined
                                                    )
                                                }
                                            />
                                        ) : (
                                            dayjs(selectedItem.decidedAt).format("YYYY-MM-DD")
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Lý do">
                                        {isEditing ? (
                                            <Input.TextArea
                                                rows={3}
                                                value={editedItem?.customReason}
                                                onChange={(e) => handleChange("customReason", e.target.value)}
                                            />
                                        ) : (
                                            selectedItem.customReason
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>

                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button onClick={handleCancel} icon={<Ban size={16} />}>Hủy</Button>
                                        <Button className="ml-2" type="primary" icon={<Check size={16} />} onClick={handleUpdate}>Cập nhật</Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn bản ghi để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* Modal thêm mới */}
            <Modal
                title="Thêm thưởng/phạt"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        decidedAt: dayjs(),   // default hôm nay
                    }}
                >
                    {/* Nhân viên */}
                    <Form.Item
                        label="Nhân viên"
                        name="employeeId"
                        rules={[{ required: true, message: "Vui lòng chọn nhân viên" }]}
                    >
                        <Select
                            placeholder="Chọn nhân viên"
                            options={employeeOptions}
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            optionRender={(option) => (
                                <Space>
                                    <Avatar src={option.data.avatarUrl} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>
                                            {option.data.label}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            {option.data.email}
                                        </div>
                                    </div>
                                </Space>
                            )}
                        />
                    </Form.Item>

                    {/* Loại thưởng/phạt */}
                    <Form.Item
                        label="Loại thưởng/phạt"
                        name="typeId"
                        rules={[{ required: true, message: "Vui lòng chọn loại" }]}
                    >
                        <Select
                            placeholder="Chọn loại thưởng/phạt"
                            options={typeOptions}
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            optionRender={(option) => (
                                <div className="flex items-center justify-between">
                                    <span>{option.data.label}</span>
                                    <Tag
                                        color={
                                            option.data.kind === "reward"
                                                ? "green"
                                                : "red"
                                        }
                                    >
                                        {option.data.kind === "reward"
                                            ? "Thưởng"
                                            : "Phạt"}
                                    </Tag>
                                </div>
                            )}
                        />
                    </Form.Item>

                    {/* Kiểu reward/penalty (kind) */}
                    <Form.Item
                        label="Kiểu"
                        name="kind"
                        rules={[{ required: true, message: "Vui lòng chọn kiểu" }]}
                    >
                        <Select
                            options={[
                                { value: "reward", label: "Thưởng" },
                                { value: "penalty", label: "Phạt" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item label="Số tiền tùy chỉnh" name="amountOverride">
                        <Select
                            placeholder="Chọn số tiền"
                            allowClear
                            options={commonAmountOptions}
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label as string)
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>

                    <Form.Item label="Lý do" name="customReason">
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        label="Ngày quyết định"
                        name="decidedAt"
                        rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                    >
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>

                    {/* Người quyết định = userId */}
                    <Form.Item
                        label="Người quyết định"
                        name="decidedBy"
                        rules={[{ required: true, message: "Vui lòng chọn người quyết định" }]}
                    >
                        <Select
                            placeholder="Chọn người quyết định"
                            options={decidedByOptions}
                            showSearch
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                            optionRender={(option) => (
                                <Space>
                                    <Avatar src={option.data.avatarUrl} />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>
                                            {option.data.label}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            {option.data.email}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#888" }}>
                                            Chức vụ: {option.data.roleName}
                                        </div>
                                    </div>
                                </Space>
                            )}
                        />
                    </Form.Item>
                </Form>
            </Modal>


            {/* Modal Export Excel Chấm công */}
            <Modal
                title="Xuất file Excel Chấm công"
                open={exportModalOpen}
                onCancel={() => setExportModalOpen(false)}
                onOk={() => {
                    const from = fromDate ? fromDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
                    const to = toDate ? toDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
                    console.log("From:", from, "To:", to);
                    downloadAttendanceReport({
                        fromDate: from,
                        toDate: to
                    });

                    setExportModalOpen(false);
                }}
                okText="Xuất file"
                cancelText="Hủy"
            >
                <Form layout="vertical">
                    <Form.Item label="Từ ngày">
                        <DatePicker
                            className="w-full"
                            value={fromDate}
                            onChange={(val) => setFromDate(val || dayjs())}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item label="Đến ngày">
                        <DatePicker
                            className="w-full"
                            value={toDate}
                            onChange={(val) => setToDate(val || dayjs())}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Export Excel Khen thưởng / Kỷ luật */}
            <Modal
                title={<p>Xuất file Excel Khen thưởng / Kỷ luật</p>}
                open={exportModalOpen}
                onCancel={() => setExportModalOpen(false)}
                onOk={() => {
                    const from = fromDate ? fromDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
                    const to = toDate ? toDate.format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
                    console.log("From:", from, "To:", to);
                    downloadSalaryTableReport({
                        fromDate: from,
                        toDate: to
                    });

                    setExportModalOpen(false);
                }}
                okText="Xuất file"
                cancelText="Hủy"
            >
                <Form layout="vertical">
                    <Form.Item label="Từ ngày">
                        <DatePicker
                            className="w-full"
                            value={fromDate}
                            onChange={(val) => setFromDate(val || dayjs())}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>

                    <Form.Item label="Đến ngày">
                        <DatePicker
                            className="w-full"
                            value={toDate}
                            onChange={(val) => setToDate(val || dayjs())}
                            format="YYYY-MM-DD"
                        />
                    </Form.Item>
                </Form>
            </Modal>

        </div >
    );
};
