import {
    Modal,
    Input,
    DatePicker,
    Radio,
    Select,
    Upload,
    Image,
    notification,
    Form,
    Splitter,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDepartmentStore } from "src/stores/useDepartmentStore";
import { usePositionStore } from "src/stores/usePositionStore";

export default function EmployeeAdd() {
    const { addEmployee, setModalOpen } = useEmployeeStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [fileName, setFileName] = useState<string | undefined>("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const navigate = useNavigate();
    const { meta } = useEmployeeStore();

    const { fetchDepartment, departments } = useDepartmentStore();
    const { fetchPosition, positions } = usePositionStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get("page") || "1");
    const currentSize = parseInt(searchParams.get("pageSize") || "10");

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

    /** Preview ảnh upload */
    const getBase64 = (file: RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChangeFile: UploadProps["onChange"] = ({ fileList: newList }) => {
        setFileList(newList); // ở đây theo cách truyền file lên
        // setFileName(newList[0].originFileObj?.name); // ở đây theo cách truyền chuỗi là name của file lên 
    };

    /** Submit form */
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!fileList[0]) {
                notification.warning({ message: "Vui lòng chọn ảnh đại diện!" });
                return;
            }

            const formData = new FormData();
            // append tất cả field
            formData.append("fullName", values.fullName);
            formData.append("gender", String(values.gender));
            formData.append("dob", dayjs(values.dob).format("YYYY-MM-DD"));
            formData.append("cccd", values.cccd);
            formData.append("email", values.email);
            formData.append("phone", values.phone);
            formData.append("address", values.address);
            formData.append("hireDate", dayjs(values.hireDate).format("YYYY-MM-DD"));
            formData.append("departmentId", values.departmentId);
            formData.append("positionId", values.positionId);
            formData.append("status", String(values.status));
            formData.append("avatarFile", fileList[0].originFileObj as RcFile);
            // formData.append("avatarUrl", values.avatarUrl ? values.avatarUrl : values.gender === 0 ? "https://randomuser.me/api/portraits/women/1.jpg" : "https://randomuser.me/api/portraits/men/1.jpg");

            // const payload = {
            //     // departmentName: departmentOptions.find(opt => opt.value === values.departmentId)?.label || "",
            //     // positionName: positionOptions.find(opt => opt.value === values.positionId)?.label || "",
            //     fullName: values.fullName,
            //     gender: values.gender,
            //     dob: dayjs(values.dob).format("YYYY-MM-DD"),
            //     cccd: values.cccd,
            //     email: values.email,
            //     phone: values.phone,
            //     address: values.address,
            //     hireDate: dayjs(values.hireDate).format("YYYY-MM-DD"),
            //     departmentId: values.departmentId,
            //     positionId: values.positionId,
            //     status: values.status,
            //     avatarUrl:
            //         values.avatarUrl ||
            //         (values.gender === 0
            //             ? "https://randomuser.me/api/portraits/women/1.jpg"
            //             : "https://randomuser.me/api/portraits/men/1.jpg"),
            // };

            setLoading(true);
            await addEmployee!(formData as any); // Gọi hàm trong store
            notification.success({ message: "Thêm nhân viên thành công!" });
            setModalOpen(false);
            form.resetFields();
            setFileList([]);
            navigate(`/employee?current=${meta?.current}&pageSize=${meta?.pageSize}`);

        } catch (err: any) {
            console.error(err);
            notification.error({
                message: "Tạo nhân viên thất bại",
                description: err?.response?.data?.message || err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartment(currentPage, currentSize);
        fetchPosition(currentPage, currentSize);
    }, [fetchDepartment, fetchPosition, currentPage, currentSize]);

    return (
        <Modal
            open
            title="Thêm nhân viên mới"
            onOk={handleSubmit}
            onCancel={() => setModalOpen(false)}
            confirmLoading={loading}
            okText="TẠO"
            maskClosable={false}
            destroyOnClose
            width="80vw"
        >
            <Form layout="horizontal" form={form} className="text-2xl" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                <Splitter style={{}}>
                    <Splitter.Panel defaultSize="50%" min="20%" max="70%" style={{ paddingRight: 16 }}>
                        <Form.Item name="fullName" label="Họ và tên" labelAlign="left" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="gender" label="Giới tính" labelAlign="left" rules={[{ required: true }]}>
                            <Radio.Group>
                                <Radio value={1}>Nam</Radio>
                                <Radio value={0}>Nữ</Radio>
                                <Radio value={2}>Khác</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item name="dob" label="Ngày sinh" labelAlign="left" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item name="cccd" label="CCCD" labelAlign="left" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="email" label="Email" labelAlign="left" rules={[{ required: true, type: "email" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
                            labelAlign="left"
                            rules={[
                                { required: true, message: "Vui lòng nhập số điện thoại" },
                                {
                                    pattern: /^[0-9]+$/,
                                    message: "Số điện thoại chỉ được chứa số",
                                },
                                {
                                    min: 9,
                                    max: 11,
                                    message: "Số điện thoại phải từ 9 đến 11 ký tự",
                                },
                            ]}
                        >
                            <Input maxLength={11} />
                        </Form.Item>

                        <Form.Item name="address" label="Địa chỉ" labelAlign="left" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Splitter.Panel>
                    <Splitter.Panel style={{ paddingLeft: 16 }}>
                        <Form.Item name="hireDate" label="Ngày vào làm" labelAlign="left" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item name="departmentId" label="Phòng ban" labelAlign="left" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn phòng ban"
                                options={departmentOptions}
                                showSearch // cho phép gõ để lọc
                                optionFilterProp="label"
                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item name="positionId" label="Vị trí" labelAlign="left" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn vị trí"
                                options={positionOptions}
                                showSearch // cho phép gõ để lọc
                                optionFilterProp="label"
                                filterOption={(input, option) => // input là mình gõ vô, option nào include input thì hiện ra
                                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item name="status" label="Tình trạng" labelAlign="left" rules={[{ required: true }]}>
                            <Select placeholder="Chọn tình trạng"
                                options={[
                                    { value: 0, label: "Đang làm việc" },
                                    { value: 1, label: "Nghỉ việc" },
                                ]}
                            />
                        </Form.Item>

                        {/* <Form.Item name="avatarUrl" label="Ảnh đại diện" labelAlign="left" rules={[{ required: true }]}>
                            <Input type="text" />
                        </Form.Item> */}

                        {/* Cách upload File lên backend */}
                        <Form.Item label="Ảnh đại diện" labelAlign="left">
                            <Upload
                                listType="picture-card"
                                onPreview={handlePreview}
                                onChange={handleChangeFile}
                                beforeUpload={() => false}
                                fileList={fileList}
                            >
                                {fileList.length >= 1 ? null : (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>

                            {previewImage && (
                                <Image
                                    width={200}
                                    wrapperStyle={{ display: "none" }}
                                    preview={{
                                        visible: previewOpen,
                                        onVisibleChange: (visible) => setPreviewOpen(visible),
                                    }}
                                    src={previewImage}
                                />
                            )}
                        </Form.Item>
                    </Splitter.Panel>
                </Splitter>
            </Form>
        </Modal>
    );
}
