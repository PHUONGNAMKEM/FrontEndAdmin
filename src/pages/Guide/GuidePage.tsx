import { Button, Form, FormProps, Input, notification } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePasswordAPI } from "src/services/api.me.service";

type FieldType = {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
};

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};


export const GuidePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            notification.error({
                message: "Xác nhận mật khẩu không khớp!",
                description: "Vui lòng kiểm tra lại mật khẩu mới.",
            });
            return;
        }

        try {
            setLoading(true);
            const res = await changePasswordAPI(values.oldPassword, values.newPassword);
            const data = res.data;

            if (data?.success && data?.statusCode === 200) {
                notification.success({
                    message: "Đổi mật khẩu thành công",
                    description: data?.message || "Bạn sẽ được chuyển về trang đăng nhập.",
                });

                // Lưu flag đánh dấu đã đổi mật khẩu lần đầu
                localStorage.setItem("hasChangedPassword", "true");

                setTimeout(() => navigate("/login"), 1200);
            } else {
                notification.error({
                    message: "Đổi mật khẩu thất bại",
                    description: data?.message || "Không thể đổi mật khẩu.",
                });
            }
        } catch (error: any) {
            console.error("Change password failed:", error);
            notification.error({
                message: "Lỗi khi đổi mật khẩu",
                description:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Vui lòng kiểm tra lại mật khẩu cũ.",
            });
        } finally {
            setLoading(false);
        }
    };


    return <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
        <div className="mb-3 title-guide">
            <h1 className="mb-3 text-3xl font-bold">Hướng dẫn đổi mật khẩu lần đầu</h1>
            <p className="">
                Sau khi được cấp tài khoản, vui lòng đổi mật khẩu ngay để đảm bảo an toàn.
                <br />
                Mật khẩu mới cần có ít nhất 6 ký tự và dễ nhớ.
            </p>
        </div>

        <Form
            layout="vertical"
            name="changePasswordForm"
            onFinish={onFinish}
            autoComplete="off"
        >
            <Form.Item<FieldType>
                label="Mật khẩu cũ"
                name="oldPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu cũ!" }]}
            >
                <Input.Password placeholder="Nhập mật khẩu cũ" />
            </Form.Item>

            <Form.Item<FieldType>
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới!" },
                    { min: 6, message: "Mật khẩu mới phải có ít nhất 6 ký tự" },
                ]}
            >
                <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>

            <Form.Item<FieldType>
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
            </Form.Item>

            <Form.Item>
                <Button
                    color="cyan"
                    variant="solid"
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                >
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    </div>
}