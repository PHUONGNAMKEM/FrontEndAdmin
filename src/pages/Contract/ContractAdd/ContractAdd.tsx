import { Avatar, DatePicker, Form, Input, Modal, notification, Select, Splitter } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useContractStore } from "src/stores/useContractStore";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { useUserStore } from "src/stores/useUserStore";
import { Contract } from "src/types/contract/Contract";

export default function ContractAdd() {

    const [form] = Form.useForm();
    const contractValues = Form.useWatch([], form); // theo dõi form thay đổi
    const {
        fetchContract,
        addContract,
        isModalOpen,
        setModalOpen,
    } = useContractStore();

    const { employees, fetchEmployees, meta: metaEmployee } = useEmployeeStore();
    const { users, meta: metaUser, fetchUsers } = useUserStore();

    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("current") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

    useEffect(() => {
        fetchContract(currentPage, currentSize);
        fetchEmployees(undefined, metaEmployee?.total);
        fetchUsers(metaUser?.current, metaUser?.total);
    }, [currentPage, currentSize]);

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            // Format lại ngày
            const payload = {
                ...values,
                startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
                signedDate: dayjs(values.signedDate).format("YYYY-MM-DD"),
                endDate: dayjs(values.endDate).format("YYYY-MM-DD"),
            };
            await addContract!(payload);
            notification.success({ message: "Thêm hợp đồng thành công!" });

            setModalOpen(false);
            form.resetFields();
            fetchContract(currentPage, currentSize);
        } catch (err: any) {
            console.error("Add contract failed:", err);
            notification.error({
                message: "Thêm hợp đồng thất bại!",
                description: err?.message || "Vui lòng thử lại.",
            });
        }
    };
    // const handleChangeSelect = (field: keyof Contract, value: any) => {
    //     setEditedContract((prev) => (prev ? { ...prev, [field]: value } : prev));
    // };

    // Employee Options để bỏ vào option trong Select input
    const employeeOptions = employees
        .map((emp) => ({
            value: emp.id,
            label: emp.fullName,
            email: emp.email,
            avatarUrl: emp.avatarUrl,
        }));

    const employeeAllowedOptions = users
        .filter(
            (user) =>
                user.roleName === "Admin" || user.roleName === "HR"
            // emp.positionId === "BC7665FF-1AC1-4B12-8886-418330DD06C7" ||
            // emp.positionId === "B93A0EEF-7E77-411D-A903-6CCFE63E9B92" ||
            // emp.positionName! === "Giám đốc điều hành" ||
            // emp.positionName! === "Phó giám đốc"
        )
        .map((user) => ({
            value: user.id,
            label: user.employeeName,
            email: user.employeeEmail,
            rolName: user.roleName
        }));

    // Định nghĩa các ENUM (type, worktype, status)
    const CONTRACT_TYPE_MAP: Record<number, string> = {
        0: "Toàn thời gian",
        1: "Bán thời gian",
        2: "Thực tập",
        3: "Thử việc",
        4: "Có thời hạn",
        5: "Thời vụ",
    };

    const WORK_TYPE_MAP: Record<number, string> = {
        0: "Làm việc toàn thời gian",
        1: "Làm việc bán thời gian",
        2: "Làm việc từ xa",
        3: "Làm việc kết hợp (Hybrid)",
    };

    const STATUS_MAP: Record<number, string> = {
        0: "Hiệu lực",
        1: "Hết hạn",
        2: "Đã chấm dứt (đơn phương hoặc thỏa thuận)",
        3: "Bản nháp",
    };

    // Set Theme cho hợp đồng
    const [themeContract, setThemeContract] = useState<"light" | "classic" | "dark">("classic");
    const [fontContract, setFontContract] = useState<"Times New Roman" | "Arial" | "Roboto" | "Poppins">("Times New Roman");

    const themeStylesContract = {
        light: {
            border: "1px solid #e0e0e0",
            background: "#fafafa",
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        },
        classic: {
            border: "2px solid #bfbfbf",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        },
        dark: {
            border: "2px solid #333",
            background: "#1e1e1e",
            color: "#f5f5f5",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
        },
    } as const;

    return (
        <Modal
            title="Thêm hợp đồng mới"
            open={isModalOpen}
            onCancel={() => setModalOpen(false)}
            onOk={handleAdd}
            okText="Thêm"
            cancelText="Hủy"
            width="90vw"
        >
            <Form form={form} layout="vertical" initialValues={{
                startDate: dayjs(),
                signedDate: dayjs(),
                type: 0,
                workType: 0,
                status: 0,
            }}>
                <Splitter style={{}}>
                    <Splitter.Panel defaultSize="30%" min="30%" max="60%" style={{ paddingRight: 16 }}>
                        <Form.Item
                            label="Tiêu đề"
                            name="title"
                            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
                        >
                            <Input />
                        </Form.Item>
                        {/* <Form.Item label="Mã hợp đồng" name="contractNumber">
                    <Input />
                </Form.Item> */}
                        <Form.Item label="Tên nhân viên" name="employeeId" rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}>
                            <Select
                                className="w-full"
                                placeholder="Chọn nhân viên"
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
                                onChange={(value) => form.setFieldValue("employeeId", value)}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Loại hợp đồng"
                            name="type"
                            rules={[{ required: true, message: "Chọn loại hợp đồng!" }]}
                        >
                            <Select
                                placeholder="Chọn loại hợp đồng"
                                options={[
                                    { value: 0, label: "Full-time" },
                                    { value: 1, label: "Part-time" },
                                    { value: 2, label: "Thực tập sinh" },
                                    { value: 3, label: "Thử việc" },
                                    { value: 4, label: "Hợp đồng có thời hạn" },
                                    { value: 5, label: "Hợp đồng có thời vụ" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item label="Hình thức làm việc" name="workType" rules={[{ required: true, message: "Chọn hình thức làm việc!" }]}>
                            <Select
                                options={[
                                    { value: 0, label: "Toàn thời gian" },
                                    { value: 1, label: "Bán thời gian" },
                                    { value: 2, label: "Từ xa" },
                                    { value: 3, label: "Làm việc kết hợp (Hybrid)" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item label="Ngày bắt đầu" name="startDate" rules={[{ required: true, message: "Chọn ngày bắt đầu!" }]}>
                            <DatePicker format="DD/MM/YYYY" className="w-full" />
                        </Form.Item>
                        <Form.Item label="Ngày ký" name="signedDate" rules={[{ required: true, message: "Chọn ngày ký!" }]}>
                            <DatePicker format="DD/MM/YYYY" className="w-full" />
                        </Form.Item>
                        <Form.Item label="Ngày kết thúc" name="endDate" rules={[{ required: true, message: "Chọn ngày kết thúc!" }]}>
                            <DatePicker format="DD/MM/YYYY" className="w-full" />
                        </Form.Item>
                    </Splitter.Panel>

                    <Splitter.Panel style={{ padding: "0 16px" }}>
                        <Form.Item label="Lương cơ bản" name="basicSalary" rules={[{ required: true, message: "Vui lòng chọn mức lương cơ bản!" }]}>
                            {/* <Input type="number" /> */}
                            <Select
                                className="w-full"
                                placeholder="Chọn mức lương cơ bản"
                                options={[1000000, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000].map((num) => ({
                                    value: num,
                                    label: `${num.toLocaleString("vi-VN")} đ`,
                                }))}
                                // onChange={(value) => handleChangeSelect("basicSalary", value)}
                                showSearch // cho phép gõ để lọc
                                optionFilterProp="label"
                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item label="Lương bảo hiểm" name="insuranceSalary" rules={[{ required: true, message: "Chọn lương đóng bảo hiểm!" }]}>
                            <Select
                                placeholder="Chọn mức lương đóng bảo hiểm"
                                options={[1000000, 5000000, 10000000, 15000000, 20000000, 25000000, 30000000].map((num) => ({
                                    value: num,
                                    label: `${num.toLocaleString("vi-VN")} đ`,
                                }))}
                                showSearch
                                optionFilterProp="label"
                            />
                        </Form.Item>

                        <Form.Item label="Người đại diện ký hợp đồng" name="representativeId">
                            <Select
                                className="w-full"
                                placeholder="Chọn người đại diện"
                                options={employeeAllowedOptions}
                                showSearch // cho phép gõ để lọc
                                optionFilterProp="label"
                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                                optionRender={(option) =>
                                (
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {/* <Avatar src={option.data.avatarUrl} /> */}
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{option.data.label}</div>
                                                <div style={{ fontSize: 12, color: "#888" }}>{option.data.email}</div>
                                            </div>
                                        </div>
                                        {/* <div style={{ fontWeight: 500 }}>{option.data.positionName}</div> */}
                                    </div>
                                )}
                                onChange={(value) => form.setFieldValue("representativeId", value)}
                            />
                        </Form.Item>

                        <Form.Item label="Trạng thái" name="status">
                            <Select
                                options={[
                                    { value: 0, label: "Hiệu lực" },
                                    { value: 1, label: "Hết hạn" },
                                    { value: 2, label: "Đã chấm dứt" },
                                    { value: 3, label: "Bản nháp" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item label="File hợp đồng" name="attachmentUrl">
                            <Input placeholder="Nhập link hoặc tên file (nếu có)" />
                        </Form.Item>

                        <Form.Item label="Ghi chú" name="notes">
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                                justifyContent: "space-between",
                                marginTop: 24,
                                borderTop: "1px solid #ddd",
                                paddingTop: 12,
                            }}
                        >
                            <Form.Item label="Chủ đề hợp đồng" style={{ flex: 1 }}>
                                <Select
                                    size="small"
                                    value={themeContract}
                                    onChange={(value) => setThemeContract(value)}
                                    options={[
                                        { value: "classic", label: "Cổ điển" },
                                        { value: "light", label: "Sáng" },
                                        { value: "dark", label: "Tối" },
                                    ]}
                                />
                            </Form.Item>

                            <Form.Item label="Phông chữ" style={{ flex: 1 }}>
                                <Select
                                    size="small"
                                    value={fontContract}
                                    onChange={(value) => setFontContract(value)}
                                    options={[
                                        { value: "Times New Roman", label: "Times New Roman" },
                                        { value: "Arial", label: "Arial" },
                                        { value: "Roboto", label: "Roboto" },
                                        { value: "Poppins", label: "Poppins" },
                                    ]}
                                />
                            </Form.Item>
                        </div>
                    </Splitter.Panel>

                    <Splitter.Panel style={{ paddingLeft: 16 }}>
                        <div
                            style={{
                                ...themeStylesContract[themeContract],
                                border: "2px solid #bfbfbf",
                                borderRadius: 8,
                                padding: "40px 60px",
                                // background: "#fff",
                                height: "100%",
                                overflowY: "auto",
                                fontFamily: fontContract === "Times New Roman" ? "'Times New Roman', serif" : `'${fontContract}', sans-serif`,
                                lineHeight: 1.8,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                            }}
                        >
                            <h3 style={{ textAlign: "center", textTransform: "uppercase", fontWeight: 700 }}>
                                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                            </h3>
                            <p style={{ textAlign: "center", fontStyle: "italic", marginTop: -8 }}>
                                Độc lập - Tự do - Hạnh phúc
                            </p>
                            <hr style={{ margin: "8px 0 24px 0" }} />

                            <h2 style={{ textAlign: "center", textTransform: "uppercase", marginBottom: 8 }}>
                                {contractValues?.title || "HỢP ĐỒNG LAO ĐỘNG"}
                            </h2>

                            <p style={{ textAlign: "center", marginBottom: 24 }}>
                                (Số: ........../HĐLĐ)
                            </p>

                            <p><strong>Căn cứ:</strong></p>
                            <ul style={{ marginTop: 0 }}>
                                <li>Bộ luật Lao động hiện hành;</li>
                                <li>Nhu cầu công việc và năng lực của hai bên.</li>
                            </ul>

                            <h4 style={{ textAlign: "center", margin: "20px 0" }}>
                                Hôm nay, ngày {dayjs(contractValues?.signedDate).format("DD")} tháng{" "}
                                {dayjs(contractValues?.signedDate).format("MM")} năm{" "}
                                {dayjs(contractValues?.signedDate).format("YYYY")} tại TP. Hồ Chí Minh, chúng tôi gồm:
                            </h4>

                            {/* Bên A */}
                            <p><strong>BÊN A (Người sử dụng lao động):</strong></p>
                            <p>
                                Họ tên:{" "}
                                <strong>
                                    {contractValues?.representativeId
                                        ? employeeAllowedOptions.find(e => e.value === contractValues?.representativeId)?.label
                                        : "................................................"}
                                </strong>{" "}
                                {employeeAllowedOptions.find(e => e.value === contractValues?.representativeId)?.rolName || "Chức vụ"}
                            </p>
                            <p>Đại diện cho: Công ty TNHH 3 THÀNH VIÊN</p>
                            <p>Địa chỉ: ...........................................................</p>

                            {/* Bên B */}
                            <p><strong>BÊN B (Người lao động):</strong></p>
                            <p>
                                Họ tên:{" "}
                                <strong>
                                    {contractValues?.employeeId
                                        ? employeeOptions.find(e => e.value === contractValues.employeeId)?.label
                                        : "................................................"}
                                </strong>
                            </p>
                            <p>Email:{" "}
                                {contractValues?.employeeId
                                    ? employeeOptions.find(e => e.value === contractValues.employeeId)?.email
                                    : "................................................"}
                            </p>

                            <hr style={{ margin: "16px 0" }} />

                            {/* Nội dung hợp đồng */}
                            <h4 style={{ textAlign: "center", marginBottom: 12 }}>NỘI DUNG HỢP ĐỒNG</h4>

                            <p><strong>Điều 1.</strong> Loại hợp đồng:{" "}
                                <strong>
                                    {/* {contractValues?.type ?? 0} */}
                                    {CONTRACT_TYPE_MAP[Number(contractValues?.type ?? 0)] || "Không xác định"}
                                </strong>
                            </p>

                            <p><strong>Điều 2.</strong> Hình thức làm việc:{" "}
                                <strong>
                                    {/* {contractValues?.workType ?? 0} */}
                                    {WORK_TYPE_MAP[Number(contractValues?.workType ?? 0)] || "Không xác định"}
                                </strong>
                            </p>

                            <p><strong>Điều 3.</strong> Thời hạn hợp đồng:</p>
                            <ul style={{ marginTop: 0 }}>
                                <li><strong>Ngày bắt đầu:</strong> {contractValues?.startDate ? dayjs(contractValues.startDate).format("DD/MM/YYYY") : "—"}</li>
                                <li><strong>Ngày kết thúc:</strong> {contractValues?.endDate ? dayjs(contractValues.endDate).format("DD/MM/YYYY") : "—"}</li>
                            </ul>

                            <p><strong>Điều 4.</strong> Mức lương và chế độ:</p>
                            <ul style={{ marginTop: 0 }}>
                                <li>
                                    <strong>Lương cơ bản:</strong>{" "}
                                    {contractValues?.basicSalary
                                        ? `${contractValues.basicSalary.toLocaleString("vi-VN")} đ`
                                        : "—"}
                                </li>
                                <li>
                                    <strong>Lương đóng bảo hiểm:</strong>{" "}
                                    {contractValues?.insuranceSalary
                                        ? `${contractValues.insuranceSalary.toLocaleString("vi-VN")} đ`
                                        : "—"}
                                </li>
                            </ul>

                            <p><strong>Điều 5.</strong> Trạng thái hợp đồng:{" "}
                                <strong>
                                    {/* {contractValues?.status ?? 0} */}
                                    {STATUS_MAP[Number(contractValues?.status ?? 0)] || "Không xác định"}
                                </strong>
                            </p>

                            <p><strong>Điều 6.</strong> File hợp đồng đính kèm:{" "}
                                {contractValues?.attachmentUrl || "Không có"}
                            </p>

                            <p><strong>Điều 7.</strong> Ghi chú thêm:</p>
                            <p>{contractValues?.notes || "Không có ghi chú."}</p>

                            <hr style={{ margin: "24px 0" }} />

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                                <div style={{ textAlign: "center", width: "45%" }}>
                                    <strong>ĐẠI DIỆN BÊN A</strong>
                                    <p style={{ marginTop: 60 }}>
                                        (Ký tên, ghi rõ họ tên)
                                    </p>
                                </div>
                                <div style={{ textAlign: "center", width: "45%" }}>
                                    <strong>NGƯỜI LAO ĐỘNG</strong>
                                    <p style={{ marginTop: 60 }}>
                                        (Ký tên, ghi rõ họ tên)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Splitter.Panel>
                </Splitter>
            </Form>
        </Modal>
    );
}