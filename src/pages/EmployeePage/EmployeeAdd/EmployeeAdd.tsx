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
import { useState } from "react";
import dayjs from "dayjs";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { useNavigate } from "react-router-dom";

export default function EmployeeAdd() {
    const { addEmployee, setModalOpen } = useEmployeeStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const navigate = useNavigate();
    const { meta } = useEmployeeStore();



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
        setFileList(newList);
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
            formData.append("full_name", values.full_name);
            formData.append("gender", values.gender);
            formData.append("dob", values.dob.toISOString());
            formData.append("cccd", values.cccd);
            formData.append("email", values.email);
            formData.append("phone", values.phone);
            formData.append("address", values.address);
            formData.append("hire_date", values.hire_date.toISOString());
            formData.append("department_id", values.department_id);
            formData.append("position_id", values.position_id);
            formData.append("status", values.status);
            formData.append("avatar_url", fileList[0].originFileObj as RcFile);

            setLoading(true);
            await addEmployee!(formData); // Gọi hàm trong Zustand
            notification.success({ message: "Thêm nhân viên thành công!" });
            setModalOpen(false);
            form.resetFields();
            setFileList([]);
            navigate(`/employees?page=${meta?.current}&limit=${meta?.pageSize}`);

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
            <Form layout="vertical" form={form} className="text-2xl">
                <Splitter style={{}}>
                    <Splitter.Panel defaultSize="50%" min="20%" max="70%" style={{ paddingRight: 16 }}>
                        <Form.Item name="full_name" label="Họ và tên" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                            <Radio.Group>
                                <Radio value="male">Nam</Radio>
                                <Radio value="female">Nữ</Radio>
                                <Radio value="other">Khác</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item name="dob" label="Ngày sinh" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item name="cccd" label="CCCD" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Số điện thoại"
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

                        <Form.Item name="address" label="Địa chỉ" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Splitter.Panel>
                    <Splitter.Panel style={{ paddingLeft: 16 }}>
                        <Form.Item name="hire_date" label="Ngày vào làm" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>

                        <Form.Item name="department_id" label="Phòng ban" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn phòng ban"
                                options={[
                                    { value: "76f12f05-019e-4960-a140-1d1fe8b3265c", label: "Phòng Kỹ Thuật" },
                                    { value: "abcd1234", label: "Phòng Nhân Sự" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item name="position_id" label="Vị trí" rules={[{ required: true }]}>
                            <Select
                                placeholder="Chọn vị trí"
                                options={[
                                    { value: "3fdb63bf-7130-483f-b0a4-379a8053b3f0", label: "Lập trình viên" },
                                    { value: "xyz789", label: "Tester" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item name="status" label="Tình trạng" rules={[{ required: true }]}>
                            <Select
                                options={[
                                    { value: "active", label: "Đang làm việc" },
                                    { value: "inactive", label: "Nghỉ việc" },
                                ]}
                            />
                        </Form.Item>

                        <Form.Item label="Ảnh đại diện">
                            <Upload
                                listType="picture-card"
                                onPreview={handlePreview}
                                onChange={handleChangeFile}
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
