import React, { useEffect, useState } from "react";
import { Table, Space, Tag, Button, Input, Avatar, Card, Descriptions, List, Typography, MenuProps, message, Dropdown, Pagination, } from "antd";
import {
    SearchOutlined,
    SettingOutlined,
    FilterOutlined,
    AppstoreOutlined,
    BarsOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { Funnel, Settings, List as LucideList, LayoutList, AlignJustify, PanelLeft, Search, CirclePlus, ListEnd, Ellipsis } from "lucide-react";
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

// ================== CỘT BẢNG NHÂN VIÊN ==================
const columns = [
    {
        title: "Mã nhân viên",
        dataIndex: "code",
        key: "code",
    },
    {
        title: "Họ và tên",
        dataIndex: "full_name",
        key: "full_name",
        render: (text: string, record: Employee) => (
            <Space>
                <Avatar src={record.avatar_url} />
                {text}
            </Space>
        ),
    },
    {
        title: "Vị trí công việc",
        dataIndex: "position",
        key: "position",
    },
    {
        title: "Đơn vị công tác",
        dataIndex: "department",
        key: "department",
    },
    {
        title: "Ngày vào làm",
        dataIndex: "hire_date",
        key: "hire_dateee",
        render: (value: string) => value ? dayjs(value).format("DD/MM/YYYY") : "-",
    },
    {
        title: "Tình trạng",
        dataIndex: "status",
        key: "status",
        render: (value: string) => value === "active" ? <Tag color="green">Đang làm việc</Tag> : <Tag color="red">Nghỉ việc</Tag>
    },
    {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
        render: (value: string) => {
            return value === "male" ? 'Nam' : value === "female" ? 'Nữ' : 'Khác'
        },
    },
];

const items = [
    {
        label: '1st menu item',
        key: '1',
        icon: <Button size="large" icon={<IconWrapper Icon={Funnel} />} />
        ,
    },
    {
        label: '2nd menu item',
        key: '2',
        icon: <Button size="large" icon={<IconWrapper Icon={Settings} />} />,
    },
    {
        label: '3rd menu item',
        key: '3',
        icon: <UserOutlined />,
        danger: true,
    },
    {
        label: '4rd menu item',
        key: '4',
        icon: <UserOutlined />,
        danger: true,
        disabled: true,
    },
];


const EmployeePage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
        null
    );

    const { employees, meta, fetchEmployees, setModalOpen, isModalOpen } = useEmployeeStore();

    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    useEffect(() => {
        fetchEmployees(currentPage, currentSize);
    }, [fetchEmployees, currentPage, currentSize]);

    const handlePageChange = (page: number, pageSize: number) => {
        setSearchParams({ page: page.toString(), pageSize: pageSize.toString() });
        fetchEmployees(page, pageSize);
    };

    //  Truyền header động vào layout chung
    const { setHeaderContent } = useOutletContext<HeaderOutletContextType>();

    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Tổng số nhân viên: <span>{meta?.total || 0}</span></h2>
            </div>
        );

        // cleanup: khi rời khỏi page thì clear header
        return () => setHeaderContent(null);
    }, [setHeaderContent]);

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
                    />
                    <Button className="ml-2.5" size="large" icon={<IconWrapper Icon={ListEnd} />} />
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

            {/* <EmployeeFilterPage /> */}

            {/* ===== VIEW CHÍNH ===== */}
            {
                viewMode === "list" ? (
                    <Table
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
                    //     },
                    // })}
                    />
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
                                            onClick={() => setSelectedEmployee(item)}
                                            style={{
                                                cursor: "pointer",
                                                background:
                                                    selectedEmployee?.id === item.id ? "#e6f4ff" : "transparent",
                                                borderRadius: 6,
                                                padding: 8,
                                            }}
                                        >
                                            <Space>
                                                <Avatar src={item.avatar_url} />
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.full_name}</div>
                                                    <div style={{ fontSize: 12, color: "#888" }}>{item.position}</div>
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
                                    <Title level={5}>
                                        {selectedEmployee.full_name} ({selectedEmployee.code})
                                    </Title>
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
                                            {selectedEmployee.gender === 'male' ? 'Nam' : selectedEmployee.gender === 'female' ? 'Nữ' : 'Khác'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Vị trí công việc">
                                            {selectedEmployee.position}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Đơn vị công tác">
                                            {selectedEmployee.department}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày vào làm">
                                            {selectedEmployee.hire_date ? dayjs(selectedEmployee.hire_date).format("DD/MM/YYYY") : "-"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tình trạng">
                                            {selectedEmployee.status === "active" ? <Tag color="green">Đang làm việc</Tag> : <Tag color="red">Nghỉ việc</Tag>}
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
                                            {selectedEmployee.dob ? dayjs(selectedEmployee.dob).format("DD/MM/YYYY") : "-"}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="CCCD">
                                            {selectedEmployee.cccd}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Email">
                                            {selectedEmployee.email}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="SĐT">
                                            {selectedEmployee.phone}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Địa chỉ">
                                            {selectedEmployee.address}
                                        </Descriptions.Item>
                                    </Descriptions>
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
