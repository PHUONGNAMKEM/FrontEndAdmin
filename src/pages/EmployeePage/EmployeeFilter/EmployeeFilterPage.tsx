import { useEffect, useState } from "react";
import { Table, Checkbox, Button, Space, Select, message, Tag } from "antd";
import { fetchFilteredEmployeesAPI } from "src/services/api.me.service";
type FilterFields = {
    gender?: string;
    status?: string;
    department_id?: string;
    position_id?: string;
    [key: string]: string | undefined;
};
export const EmployeeFilterPage = () => {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState<FilterFields>({
        gender: "",
        status: "",
        department_id: "",
        position_id: "",

    });
    const [checkedFields, setCheckedFields] = useState<string[]>([]);

    const handleSearch = async () => {
        // Lọc chỉ các trường được tick
        const activeFilters: any = {};
        checkedFields.forEach((field) => {
            if (filters[field]) activeFilters[field] = filters[field];
        });

        const res = await fetchFilteredEmployeesAPI(activeFilters);
        if (res.data.success) {
            setData(res.data.data.result);
            message.success("Tìm kiếm thành công!");
        } else {
            message.error("Không tìm thấy dữ liệu phù hợp!");
        }
    };

    const columns = [
        { title: "Mã NV", dataIndex: "code", key: "code" },
        { title: "Họ và tên", dataIndex: "full_name", key: "full_name" },
        {
            title: "Giới tính",
            dataIndex: "gender",
            key: "gender",
            render: (v: string) => (v === "male" ? "Nam" : v === "female" ? "Nữ" : "Khác"),
        },
        { title: "Phòng ban", dataIndex: "department", key: "department" },
        { title: "Chức vụ", dataIndex: "position", key: "position" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) =>
                status === "active" ? <Tag color="green">Đang làm việc</Tag> : <Tag color="red">Nghỉ việc</Tag>,
        },
    ];

    return (
        <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
            <h2 className="mb-4 text-xl font-bold">Lọc danh sách nhân viên</h2>

            <Space direction="vertical" style={{ width: "100%" }}>
                <Checkbox.Group
                    options={[
                        { label: "Giới tính", value: "gender" },
                        { label: "Trạng thái", value: "status" },
                        { label: "Phòng ban", value: "department_id" },
                        { label: "Chức vụ", value: "position_id" },
                    ]}
                    value={checkedFields}
                    onChange={(values) => setCheckedFields(values as string[])}
                />

                <div className="flex gap-4">
                    {checkedFields.includes("gender") && (
                        <Select
                            placeholder="Chọn giới tính"
                            style={{ width: 200 }}
                            onChange={(value) => setFilters({ ...filters, gender: value })}
                            options={[
                                { label: "Nam", value: "male" },
                                { label: "Nữ", value: "female" },
                                { label: "Khác", value: "other" },
                            ]}
                        />
                    )}

                    {checkedFields.includes("status") && (
                        <Select
                            placeholder="Chọn trạng thái"
                            style={{ width: 200 }}
                            onChange={(value) => setFilters({ ...filters, status: value })}
                            options={[
                                { label: "Đang làm việc", value: "active" },
                                { label: "Nghỉ việc", value: "inactive" },
                            ]}
                        />
                    )}

                    {checkedFields.includes("department_id") && (
                        <Select
                            placeholder="Chọn phòng ban"
                            style={{ width: 200 }}
                            onChange={(value) => setFilters({ ...filters, department_id: value })}
                            // TODO: Gọi API phòng ban để đổ options thật
                            options={[
                                { label: "Phòng Kỹ thuật", value: "A403909e4" },
                                { label: "Phòng Nhân sự", value: "B998120e7" },
                            ]}
                        />
                    )}

                    {checkedFields.includes("position_id") && (
                        <Select
                            placeholder="Chọn chức vụ"
                            style={{ width: 200 }}
                            onChange={(value) => setFilters({ ...filters, position_id: value })}
                            // TODO: Gọi API vị trí thật
                            options={[
                                { label: "Trưởng phòng", value: "P001" },
                                { label: "Nhân viên", value: "P002" },
                            ]}
                        />
                    )}
                </div>

                <Button type="primary" onClick={handleSearch}>
                    Tìm kiếm
                </Button>
            </Space>

            <Table
                className="mt-4"
                columns={columns}
                dataSource={data}
                rowKey="id"
                bordered
                pagination={false}
            />
        </div>
    );
};
