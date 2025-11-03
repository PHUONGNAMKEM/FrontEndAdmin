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
    Popconfirm,
    Modal,
    Form,
    notification,
    DatePicker,
    Avatar,
    Select,
    Radio,
    Tag,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EllipsisOutlined,
} from "@ant-design/icons";
import { AlignJustify, PanelLeft, Check, Ban, ListEnd } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useContractStore } from "src/stores/useContractStore";
import { Contract } from "src/types/contract/Contract";
import dayjs from "dayjs";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import ContractAdd from "./ContractAdd/ContractAdd";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";

const { Title } = Typography;

export const ContractPage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContract, setEditedContract] = useState<Contract | null>(null);


    const {
        contracts,
        meta,
        fetchContract,
        addContract,
        updateContract,
        deleteContract,
        isModalOpen,
        setModalOpen,
    } = useContractStore();

    const { employees, fetchEmployees, meta: metaEmployee } = useEmployeeStore();


    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Fetch data
    useEffect(() => {
        fetchContract(currentPage, currentSize);
        fetchEmployees(undefined, metaEmployee?.total);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        setSearchParams({
            current: current.toString(),
            pageSize: pageSize.toString(),
        });
    };

    // Header
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();
    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                    Tổng số hợp đồng: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    // ==================== CRUD ====================



    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedContract) setEditedContract({ ...selectedContract });
    };

    const handleChange = (field: keyof Contract, value: any) => {
        setEditedContract((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

    const handleCancel = () => {
        setIsEditing(!isEditing);
    }

    const handleUpdate = async () => {
        if (!editedContract || !selectedContract) return;

        const changedFields: Partial<Contract> = {};
        Object.entries(editedContract).forEach(([key, newValue]) => {
            const oldValue = selectedContract[key as keyof Contract];
            if (newValue !== oldValue && newValue !== undefined) {
                changedFields[key as keyof Contract] = newValue as any;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            message.info("Không có thay đổi nào để cập nhật.");
            return;
        }

        try {
            await updateContract!(selectedContract.id!, changedFields);
            notification.success({ message: "Cập nhật hợp đồng thành công!" });
            setSelectedContract((prev) => (prev ? { ...prev, ...changedFields } : prev));
            setIsEditing(false);
            fetchContract(currentPage, currentSize);
        } catch (err: any) {
            console.error("Update contract failed:", err);
            notification.error({
                message: "Cập nhật hợp đồng thất bại!",
                description: err?.message || "Vui lòng thử lại.",
            });
        }
    };

    const confirmDelete = async () => {
        if (!selectedContract?.id) return;
        try {
            await deleteContract!(selectedContract.id);
            notification.success({ message: "Xóa hợp đồng thành công!" });
            setSelectedContract(null);
            fetchContract(currentPage, currentSize);
        } catch (err: any) {
            console.error("Delete contract failed:", err);
            notification.error({
                message: "Xóa hợp đồng thất bại!",
                description: err?.message || "Vui lòng thử lại.",
            });
        }
    };

    // ==================== TABLE ====================

    const columns = [
        {
            title: "Mã hợp đồng",
            dataIndex: "contractNumber",
            key: "contractNumber",
        },
        {
            title: "Tiêu đề",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "Tên nhân viên",
            dataIndex: "employeeName",
            key: "employeeName",
        },
        {
            title: "Lương cơ bản",
            dataIndex: "basicSalary",
            key: "basicSalary",
            render: (value: number) => value?.toLocaleString("vi-VN") + " đ",
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "endDate",
            key: "endDate",
            render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value: number) => value === 0 ? <Tag color="green">Hiệu lực</Tag> : value === 1 ? <Tag color="red">Hết hạn</Tag> : value === 2 ? <Tag color="volcano">Đã chấm dứt</Tag> : <Tag color="blue">Bản nháp</Tag>

        },
    ];

    const handleChangeItem = (item: Contract) => {
        setSelectedContract(item);
        setEditedContract(null);
        setIsEditing(false);
    };

    // Employee Options để bỏ vào option trong Select input
    const employeeOptions = employees
        .filter(
            (emp) =>
                emp.positionId === "BC7665FF-1AC1-4B12-8886-418330DD06C7" ||
                emp.positionId === "B93A0EEF-7E77-411D-A903-6CCFE63E9B92" ||
                emp.positionName! === "Giám đốc điều hành" ||
                emp.positionName! === "Phó giám đốc"
        )
        .map((emp) => ({
            value: emp.id,
            label: emp.fullName,
            email: emp.email,
            avatarUrl: emp.avatarUrl,
        }));

    // Hàm lọc ra những nhân viên sắp hết hạn hợp đồng trong vòng 30 ngày
    const handleFilterExpire30 = () => {

    }

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== TOOLBAR ===== */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                    alignItems: "center",
                }}
            >
                <div className="flex items-center">
                    <Input
                        placeholder="Tìm kiếm hợp đồng..."
                        prefix={<SearchOutlined />}
                        style={{ width: 280, marginRight: "20px" }}
                    />
                    {/* <Radio onChange={}>Những hợp đồng sắp hết hạn trong 30 ngày</Radio> */}
                </div>

                <Space>
                    <Button
                        size="large"
                        type={viewMode === "list" ? "primary" : "default"}
                        icon={<AlignJustify size={16} />}
                        onClick={() => setViewMode("list")}
                    />
                    <Button
                        size="large"
                        type={viewMode === "detail" ? "primary" : "default"}
                        icon={<PanelLeft size={16} />}
                        onClick={() => setViewMode("detail")}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setModalOpen(true)}
                    >
                        Thêm hợp đồng
                    </Button>
                    <Dropdown
                        menu={{
                            items: [
                                { key: "1", label: "Những hợp đồng sẽ hết hạn sau 30 ngày" },
                                { key: "2", label: "Xuất Excel" },
                                { key: "3", label: "Báo cáo" },
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
                    dataSource={contracts}
                    rowKey="id"
                    pagination={{
                        current: meta?.current || 1,
                        pageSize: meta?.pageSize || 10,
                        total: meta?.total || 0,
                        onChange: handlePageChange,
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedContract(record);
                            setViewMode("detail");
                        },
                    })}
                />
            ) : (
                <div style={{ display: "flex", gap: 16 }}>
                    {/* DANH SÁCH BÊN TRÁI */}
                    <Card
                        style={{ flex: "1 0 5%", minWidth: 320 }}
                        bodyStyle={{ padding: 8 }}
                    >
                        <List
                            dataSource={contracts}
                            renderItem={(item: Contract) => (
                                <List.Item
                                    onClick={() => handleChangeItem(item)}
                                    style={{
                                        cursor: "pointer",
                                        background:
                                            selectedContract?.id === item.id
                                                ? "#e6f4ff"
                                                : "transparent",
                                        borderRadius: 6,
                                        padding: 8,
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {item.contractNumber}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "#888",
                                            }}
                                        >
                                            {item.employeeName}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>

                    {/* CHI TIẾT BÊN PHẢI */}
                    <Card style={{ flex: 1 }}>
                        {selectedContract ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <Title level={4} style={{
                                        margin: 0, flex: 1,
                                    }}
                                    >
                                        {isEditing ? (
                                            <Input
                                                value={editedContract?.title}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "title",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : <div
                                            style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "normal",
                                            }}
                                        >
                                            {selectedContract.title}
                                        </div>}
                                    </Title>
                                    <Space>
                                        <Button
                                            type="text"
                                            icon={<EditOutlined />}
                                            onClick={handleEditToggle}
                                        />
                                        <Popconfirm
                                            title="Xóa hợp đồng"
                                            description="Bạn chắc chắn muốn chấm dứt hợp đồng này?"
                                            onConfirm={confirmDelete}
                                        >
                                            <Button
                                                danger
                                                iconPosition="end"
                                                icon={<DeleteOutlined />}
                                            >
                                                Chấm dứt hợp đồng
                                            </Button>
                                        </Popconfirm>
                                    </Space>
                                </div>

                                <Descriptions bordered column={1} size="middle">
                                    <Descriptions.Item label="Mã hợp đồng">
                                        {selectedContract.contractNumber}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Loại hợp đồng">
                                        {isEditing ? (
                                            // <Input.TextArea
                                            //     value={editedDept?.managerName}
                                            //     onChange={(e) =>
                                            //         handleChange(
                                            //             "description",
                                            //             e.target.value
                                            //         )
                                            //     }
                                            // />
                                            <Select
                                                value={editedContract?.type}
                                                className="w-full"
                                                placeholder="Chọn người đại diện"
                                                options={employeeOptions}
                                                showSearch // cho phép gõ để lọc
                                                optionFilterProp="label"
                                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                }
                                                optionRender={(option) =>
                                                (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar src={option.data.avatarUrl} />
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{option.data.label}</div>
                                                            <div style={{ fontSize: 12, color: "#888" }}>{option.data.email}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                onChange={(value) => handleChange("representativeUserName", value)}
                                            />
                                        ) : (
                                            selectedContract.type === 0 ? "Full-Time" : selectedContract.type === 1 ? "Part-Time" : selectedContract.type === 2 ? "Thực tập" : selectedContract.type === 3 ? "Thử việc" : selectedContract.type === 4 ? "Có thời hạn" : "Thời vụ"
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Tên nhân viên">
                                        {isEditing ? (
                                            <Input
                                                value={editedContract?.employeeName}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "employeeName",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        ) : (
                                            selectedContract.employeeName
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ngày ký">
                                        {/* {isEditing ? (
                                            <DatePicker
                                                value={dayjs(
                                                    editedContract?.signedDate
                                                )}
                                                onChange={(date) =>
                                                    handleChange(
                                                        "signedDate",
                                                        date?.toISOString()
                                                    )
                                                }
                                                format="DD/MM/YYYY"
                                            />
                                        ) : (
                                            dayjs(
                                                selectedContract.signedDate
                                            ).format("DD/MM/YYYY")
                                        )} */}
                                        {dayjs(selectedContract.signedDate).format("DD/MM/YYYY")}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ngày bắt đầu">
                                        {dayjs(selectedContract.startDate).format("DD/MM/YYYY")}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ngày kết thúc">
                                        {isEditing ? (
                                            <DatePicker
                                                value={dayjs(editedContract?.endDate)}
                                                onChange={(date) =>
                                                    handleChange("endDate", date ? date.format("YYYY-MM-DD") : dayjs().add(1, "day").format("YYYY-MM-DD")) // nếu không điền thì lấy
                                                }
                                                format="DD/MM/YYYY"
                                            />
                                        ) : (
                                            dayjs(selectedContract.endDate).format("DD/MM/YYYY")
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Lương cơ bản">
                                        {/* {selectedContract.basicSalary.toLocaleString(
                                            "vi-VN"
                                        )}{" "}
                                        đ */}
                                        {isEditing ? (
                                            <Select
                                                className="w-full"
                                                placeholder="Chọn mức lương cơ bản"
                                                options={[1000000, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000].map((num) => ({
                                                    value: num,
                                                    label: `${num.toLocaleString("vi-VN")} đ`,
                                                }))}
                                                value={editedContract?.basicSalary}
                                                onChange={(value) => handleChange("basicSalary", value)}
                                                showSearch // cho phép gõ để lọc
                                                optionFilterProp="label"
                                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                }
                                            />
                                        ) : (
                                            selectedContract.basicSalary || "—"
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Người đại diện">
                                        {isEditing ? (
                                            // <Input.TextArea
                                            //     value={editedDept?.managerName}
                                            //     onChange={(e) =>
                                            //         handleChange(
                                            //             "description",
                                            //             e.target.value
                                            //         )
                                            //     }
                                            // />
                                            <Select
                                                value={editedContract?.representativeUserName}
                                                className="w-full"
                                                placeholder="Chọn người đại diện"
                                                options={employeeOptions}
                                                showSearch // cho phép gõ để lọc
                                                optionFilterProp="label"
                                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                }
                                                optionRender={(option) =>
                                                (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar src={option.data.avatarUrl} />
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{option.data.label}</div>
                                                            <div style={{ fontSize: 12, color: "#888" }}>{option.data.email}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                onChange={(value) => handleChange("representativeUserName", value)}
                                            />
                                        ) : (
                                            selectedContract.representativeUserName || "—"
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Ghi chú">
                                        {isEditing ? (
                                            <Input.TextArea
                                                value={editedContract?.notes}
                                                onChange={(e) =>
                                                    handleChange(
                                                        "notes",
                                                        e.target.value
                                                    )
                                                }
                                                rows={3}
                                            />
                                        ) : (
                                            selectedContract.notes
                                        )}
                                    </Descriptions.Item>

                                    <Descriptions.Item label="Trạng thái">
                                        {isEditing ? (
                                            // <Input.TextArea
                                            //     value={editedContract?.status}
                                            //     onChange={(e) =>
                                            //         handleChange(
                                            //             "notes",
                                            //             e.target.value
                                            //         )
                                            //     }
                                            //     rows={3}
                                            // />
                                            <Select
                                                value={editedContract?.status}
                                                onChange={(value) => handleChange("status", value)}
                                                style={{ width: "100%" }}
                                            >
                                                <Select.Option value={0}>Đang có hiệu lực</Select.Option>
                                                <Select.Option value={1}>Hết hạn</Select.Option>
                                                <Select.Option value={2}>Đã chấm dứt</Select.Option>
                                                <Select.Option value={3}>Bản nháp</Select.Option>
                                            </Select>


                                        ) : (
                                            selectedContract.status === 0 ? <Tag color="green">Đang có hiệu lực</Tag> : selectedContract.status === 1 ? <Tag color="red">Hết hạn</Tag> : selectedContract.status === 2 ? <Tag color="volcano">Đã chấm dứt</Tag> : <Tag color="blue">Bản nháp</Tag>
                                        )}
                                    </Descriptions.Item>
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
                            <p>Chọn một hợp đồng để xem chi tiết.</p>
                        )}
                    </Card>
                </div>
            )}

            {/* MODAL THÊM MỚI */}
            {isModalOpen && <ContractAdd />}
        </div>
    );
};
