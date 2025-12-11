import React, { useEffect, useState } from "react";
import { Table, Space, Tag, Button, Input, Avatar, Card, Descriptions, List, Typography, MenuProps, message, Dropdown, Pagination, DatePicker, Select, Popconfirm, PopconfirmProps, Upload, UploadFile, Modal, Image, notification, } from "antd";
import {
    SearchOutlined,
    SettingOutlined,
    FilterOutlined,
    AppstoreOutlined,
    BarsOutlined,
    UserOutlined,
    AntDesignOutlined,
    FileDoneOutlined,
} from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { Funnel, Settings, List as LucideList, LayoutList, AlignJustify, PanelLeft, Search, CirclePlus, ListEnd, Ellipsis, Edit3, Check, Delete, Trash, Ban, FileDown, Download } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { Employee } from "src/types/employee/Employee";
import dayjs from "dayjs";
import { render } from "react-dom";
const { Title } = Typography;
import { useSearchParams } from "react-router-dom";
import EmployeeAdd from "./EmployeeAdd/EmployeeAdd";
import { EmployeeFilterPage } from "./EmployeeFilter/EmployeeFilterPage";
import { useDepartmentStore } from "src/stores/useDepartmentStore";
import { usePositionStore } from "src/stores/usePositionStore";
import { RcFile, UploadProps } from "antd/es/upload";
import { usePDFStore } from "src/stores/report/pdf";
import { useExcelStore } from "src/stores/report/excel";

// ================== CỘT BẢNG NHÂN VIÊN ==================
const columns = [
    {
        title: "Mã nhân viên",
        dataIndex: "code",
        key: "code",
    },
    {
        title: "Họ và tên",
        dataIndex: "fullName",
        key: "fullName",
        render: (text: string, record: Employee) => (
            <Space>
                <Avatar src={record.avatarUrl} />
                {text}
            </Space>
        ),
    },
    {
        title: "Vị trí công việc",
        dataIndex: "positionName",
        key: "positionName",
    },
    {
        title: "Đơn vị công tác",
        dataIndex: "departmentName",
        key: "departmentName",
    },
    {
        title: "Ngày vào làm",
        dataIndex: "hireDate",
        key: "hireDate",
        render: (value: string) => value ? dayjs(value).format("DD/MM/YYYY") : "-",
    },
    {
        title: "Tình trạng",
        dataIndex: "status",
        key: "status",
        render: (value: number) => value === 0 ? <Tag color="green">Đang làm việc</Tag> : <Tag color="red">Nghỉ việc</Tag>
    },
    {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        render: (value: number) => {
            return value === 1 ? 'Nam' : value === 0 ? 'Nữ' : 'Khác'
        },
    },
];




