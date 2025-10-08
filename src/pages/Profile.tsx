import React, { useState } from "react";
import { Table, Space, Tag, Button, Input, Avatar, Card, Descriptions, List, Typography, MenuProps, message, Dropdown, } from "antd";
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

const { Title } = Typography;

interface EmployeeData {
    key: string;
    code: string;
    full_name: string;
    position: string;
    department: string;
    probation_date: string;
    official_date: string;
    gender: string;
    avatar_url?: string;
}

// ================== DỮ LIỆU GIẢ ĐỂ TEST THOI ==================
const employees: EmployeeData[] = [
    {
        key: "1",
        code: "NV006180",
        full_name: "Nguyễn Hoàng Long",
        position: "Lập trình viên",
        department: "Dự án AMIS C&B",
        probation_date: "01/02/2021",
        official_date: "01/04/2021",
        gender: "Nam",
        avatar_url: "https://i.pravatar.cc/150?img=1",
    },
    {
        key: "2",
        code: "NV000500",
        full_name: "Nguyễn Thị Trang",
        position: "Nhân viên kiểm soát chất lượng",
        department: "Dự án QLBC.VN",
        probation_date: "16/02/2016",
        official_date: "16/04/2016",
        gender: "Nữ",
        avatar_url: "https://i.pravatar.cc/150?img=2",
    },
    {
        key: "3",
        code: "NV000759",
        full_name: "Võ Minh Chiến",
        position: "Nhân viên Kinh doanh Xúc tiến",
        department: "Nhóm KD HCSN 08",
        probation_date: "11/06/2019",
        official_date: "11/08/2019",
        gender: "Nam",
        avatar_url: "https://i.pravatar.cc/150?img=3",
    },
];

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
        render: (text: string, record: EmployeeData) => (
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
        title: "Ngày thử việc",
        dataIndex: "probation_date",
        key: "probation_date",
    },
    {
        title: "Ngày chính thức",
        dataIndex: "official_date",
        key: "official_date",
    },
    {
        title: "Giới tính",
        dataIndex: "gender",
        key: "gender",
    },
];

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    message.info('Click on left button.');
    console.log('click left button', e);
};

const handleMenuClick: MenuProps['onClick'] = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
};

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



// ================== COMPONENT CHÍNH ==================
const ProfilePage = () => {
    const [viewMode, setViewMode] = useState<"list" | "detail">("list");
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(
        null
    );

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

                    <Button iconPosition="end" type="primary" size={"large"} icon={<IconWrapper Icon={CirclePlus} color="#fff" />} >
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
            </div>

            {/* ===== VIEW CHÍNH ===== */}
            {
                viewMode === "list" ? (
                    <Table
                        columns={columns}
                        dataSource={employees}
                        pagination={{ total: 2388, pageSize: 50, showSizeChanger: false }}
                        scroll={{ x: 1100 }}
                        onRow={(record) => ({
                            onClick: () => {
                                setSelectedEmployee(record);
                                setViewMode("detail");
                            },
                        })}
                    />
                ) : (
                    <div style={{ display: "flex", gap: 16 }}>
                        {/* ==== DANH SÁCH BÊN TRÁI ==== */}
                        <Card
                            style={{ flex: "1 0 25%", maxWidth: 350, overflowY: "auto" }}
                            bodyStyle={{ padding: 8 }}
                        >
                            <List
                                dataSource={employees}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => setSelectedEmployee(item)}
                                        style={{
                                            cursor: "pointer",
                                            background:
                                                selectedEmployee?.key === item.key ? "#e6f4ff" : "transparent",
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
                                            {selectedEmployee.gender}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Vị trí công việc">
                                            {selectedEmployee.position}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Đơn vị công tác">
                                            {selectedEmployee.department}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày thử việc">
                                            {selectedEmployee.probation_date}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày chính thức">
                                            {selectedEmployee.official_date}
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
        </div >
    );
};

export default ProfilePage;
