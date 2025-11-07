import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Button,
    Space,
    Popconfirm,
    Typography,
    Card,
    Pagination,
    notification,
    Modal,
    Form,
    Radio,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { Search, PlusCircle, Trash2, ArrowLeft, Edit3 } from "lucide-react";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { CourseQuestion } from "src/types/course/CourseQuestion";
import { useCourseQuestionStore } from "src/stores/course/useCourseQuestionStore";

const { Title } = Typography;

export const CourseQuestionList = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { questions, meta, fetchQuestions, clearQuestions, updateQuestion, deleteQuestion } = useCourseQuestionStore();
    const [searchText, setSearchText] = useState("");
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<CourseQuestion | null>(
        null
    );
    const [form] = Form.useForm();

    useEffect(() => {
        if (courseId) fetchQuestions(courseId, current, pageSize);
        return () => clearQuestions();
    }, [courseId, current, pageSize]);

    const handleSearch = () => {
        if (courseId) fetchQuestions(courseId, 1, pageSize, searchText);
        setCurrent(1);
    };


    const handleDelete = async (id: string) => {
        try {
            await deleteQuestion(id);
            notification.success({ message: "Xóa câu hỏi thành công!" });
            if (courseId) fetchQuestions(courseId, current, pageSize, searchText);
        } catch (err) {
            console.error("Delete question failed:", err);
            notification.error({ message: "Xóa câu hỏi thất bại!" });
        }
    };

    // ====== SỬA CÂU HỎI ======
    const handleEdit = (record: CourseQuestion) => {
        setEditingQuestion(record);
        form.setFieldsValue(record);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            if (!editingQuestion?.id) return;
            await updateQuestion(editingQuestion.id, values);
            notification.success({ message: "Cập nhật câu hỏi thành công!" });
            setIsEditModalOpen(false);
            fetchQuestions(courseId!, current, pageSize, searchText);
        } catch (err) {
            notification.error({
                message: "Cập nhật câu hỏi thất bại!",
                description: (err as any)?.message || "Vui lòng thử lại.",
            });
        }
    };

    const columns = [
        {
            title: "Nội dung",
            dataIndex: "content",
            key: "content",
            render: (text: string) => <span>{text}</span>,
        },
        { title: "A", dataIndex: "a", key: "a" },
        { title: "B", dataIndex: "b", key: "b" },
        { title: "C", dataIndex: "c", key: "c" },
        { title: "D", dataIndex: "d", key: "d" },
        {
            title: "Đáp án đúng",
            dataIndex: "correct",
            key: "correct",
            render: (val: string) => <b style={{ color: "#1677ff" }}>{val}</b>,
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: CourseQuestion) => (
                <Space>
                    <Button
                        icon={<IconWrapper Icon={Edit3} />}
                        type="text"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Xóa câu hỏi"
                        description="Bạn chắc chắn muốn xóa câu hỏi này?"
                        onConfirm={() => handleDelete(record.id!)}
                    >
                        <Button
                            icon={<IconWrapper Icon={Trash2} color="#ff4d4f" />}
                            danger
                            type="text"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-white rounded-md shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <Space>
                    <Button icon={<ArrowLeft size={18} />} onClick={() => navigate(-1)}>
                        Quay lại
                    </Button>
                    <Title level={4} style={{ margin: 0 }}>
                        Danh sách câu hỏi của khóa học
                    </Title>
                </Space>
                <Space>
                    <Input
                        placeholder="Tìm kiếm câu hỏi..."
                        prefix={<IconWrapper Icon={Search} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Button
                        type="primary"
                        size="large"
                        icon={<IconWrapper Icon={PlusCircle} color="#fff" />}
                        onClick={() =>
                            navigate(`/courses/${courseId}/questions/create`)
                        }
                    >
                        Thêm câu hỏi
                    </Button>
                </Space>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={questions}
                    rowKey="id"
                    pagination={false}
                />
                <div className="flex justify-center mt-4">
                    <Pagination
                        current={meta?.current || 1}
                        total={meta?.total || 0}
                        pageSize={meta?.pageSize || 10}
                        onChange={(page, size) => {
                            setCurrent(page);
                            setPageSize(size);
                        }}
                    />
                </div>
            </Card>

            {/* ===== Modal Sửa Câu Hỏi ===== */}
            <Modal
                title="Chỉnh sửa câu hỏi"
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onOk={handleUpdate}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Nội dung câu hỏi"
                        name="content"
                        rules={[{ required: true, message: "Nhập nội dung câu hỏi" }]}
                    >
                        <Input.TextArea rows={2} maxLength={200} showCount />
                    </Form.Item>
                    <Form.Item label="Đáp án A" name="a">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Đáp án B" name="b">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Đáp án C" name="c">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Đáp án D" name="d">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Đáp án đúng" name="correct">
                        <Radio.Group>
                            <Radio value="A">A</Radio>
                            <Radio value="B">B</Radio>
                            <Radio value="C">C</Radio>
                            <Radio value="D">D</Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
