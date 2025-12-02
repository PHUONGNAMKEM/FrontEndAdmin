import React, { useEffect } from "react";
import { Table, Space, Button, Input, Dropdown, Typography, Tag } from "antd";
import { SearchOutlined, EllipsisOutlined } from "@ant-design/icons";
import { AlignJustify, PanelLeft, RefreshCcw } from "lucide-react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { HeaderOutletContextType } from "src/types/layout/HeaderOutletContextType";
import { useContractStore } from "src/stores/useContractStore";
import dayjs from "dayjs";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";

const { Title } = Typography;

export const ContractExpiresPage = () => {
    const {
        contractExpires, //dữ liệu lấy từ store (đã set ở fetchContractExpires)
        meta,
        fetchContractExpires,
    } = useContractStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    // Gọi API lấy danh sách hợp đồng sắp hết hạn (30 ngày)
    useEffect(() => {
        fetchContractExpires(currentPage, currentSize, 30);
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
                <h2 className="text-xl font-bold text-[var(--text-color)]">
                    Tổng số hợp đồng sắp hết hạn: <span>{meta?.total || 0}</span>
                </h2>
            </div>
        );
        return () => setHeaderContent(null);
    }, [setHeaderContent, meta?.total]);

    // ==================== TABLE COLUMNS ====================
    const columns = [
        {
            title: "Tên nhân viên",
            dataIndex: "employee_name",
            key: "employee_name",
        },
        {
            title: "Mã hợp đồng",
            dataIndex: "contract_number",
            key: "contract_number",
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "end_date",
            key: "end_date",
            render: (text: string) => dayjs(text).format("DD/MM/YYYY"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value: string) => {
                const colorMap: Record<string, string> = {
                    active: "green",
                    expired: "red",
                    pending: "orange",
                };
                const textMap: Record<string, string> = {
                    active: "Hiệu lực",
                    expired: "Hết hạn",
                    pending: "Chờ xử lý",
                };
                return (
                    <Tag color={colorMap[value]}>{textMap[value] || value}</Tag>
                );
            },
        },
    ];

    // ==================== UI ====================
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
                </div>

                <Space>
                    <Button
                        size="large"
                        type="primary"
                        icon={<RefreshCcw size={16} />}

                        onClick={() => fetchContractExpires(currentPage, currentSize, 30)}
                    >
                        Làm mới
                    </Button>
                    <Dropdown
                        menu={{
                            items: [
                                { key: "1", label: "Xuất Excel" },
                                { key: "2", label: "Báo cáo" },
                            ],
                        }}
                    >
                        <Button size="large" icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Space>
            </div>

            {/* ===== TABLE ===== */}
            <Table
                columns={columns}
                dataSource={contractExpires}
                rowKey="id"
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
