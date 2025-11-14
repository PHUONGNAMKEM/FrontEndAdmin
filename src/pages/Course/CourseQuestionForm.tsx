import React, { useState } from "react";
import { Button, Card, Form, Input, Radio, Space, Typography, notification } from "antd";
import { PlusCircle, Save, ArrowLeft } from "lucide-react";
import { CourseQuestion } from "src/types/course/CourseQuestion";
import { useNavigate, useParams } from "react-router-dom";
import { useCourseQuestionStore } from "src/stores/course/useCourseQuestionStore";

const { Title } = Typography;

export const CourseQuestionForm = () => {
    const { courseId } = useParams(); // /courses/:courseId/questions
    const navigate = useNavigate();
    const { addQuestion } = useCourseQuestionStore();
    const [questions, setQuestions] = useState<CourseQuestion[]>([
        {
            courseId: courseId!,
            content: "",
            a: "",
            b: "",
            c: "",
            d: "",
            correct: "A",
        },
    ]);

    // Thêm một câu hỏi mặc định -> thêm vào danh sách questions -> cho ng dùng nhập và khi bấm submit 
    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                courseId: courseId!,
                content: "",
                a: "",
                b: "",
                c: "",
                d: "",
                correct: "A",
            },
        ]);
    };

    const handleChange = (index: number, field: keyof CourseQuestion, value: any) => { // keyof CourseQuestion để chỉ cho phép các field của CourseQuestion
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        try {
            for (const q of questions) {
                if (!q.content.trim()) continue;
                await addQuestion(q); // vì chưa có API tạo nhiều câu hỏi cùng lúc nên phải lặp từng câu hỏi
            }
            notification.success({ message: "Tạo đề thi thành công!" });
            navigate(-1); // quay lại trang trước đó, navigate(1) -> tiến tới 1 trang. Cứ nhớ + là tiến, - là lùi
        } catch (err) {
            notification.error({ message: "Tạo câu hỏi thất bại!" });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <Title level={3}>Tạo đề thi cho khóa học</Title>
                <Button
                    icon={<ArrowLeft size={18} />}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </Button>
            </div>

            {questions.map((q, index) => (
                <Card
                    key={index}
                    title={`Câu hỏi ${index + 1}`}
                    bordered
                    className="!mb-4"
                >
                    <Form layout="vertical">
                        <Form.Item label="Nội dung câu hỏi">
                            <Input.TextArea
                                rows={2}
                                value={q.content}
                                onChange={(e) => handleChange(index, "content", e.target.value)}
                                placeholder="Nhập nội dung câu hỏi..."
                            />
                        </Form.Item>

                        <Form.Item label="Các đáp án">
                            <Space direction="vertical" className="w-full">
                                <Input
                                    placeholder="Đáp án A"
                                    value={q.a}
                                    onChange={(e) => handleChange(index, "a", e.target.value)}
                                />
                                <Input
                                    placeholder="Đáp án B"
                                    value={q.b}
                                    onChange={(e) => handleChange(index, "b", e.target.value)}
                                />
                                <Input
                                    placeholder="Đáp án C"
                                    value={q.c}
                                    onChange={(e) => handleChange(index, "c", e.target.value)}
                                />
                                <Input
                                    placeholder="Đáp án D"
                                    value={q.d}
                                    onChange={(e) => handleChange(index, "d", e.target.value)}
                                />
                            </Space>
                        </Form.Item>

                        <Form.Item label="Đáp án đúng">
                            <Radio.Group
                                value={q.correct}
                                onChange={(e) => handleChange(index, "correct", e.target.value)}
                            >
                                <Radio value="A">A</Radio>
                                <Radio value="B">B</Radio>
                                <Radio value="C">C</Radio>
                                <Radio value="D">D</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Form>
                </Card>
            ))}

            <Space className="mt-4">
                <Button
                    size="large"
                    icon={<PlusCircle size={18} />}
                    onClick={handleAddQuestion}
                >
                    Thêm câu hỏi
                </Button>

                <Button
                    size="large"
                    type="primary"
                    icon={<Save size={18} />}
                    onClick={handleSubmit}
                >
                    Lưu đề thi
                </Button>
            </Space>
        </div>
    );
};
