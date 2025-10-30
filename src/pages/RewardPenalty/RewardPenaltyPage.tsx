import React, { useEffect, useState } from "react";
import {
    Table, Space, Button, Input, Card, Descriptions, List, Typography, message, Dropdown, Pagination, Popconfirm, Modal, Form,
    notification, Select
} from "antd";
import { SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { AlignJustify, PanelLeft, Check, CirclePlus, Edit3, Trash, Search, Ban } from "lucide-react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { useRewardPenaltyStore } from "src/stores/useRewardPenaltyStore";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { RewardPenalty } from "src/types/rewardPenalty/RequardPenalty";
import { render } from "react-dom";

const { Title } = Typography;

export const RewardPenaltyPage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedItem, setSelectedItem] = useState<RewardPenalty | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedItem, setEditedItem] = useState<RewardPenalty | null>(null);
    const [form] = Form.useForm();

    const {
        rewardPenalties,
        meta,
        fetchRewardPenalty,
        filterRewardPenalty,
        addRewardPenalty,
        updateRewardPenalty,
        deleteRewardPenalty,
        isModalOpen,
        setModalOpen,
    } = useRewardPenaltyStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    useEffect(() => {
        fetchRewardPenalty(currentPage, currentSize);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                    Tổng số loại thưởng/phạt: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedItem) setEditedItem({ ...selectedItem });
    };

    const handleChange = (field: keyof RewardPenalty, value: any) => {
        setEditedItem((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => setIsEditing(false);

    // Cập nhật RequardPenalty
    const handleUpdate = async () => {
        if (!editedItem || !selectedItem) return;

        const changedFields: Partial<RewardPenalty> = {};
        Object.entries(editedItem).forEach(([key, newValue]) => {
            const oldValue = selectedItem[key as keyof RewardPenalty];
            if (newValue !== oldValue && newValue !== undefined) {
                changedFields[key as keyof RewardPenalty] = newValue as any;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            message.info("Không có thay đổi nào để cập nhật.");
            return;
        }

        try {
            await updateRewardPenalty!(selectedItem.id!, changedFields);
            notification.success({ message: "Cập nhật thành công!" });
            setSelectedItem((prev) => (prev ? { ...prev, ...changedFields } : prev));
            setIsEditing(false);
            fetchRewardPenalty(currentPage, currentSize);
        } catch (err) {
            notification.error({ message: "Cập nhật thất bại!", description: (err as any)?.message });
        }
    };

    // Xóa RequardPenalty
    const confirmDelete = async () => {
        if (!selectedItem?.id) return;
        try {
            await deleteRewardPenalty!(selectedItem.id);
            notification.success({ message: "Xóa thành công!" });
            setSelectedItem(null);
            fetchRewardPenalty(currentPage, currentSize);
        } catch (err) {
            notification.error({ message: "Xóa thất bại!", description: (err as any)?.message });
        }
    };

    // Thêm RequardPenalty
    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            await addRewardPenalty!({
                ...values,
                level: Number(values.level),
            });
            notification.success({ message: "Thêm mới thành công!" });
            setModalOpen(false);
            form.resetFields();
            fetchRewardPenalty(currentPage, currentSize);
        } catch (err) {
            notification.error({ message: "Thêm mới thất bại!", description: (err as any)?.message });
        }
    };

    const columns = [
        { title: "Tên", dataIndex: "name", key: "name" },
        { title: "Loại", dataIndex: "type", key: "type", render: (t: string) => t === "reward" ? "Thưởng" : "Phạt" },
        { title: "Mức", dataIndex: "level", key: "level", render: (l: string) => l === "low" ? "Thấp" : l === "medium" ? "Trung bình" : "Cao" },
        {
            title: "Hình thức", dataIndex: "form", key: "form", render: (f: string) =>
                f === "verbal_warning" ? "Cảnh cáo bằng lời nói" : f === "written_warning" ? "Cảnh cáo bằng văn bản" : f === "fine" ? "Phạt" : f === "suspension" ? "Đình chỉ" : f === "bonus" ? "Thưởng" : "Thăng chức"
        },
        { title: "Số tiền", dataIndex: "defaultAmount", key: "defaultAmount" },
    ];

    const handleChangeItem = (item: RewardPenalty) => {
        setSelectedItem(item);
        setIsEditing(false);
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== TOOLBAR ===== */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div className="flex items-center">
                    <Input placeholder="Tìm kiếm..." prefix={<IconWrapper Icon={Search} />} style={{ width: 320, marginRight: "16px" }} />
                    <Select
                        defaultValue={0}
                        style={{ width: 100 }}
                        onChange={(value) => filterRewardPenalty(1, 10, value)}
                        options={[
                            { value: 0, label: "Thưởng" },
                            { value: 1, label: "Phạt" },
                            { value: 2, label: "Tất cả" },
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
                    <Dropdown menu={{ items: [{ key: "1", label: "Tùy chọn 1" }] }}>
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
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
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
                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                        <div style={{ fontSize: 12, color: "#888" }}>{item.type === "reward" ? "Thưởng" : "Phạt"}</div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card style={{ flex: 1 }}>
                        {selectedItem ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{ margin: 0 }}>
                                        {isEditing ? (
                                            <Input value={editedItem?.name} onChange={(e) => handleChange("name", e.target.value)} />
                                        ) : (
                                            selectedItem.name
                                        )}
                                    </Title>
                                    <Space>
                                        <Button type="text" icon={<IconWrapper Icon={Edit3} />} onClick={handleEditToggle} />
                                        <Popconfirm title="Xóa mục này?" onConfirm={confirmDelete}>
                                            <Button danger icon={<IconWrapper Icon={Trash} color="#ff4d4f" />}>Xóa</Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Loại">
                                        {isEditing ? (
                                            <Select
                                                className="w-full"
                                                value={editedItem?.type}
                                                onChange={(v) => handleChange("type", v)}
                                                options={[
                                                    { value: "reward", label: "Thưởng" },
                                                    { value: "penalty", label: "Phạt" },
                                                ]}
                                            />
                                        ) : (
                                            selectedItem.type === "reward" ? "Thưởng" : "Phạt"
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Cấp độ">
                                        {isEditing ? (
                                            <Select
                                                className="w-full"
                                                value={editedItem?.level}
                                                onChange={(v) => handleChange("level", v)}
                                                options={[
                                                    { value: 0, label: "Thấp" },
                                                    { value: 1, label: "Trung bình" },
                                                    { value: 2, label: "Cao" },
                                                ]}
                                            />
                                        ) : (
                                            selectedItem.level
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Hình thức">
                                        {isEditing ? (
                                            <>
                                                {/* <Input value={editedItem?.form} onChange={(e) => handleChange("form", e.target.value)} /> */}
                                                <Select
                                                    className="w-full"
                                                    value={editedItem?.form === "verbal_warning" ? "Cảnh cáo bằng lời nói" : editedItem?.form === "written_warning" ? "Cảnh cáo bằng văn bản" : editedItem?.form === "fine" ? "Phạt" : editedItem?.form === "suspension" ? "Đình chỉ" : editedItem?.form === "bonus" ? "Thưởng" : "Thăng chức"}
                                                    onChange={(v) => handleChange("form", v)}
                                                    options={[
                                                        { value: 0, label: "Cảnh cáo bằng lời nói" },
                                                        { value: 1, label: "Cảnh cáo bằng văn bản" },
                                                        { value: 2, label: "Phạt" },
                                                        { value: 3, label: "Đình chỉ" },
                                                        { value: 4, label: "Thưởng" },
                                                        { value: 5, label: "Thăng chức" },
                                                    ]}
                                                />
                                            </>
                                        ) : (
                                            selectedItem.form ?? selectedItem.form === "verbal_warning" ? "Cảnh cáo bằng lời nói" : selectedItem.form === "written_warning" ? "Cảnh cáo bằng văn bản" : selectedItem.form === "fine" ? "Phạt" : selectedItem.form === "suspension" ? "Đình chỉ" : selectedItem.form === "bonus" ? "Thưởng" : "Thăng chức"
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Số tiền mặc định">
                                        {isEditing ? (
                                            <>
                                                {/* <Input type="number" value={editedItem?.defaultAmount} onChange={(e) => handleChange("defaultAmount", Number(e.target.value))} /> */}
                                                <Select
                                                    className="w-full"
                                                    placeholder="Chọn mức lương cơ bản"
                                                    options={[1000000, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000].map((num) => ({
                                                        value: num,
                                                        label: `${num.toLocaleString("vi-VN")} đ`,
                                                    }))}
                                                    value={editedItem?.defaultAmount}
                                                    onChange={(value) => handleChange("defaultAmount", value)}
                                                    showSearch // cho phép gõ để lọc
                                                    optionFilterProp="label"
                                                    filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                    }
                                                />
                                            </>
                                        ) : (
                                            selectedItem.defaultAmount
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Mô tả">
                                        {isEditing ? (
                                            <Input.TextArea rows={3} value={editedItem?.description} onChange={(e) => handleChange("description", e.target.value)} />
                                        ) : (
                                            selectedItem.description
                                        )}
                                    </Descriptions.Item>
                                </Descriptions>

                                {isEditing && (
                                    <div className="flex justify-end mt-4">
                                        <Button type="default" icon={<Ban size={16} />} onClick={handleCancel}>Hủy</Button>
                                        <Button className="ml-4" type="primary" icon={<Check size={16} />} onClick={handleUpdate}>Cập nhật</Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>Chọn một mục để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* MODAL THÊM MỚI */}
            <Modal
                title="Thêm thưởng/phạt mới"
                open={isModalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleAdd}
                okText="Thêm"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Loại" name="type" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: 0, label: "Thưởng" },
                                { value: 1, label: "Phạt" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Cấp độ" name="level" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: 0, label: "Thấp" },
                                { value: 1, label: "Trung bình" },
                                { value: 2, label: "Cao" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Hình thức" name="form">
                        {/* <Input /> */}
                        <Select
                            className="w-full"
                            options={[
                                { value: 0, label: "Cảnh cáo bằng lời nói" },
                                { value: 1, label: "Cảnh cáo bằng văn bản" },
                                { value: 2, label: "Phạt" },
                                { value: 3, label: "Đình chỉ" },
                                { value: 4, label: "Thưởng" },
                                { value: 5, label: "Thăng chức" },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="Số tiền mặc định" name="defaultAmount">
                        {/* <Input type="number" /> */}
                        <Select
                            className="w-full"
                            placeholder="Chọn mức lương cơ bản"
                            options={[1000000, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000].map((num) => ({
                                value: num,
                                label: `${num.toLocaleString("vi-VN")} đ`,
                            }))}
                            showSearch // cho phép gõ để lọc
                            optionFilterProp="label"
                            filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
