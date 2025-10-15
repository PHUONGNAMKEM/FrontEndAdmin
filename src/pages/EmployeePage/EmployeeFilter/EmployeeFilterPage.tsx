import React, { useState } from "react";
import { Card, Select, Button, Space } from "antd";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { useDepartmentStore } from "src/stores/useDepartmentStore";
import { usePositionStore } from "src/stores/usePositionStore";

export const EmployeeFilterPage = () => {
    const { fetchFilteredEmployees, setFilters } = useEmployeeStore();
    const { departments } = useDepartmentStore();
    const { positions } = usePositionStore();

    const [filters, setLocalFilters] = useState({
        gender: "",
        status: "",
        departmentId: "",
        positionId: "",
    });

    const handleApply = async () => {
        await fetchFilteredEmployees!(filters);
        setFilters(filters);
    };

    const handleReset = () => {
        setLocalFilters({
            gender: "",
            status: "",
            departmentId: "",
            positionId: "",
        });
        fetchFilteredEmployees!({});
    };

    return (
        <Card
            title="Bộ lọc nhân viên"
            style={{
                width: "20vw",
                marginLeft: "16px",
                // height: "85vh",
                borderLeft: "1px solid #eee",
                overflowY: "auto",
                transition: "0.3s ease",
            }}
        >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
                <div>
                    <label>Giới tính</label>
                    <Select
                        style={{ width: "100%" }}
                        value={filters.gender}
                        placeholder="Chọn giới tính"
                        onChange={(value) =>
                            setLocalFilters((prev) => ({ ...prev, gender: value }))
                        }
                    >
                        <Select.Option value="">Tất cả</Select.Option>
                        <Select.Option value="1">Nam</Select.Option>
                        <Select.Option value="0">Nữ</Select.Option>
                        <Select.Option value="2">Khác</Select.Option>
                    </Select>
                </div>

                <div>
                    <label>Trạng thái</label>
                    <Select
                        style={{ width: "100%" }}
                        value={filters.status}
                        placeholder="Chọn trạng thái"
                        onChange={(value) =>
                            setLocalFilters((prev) => ({ ...prev, status: value }))
                        }
                    >
                        <Select.Option value="">Tất cả</Select.Option>
                        <Select.Option value="0">Đang làm việc</Select.Option>
                        <Select.Option value="1">Nghỉ việc</Select.Option>
                    </Select>
                </div>

                <div>
                    <label>Phòng ban</label>
                    <Select
                        style={{ width: "100%" }}
                        value={filters.departmentId}
                        placeholder="Chọn phòng ban"
                        onChange={(value) =>
                            setLocalFilters((prev) => ({ ...prev, departmentId: value }))
                        }
                        options={departments.map((d) => ({
                            label: d.name,
                            value: d.id,
                        }))}
                    />
                </div>

                <div>
                    <label>Chức vụ</label>
                    <Select
                        style={{ width: "100%" }}
                        value={filters.positionId}
                        placeholder="Chọn chức vụ"
                        onChange={(value) =>
                            setLocalFilters((prev) => ({ ...prev, positionId: value }))
                        }
                        options={positions.map((p) => ({
                            label: p.name,
                            value: p.id,
                        }))}
                    />
                </div>

                <Space style={{ justifyContent: "space-between", width: "100%" }}>
                    <Button onClick={handleReset}>Đặt lại</Button>
                    <Button type="primary" onClick={handleApply}>
                        Áp dụng
                    </Button>
                </Space>
            </Space>
        </Card>
    );
};