const EmployeePage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const { employees, meta, fetchEmployees, fetchFilteredEmployees, filters, setModalOpen, isModalOpen, updateEmployee, deleteEmployee } = useEmployeeStore();

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Logic upload file
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewImage, setPreviewImage] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    const handleChangeFile: UploadProps["onChange"] = ({ fileList: newList }) => {
        setFileList(newList);
    };

    useEffect(() => {
        // fetchEmployees(currentPage, currentSize);
        if (Object.keys(filters || {}).length > 0) {
            // đang có filter → gọi API lọc
            fetchFilteredEmployees!(filters, currentPage, currentSize);
        } else {
            // không có filter → gọi API toàn bộ
            fetchEmployees(currentPage, currentSize);
        }
        fetchDepartment(undefined, metaDepartment?.total);
        fetchPosition(undefined, metaPosition?.total);
    }, [currentPage, currentSize]);

    const handlePageChange = (current: number, pageSize: number) => {
        console.log(">>> check current:", current);
        console.log(">>> check pageSize:", pageSize);
        setSearchParams({ current: current.toString(), pageSize: pageSize.toString() });
    };

    //  Truyền header động vào layout chung
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();

    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--text-color)]">Tổng số nhân viên: <span>{meta?.total || 0}</span></h2>
            </div>
        );

        // cleanup: khi rời khỏi page thì clear header
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    // Update selectedEmployee khi employees thay đổi, cho view Detail bên phải thay đổi
    useEffect(() => {
        if (selectedEmployee) {
            const updated = employees.find(p => p.id === selectedEmployee.id);
            if (updated) {
                setSelectedEmployee(updated);
            }
        }
    }, [employees]);

    // Logic filter Open
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Logic editing Employee
    const [isEditing, setIsEditing] = useState(false);
    const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (selectedEmployee) setEditedEmployee({ ...selectedEmployee });
    };

    const handleChange = (field: keyof Employee, value: any) => {
        setEditedEmployee((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleCancel = () => {
        setIsEditing(!isEditing);
    }

    // const handleUpdate = async () => {
    //     if (!editedEmployee || !selectedEmployee) return;
    //     const changedFields: Partial<Employee> = {};
    //     Object.entries(editedEmployee).forEach(([key, newValue]) => { // Object.entires trả về mảng chứa các cặp [key, value]
    //         const oldValue = selectedEmployee[key as keyof Employee];

    //         // Nếu giá trị mới khác giá trị cũ và không undefined => thêm vào payload
    //         if (newValue !== oldValue && newValue !== undefined) {
    //             changedFields[key as keyof Employee] = newValue as any;
    //         }
    //     });

    //     if (Object.keys(changedFields).length === 0) { // Object.keys trả về mảng -> .length
    //         message.info("Không có thay đổi nào để cập nhật.");
    //         return;
    //     }

    //     console.log(">>> Gửi payload:", changedFields);

    //     await updateEmployee!(selectedEmployee.id!, changedFields);
    //     message.success("Cập nhật nhân viên thành công!");

    //     setSelectedEmployee((prev) => prev ? { ...prev, ...changedFields } : prev);  // cập nhật giao diện bên phải chi tiết nhân viên
    //     await fetchEmployees!(currentPage, currentSize); // chỗ này nè
    //     setIsEditing(false);
    // };

    // Reset form khi click đổi nhân viên

    const handleUpdate = async () => {
        if (!editedEmployee || !selectedEmployee) return;

        const formData = new FormData();

        if (fileList.length > 0) {
            const file = fileList[0].originFileObj as RcFile;
            formData.append("avatarFile", file);
            const previewUrl = URL.createObjectURL(file);
            setSelectedEmployee(prev =>
                prev ? { ...prev, avatarUrl: previewUrl } : prev
            );
        }

        Object.entries(editedEmployee).forEach(([key, value]) => {
            const oldValue = selectedEmployee[key as keyof Employee];
            if (value !== oldValue && value !== undefined && value !== null) {
                if (key === "dob" || key === "hireDate") {
                    // chuẩn hóa format ngày
                    formData.append(key, dayjs(value).format("YYYY-MM-DD"));
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        if ([...formData.entries()].length === 0) {
            message.info("Không có thay đổi nào để cập nhật");
            return;
        }

        try {
            const updated = await updateEmployee!(selectedEmployee.id!, formData as any);
            message.success("Cập nhật nhân viên thành công!");

            console.log(">>> updated:", updated);

            // const newAvatarUrl = updated?.avatarUrl
            //     ? `${updated.avatarUrl}?t=${Date.now()}`
            //     : selectedEmployee.avatarUrl;

            // setSelectedEmployee(prev =>
            //     prev ? { ...prev, ...editedEmployee, avatarUrl: newAvatarUrl } : prev
            // );

            // setEditedEmployee(prev =>
            //     prev ? { ...prev, avatarUrl: newAvatarUrl } : prev
            // );
            setSelectedEmployee(prev =>
                prev
                    ? {
                        ...prev,
                        ...editedEmployee,
                        avatarUrl: prev.avatarUrl, // giữ nguyên avatar cũ
                    }
                    : prev
            );

            setFileList([]);
            setIsEditing(false);
            await fetchEmployees!(currentPage, currentSize);
        } catch (err) {
            console.error(err);
            message.error("Cập nhật thất bại");
        }
    };

    const handleChangeItem = (selectedEmployee: Employee) => {
        if (selectedEmployee) {
            setSelectedEmployee(selectedEmployee);
            setEditedEmployee({ ...selectedEmployee });
            setIsEditing(false); // tắt chế độ edit nếu đang bật
        } else {
            setEditedEmployee(null);
        }
    }

    const confirmDelete: PopconfirmProps['onConfirm'] = async (e) => {
        // await deleteEmployee!(selectedEmployee?.id!);
        // setSelectedEmployee(null);
        if (!selectedEmployee?.id) return;

        try {
            await deleteEmployee!(selectedEmployee.id);
            notification.success({ message: "Xóa nhân viên thành công" });
            setSelectedEmployee(null);
        } catch (err: any) {
            // Lấy message từ Error hoặc từ backend
            const backendMsg =
                err?.message ||
                err?.response?.data?.message ||
                "Không thể xoá nhân viên (có thể đang được tham chiếu ở bảng khác).";

            notification.error({ message: backendMsg });
        }
    };

    const cancelDelete: PopconfirmProps['onCancel'] = (e) => {
        message.error('Click on No');
    };

    const { fetchDepartment, departments, meta: metaDepartment } = useDepartmentStore();
    const { fetchPosition, positions, meta: metaPosition } = usePositionStore();

    // Department Options để bỏ vào option trong Select input
    const departmentOptions = departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
    }));

    // Position Options để bỏ vào option trong Select input
    const positionOptions = positions.map((dept) => ({
        value: dept.id,
        label: dept.name,
    }));

    // Tải hồ sơ nhân viên PDF
    const { downloadProfileEmployee } = usePDFStore();

    // Tải báo cáo nhân viên dạng excel
    const { downloadEmployeesReport } = useExcelStore();

    const items = [
        {
            label: 'Xuất ra file Excel',
            key: '1',
            icon: <IconWrapper Icon={FileDown} />,
            onClick: ({ domEvent }: any) => {
                domEvent.stopPropagation();
                downloadEmployeesReport();
            },
        },
        // {
        //     label: '2nd menu item',
        //     key: '2',
        //     icon: <Button size="large" icon={<IconWrapper Icon={Settings} />} />,
        // },
        // {
        //     label: '3rd menu item',
        //     key: '3',
        //     icon: <UserOutlined />,
        //     danger: true,
        // },
        // {
        //     label: '4rd menu item',
        //     key: '4',
        //     icon: <UserOutlined />,
        //     danger: true,
        //     disabled: true,
        // },
    ];
    const [searchText, setSearchText] = useState("");
    const handleSearch = () => {
        fetchEmployees(1, currentSize, searchText);
        setSearchParams({
            current: "1",
            pageSize: String(currentSize),
            q: searchText
        });
    };

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            {/* ===== HEADER TOOLBAR ===== */}
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
                        placeholder="Tìm kiếm theo tên, mã, phòng ban..."
                        prefix={<IconWrapper Icon={Search} />}
                        style={{ width: 300 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                    <Button
                        className="ml-2.5"
                        size="large"
                        icon={<IconWrapper Icon={ListEnd} />}
                        onClick={() => {
                            setIsFilterOpen((prev) => !prev);
                        }}
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

                    <Button iconPosition="end" type="primary" size={"large"} icon={<IconWrapper Icon={CirclePlus} color="#fff" />} onClick={() => setModalOpen(true)}>
                        <span className="ml-1.5">Thêm</span>
                    </Button>

                    <Dropdown menu={{ items }} placement="bottomRight" arrow>
                        <Button
                            size="large"
                            icon={<IconWrapper Icon={Ellipsis} />}
                            type="default"
                        />
                    </Dropdown>
                </Space>
            </div >

            {/* ===== VIEW CHÍNH ===== */}
            {
                viewMode === "list" ? (
                    <div className="flex">
                        <Table
                            className={"flex-1 border border-[#eee] rounded-t-lg rounded-b-lg"}
                            columns={columns}
                            dataSource={employees}
                            pagination={{
                                current: meta?.current || 1,
                                pageSize: meta?.pageSize || 10,
                                total: meta?.total || 0,
                                showSizeChanger: true,
                                onChange: handlePageChange,
                            }}
                            scroll={{ x: 1100 }}
                        // onRow={(record) => ({
                        //     onClick: () => {
                        //         setSelectedEmployee(record);
                        //         setViewMode("detail");
                        //         handleChangeItem(record);
                        //     },
                        // })}
                        />
                        {isFilterOpen && <EmployeeFilterPage />}
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: 16 }}>
                        <div className="flex flex-col">
                            {/* ==== DANH SÁCH BÊN TRÁI ==== */}
                            <Card
                                style={{ flex: "1 0 25%", minWidth: 350, overflowY: "auto" }}
                                bodyStyle={{ padding: 8 }}
                            >
                                <List
                                    dataSource={employees}
                                    renderItem={(item: Employee) => (
                                        <List.Item
                                            onClick={() => handleChangeItem(item)}
                                            // onClick={() => setSelectedEmployee(item)}
                                            style={{
                                                cursor: "pointer",
                                                background:
                                                    selectedEmployee?.id === item.id ? "#e6f4ff" : "transparent",
                                                borderRadius: 6,
                                                padding: 8,
                                            }}
                                        >
                                            <Space>
                                                <Avatar src={item.avatarUrl} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.fullName}</div>
                                                    <div style={{ fontSize: 12, color: "#888" }}>{item.positionName}</div>
                                                </div>
                                            </Space>
                                        </List.Item>
                                    )}

                                />
                            </Card>
                            <div style={{ marginTop: 16, textAlign: "center" }}>
                                <Pagination
                                    current={meta?.current}
                                    total={meta?.total}
                                    pageSize={meta?.pageSize}
                                    onChange={handlePageChange}
                                />
                            </div>
                        </div>

                        {/* ==== VIEW BÊN PHẢI HIỂN THỊ CHI TIẾT NHÂN VIÊN ==== */}
                        <Card style={{ flex: 1 }}>
                            {selectedEmployee ? (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center avatar-user-display">
                                            {/* <Avatar
                                                src={selectedEmployee.avatarUrl}
                                                size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                                                // icon={<AntDesignOutlined />}
                                                className="!mr-4 border-2 border-blue-500 shadow-md"
                                            /> */}
                                            {isEditing ? (
                                                <>
                                                    <Avatar
                                                        src={editedEmployee?.avatarUrl}
                                                        size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                                                        className="!mr-4 border-2 border-blue-500 shadow-md"
                                                    />
                                                    <div className="mr-4">
                                                        <Upload
                                                            listType="picture-card"
                                                            fileList={fileList}
                                                            onPreview={handlePreview}
                                                            onChange={handleChangeFile}
                                                            beforeUpload={() => false}
                                                        >
                                                            {fileList.length >= 1 ? null : (
                                                                <div>
                                                                    <span>Thay ảnh</span>
                                                                </div>
                                                            )}
                                                        </Upload>
                                                    </div>
                                                </>
                                            )
                                                : <Avatar
                                                    src={selectedEmployee.avatarUrl}
                                                    size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                                                    className="!mr-4 border-2 border-blue-500 shadow-md"
                                                />
                                            }

                                            <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
                                                <Image alt="preview" src={previewImage} style={{ width: "100%" }} />
                                            </Modal>

                                            <Title level={5} style={{ margin: 0 }}>
                                                {
                                                    isEditing ? (
                                                        <Input
                                                            value={editedEmployee?.fullName}
                                                            onChange={(e) => handleChange("fullName", e.target.value)}
                                                        />
                                                    ) : (selectedEmployee.fullName)

                                                } ({selectedEmployee.code})
                                            </Title>
                                        </div>
                                        <Space>

                                            {/* <Button
                                                type="text"
                                                icon={<Edit3 size={18} />}
                                                onClick={handleEditToggle}
                                            /> */}
                                            <Button
                                                type="text"
                                                icon={<IconWrapper Icon={Edit3} />}
                                                onClick={handleEditToggle}
                                            />

                                            <Popconfirm
                                                title="Delete A Employee"
                                                description="Bạn có chắc chắn muốn xóa nhân viên này?"
                                                onConfirm={confirmDelete}
                                                onCancel={cancelDelete}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button danger>Xóa</Button>
                                            </Popconfirm>

                                            <Button
                                                icon={<IconWrapper Icon={Download} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadProfileEmployee(selectedEmployee.id!);
                                                }}
                                            >
                                                PDF
                                            </Button>

                                        </Space>
                                    </div>
                                    <Descriptions
                                        bordered
                                        column={2}
                                        size="middle"
                                        labelStyle={{ fontWeight: 500 }}
                                    >
                                        <Descriptions.Item label="Mã nhân viên">
                                            {selectedEmployee.code}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Giới tính">
                                            {
                                                isEditing ? (
                                                    <Select
                                                        value={editedEmployee?.gender}
                                                        onChange={(value) => handleChange("gender", value)}
                                                        style={{ width: "100%" }}
                                                    >
                                                        <Select.Option value={1}>Nam</Select.Option>
                                                        <Select.Option value={0}>Nữ</Select.Option>
                                                        <Select.Option value={2}>Khác</Select.Option>
                                                    </Select>
                                                ) : (
                                                    selectedEmployee.gender === 1 ? 'Nam' : selectedEmployee.gender === 0 ? 'Nữ' : 'Khác'
                                                )
                                            }
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Vị trí công việc">
                                            {isEditing ? (
                                                // <Input
                                                //     value={editedEmployee?.positionName}
                                                //     onChange={(e) => handleChange("positionName", e.target.value)}
                                                // />
                                                <Select
                                                    className="w-full"
                                                    value={editedEmployee?.positionName}
                                                    placeholder="Chọn vị trí"
                                                    options={positionOptions}
                                                    showSearch // cho phép gõ để lọc
                                                    optionFilterProp="label"
                                                    filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    onChange={(value, option) => {
                                                        handleChange("positionId", value);
                                                        let optionLabel = (option as { value: string; label: string })?.label
                                                        handleChange("positionName", optionLabel);
                                                    }}
                                                />
                                            ) : (
                                                selectedEmployee.positionName || "Trống"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Đơn vị công tác">
                                            {isEditing ? (
                                                // <Input
                                                //     value={editedEmployee?.departmentName}
                                                //     onChange={(e) => handleChange("departmentName", e.target.value)}
                                                // />
                                                <Select
                                                    className="w-full"
                                                    value={editedEmployee?.departmentName}
                                                    placeholder="Chọn phòng ban"
                                                    options={departmentOptions}
                                                    showSearch // cho phép gõ để lọc
                                                    optionFilterProp="label"
                                                    filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                                        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                                    }
                                                    onChange={(value, option) => {
                                                        handleChange("departmentId", value);
                                                        let optionLabel = (option as { value: string; label: string })?.label
                                                        handleChange("departmentName", optionLabel);
                                                    }}
                                                />
                                            ) : (
                                                selectedEmployee.departmentName || "Chưa được phân công"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày vào làm">
                                            {isEditing ? (
                                                <DatePicker
                                                    value={editedEmployee?.hireDate ? dayjs(editedEmployee.hireDate) : dayjs()}
                                                    onChange={(date) =>
                                                        handleChange("hireDate", date ? dayjs(date).format("YYYY-MM-DD") : null)
                                                    }
                                                    format="YYYY/MM/DD"
                                                />
                                            ) : (
                                                selectedEmployee.hireDate ? dayjs(selectedEmployee.hireDate).format("DD/MM/YYYY") : "-"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tình trạng">
                                            {isEditing ? (
                                                <Select
                                                    value={editedEmployee?.status}
                                                    onChange={(value) => handleChange("status", value)}
                                                    style={{ width: "100%" }}
                                                >
                                                    <Select.Option value={0}>Đang làm việc</Select.Option>
                                                    <Select.Option value={1}>Nghỉ việc</Select.Option>
                                                </Select>
                                            ) : (selectedEmployee.status === 0 ? <Tag color="green">Đang làm việc</Tag> : <Tag color="red">Nghỉ việc</Tag>)}

                                        </Descriptions.Item>
                                    </Descriptions>

                                    <Title level={5}>
                                        <p className="mt-4 mb-4">Thông tin cá nhân</p>
                                    </Title>

                                    <Descriptions
                                        bordered
                                        column={1}
                                        size="middle"
                                        labelStyle={{ fontWeight: 500 }}
                                    >
                                        <Descriptions.Item label="Ngày sinh">
                                            {isEditing ? (
                                                <DatePicker
                                                    value={editedEmployee?.dob ? dayjs(editedEmployee?.dob) : null}
                                                    onChange={(date) =>
                                                        handleChange("dob", date ? dayjs(date).format("YYYY-MM-DD") : "")
                                                    }
                                                    format="YYYY/MM/DD"
                                                />
                                            ) : (
                                                selectedEmployee.dob ? dayjs(selectedEmployee.dob).format("DD/MM/YYYY") : "-"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="CCCD">
                                            {isEditing ? (
                                                <Input
                                                    value={editedEmployee?.cccd}
                                                    onChange={(e) => handleChange("cccd", e.target.value)}
                                                />
                                            ) : (
                                                selectedEmployee.cccd || "-"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Email">
                                            {isEditing ? (
                                                <Input
                                                    value={editedEmployee?.email}
                                                    onChange={(e) => handleChange("email", e.target.value)}
                                                />
                                            ) : (
                                                selectedEmployee.email
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="SĐT">
                                            {isEditing ? (
                                                <Input
                                                    value={editedEmployee?.phone}
                                                    onChange={(e) => handleChange("phone", e.target.value)}
                                                />
                                            ) : (
                                                selectedEmployee.phone || "-"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Địa chỉ">
                                            {isEditing ? (
                                                <Input.TextArea
                                                    value={editedEmployee?.address}
                                                    onChange={(e) => handleChange("address", e.target.value)}
                                                />
                                            ) : (
                                                selectedEmployee.address || "-"
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
                                <p>Chọn một nhân viên để xem chi tiết hồ sơ.</p>
                            )}
                        </Card>
                    </div>
                )
            }
            {isModalOpen && <EmployeeAdd />}
        </div >
    );
};

export default EmployeePage;
