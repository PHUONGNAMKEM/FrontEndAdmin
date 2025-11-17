import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Radio, Checkbox, List, Typography, notification } from "antd";
import { useEmployeeStore } from "src/stores/useEmployeeStore";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { OctagonAlert } from "lucide-react";
import { useNotificationStore } from "src/stores/notification/useNotificationStore";
import { useUserStore } from "src/stores/useUserStore";

const { Text } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const NotificationAdd = ({ open, onClose, onSuccess }: Props) => {
    const [form] = Form.useForm();

    // const { employees, fetchEmployees, meta: metaEmployee } = useEmployeeStore();
    const { users, fetchUsers, meta: metaUser } = useUserStore();
    const { addNotification } = useNotificationStore();

    const [mode, setMode] = useState<"one" | "multi" | "all">("one");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    useEffect(() => {
        fetchUsers(undefined, metaUser?.total);
    }, []);

    const handleCheck = (id: string, checked: boolean) => {
        if (mode === "one") {
            setSelectedUserIds(checked ? [id] : []);
        } else {
            setSelectedUserIds((prev) =>
                checked ? [...prev, id] : prev.filter((u) => u !== id)
            );
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            await addNotification({
                title: values.title,
                content: values.content,
                type: values.type,
                actionUrl: values.actionUrl || "",
                actorId: localStorage.getItem('userId') || "",
                targetUserIds: mode === "all" ? null : (selectedUserIds.length > 0 ? selectedUserIds : null),
            });

            notification.success({ message: "Tạo thông báo thành công!" });

            form.resetFields();
            setSelectedUserIds([]);

            onSuccess();
            onClose();
        } catch (err: any) {
            console.log(">> Check fail noti: ", err);
            notification.error({
                message: "Tạo thất bại",
                description: err?.response?.data?.message || "Lỗi không xác định.",
            });
        }
    };

    return (
        <Modal
            title="Tạo thông báo"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            okText="Gửi thông báo"
        >
            <Form layout="vertical" form={form}>
                <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Nội dung" name="content" rules={[{ required: true }]}>
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Loại" name="type" initialValue="general">
                    <Input />
                </Form.Item>

                <Form.Item label="Action URL" name="actionUrl">
                    <Input />
                </Form.Item>

                <Form.Item label="Gửi thông báo cho">
                    <Radio.Group
                        value={mode}
                        onChange={(e) => {
                            setMode(e.target.value);
                            setSelectedUserIds([]);
                        }}
                    >
                        <Radio value="one">Một nhân viên</Radio>
                        <Radio value="multi">Nhiều nhân viên</Radio>
                        <Radio value="all">Tất cả nhân viên</Radio>
                    </Radio.Group>
                </Form.Item>

                {mode !== "all" && (
                    <div
                        style={{
                            border: "1px solid #eee",
                            borderRadius: 6,
                            maxHeight: 200,
                            overflowY: "auto",
                            padding: 8,
                        }}
                    >
                        <List
                            dataSource={users}
                            renderItem={(user) => (
                                <List.Item key={user.id}>
                                    <Checkbox
                                        disabled={mode === "one" && selectedUserIds.length > 0 && selectedUserIds[0] !== user.id}
                                        checked={selectedUserIds.includes(user.id!)}
                                        onChange={(e) => handleCheck(user.id!, e.target.checked)}
                                    >
                                        {user.employeeName} — {user.employeeEmail}
                                    </Checkbox>
                                </List.Item>
                            )}
                        />
                    </div>
                )}

                {mode === "all" && (
                    <div className="flex items-center gap-2">
                        <IconWrapper Icon={OctagonAlert} color="#FAAD14" />
                        <Text type="warning">Hệ thống sẽ gửi tới TẤT CẢ nhân viên.</Text>
                    </div>
                )}
            </Form>
        </Modal>
    );
};
