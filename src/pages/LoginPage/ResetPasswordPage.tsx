import { Button, Form, FormProps, Input, notification } from "antd";
import { useForgotPasswordStore } from "src/stores/auth/useForgotPasswordStore";

type FieldType = {
    email?: string;
};

export const ResetPasswordPage = () => {
    const [form] = Form.useForm<FieldType>();
    const { forgotPassword, loading } = useForgotPasswordStore();

    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        if (!values.email) return;

        try {
            await forgotPassword({ email: values.email });
            notification.success({
                message: "Gửi email reset thành công",
                description: "Vui lòng kiểm tra hộp thư của bạn.",
            });
            form.resetFields();
        } catch {
            notification.error({
                message: "Gửi email reset thất bại",
                description: "Vui lòng kiểm tra lại email hoặc thử lại sau.",
            });
        }
    };

    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <>
            <p className="mb-6 text-3xl">Nhập email để nhận link reset mật khẩu</p>

            <Form
                form={form}
                name="reset-password"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" },
                    ]}
                >
                    <Input placeholder="user@example.com" />
                </Form.Item>

                <Form.Item label={null} wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Gửi
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};