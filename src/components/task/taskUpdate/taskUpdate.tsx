import { Button, DatePicker, Dropdown, Input, MenuProps, Modal, notification, Popconfirm, Radio, Space } from "antd";
import RichEditor from "../../richTextEditor/RichEditor";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { TaskType } from "../../../types/TaskType";
import { deleteTaskAPI, updateTitleTaskAPI } from "../../../services/api.me.service";
import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined } from "@ant-design/icons";
import { Bomb, Ellipsis } from "lucide-react";

interface GoalUpdateProps {
    isModalTaskUpdateOpen: boolean;
    setIsModalTaskUpdateOpen: (open: boolean) => void;
    task: TaskType | null;
    loadTask: () => void;
}

const TaskUpdate = ({ isModalTaskUpdateOpen, setIsModalTaskUpdateOpen, task, loadTask }: GoalUpdateProps) => {

    const [title, setTitle] = useState<string | undefined>("");
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(3, "day"));

    const resetAndCloseModal = () => {
        setIsModalTaskUpdateOpen(false);
        loadTask();
    };

    useEffect(() => {
        if (task) {
            setTitle(task?.title);
            setStartDate(dayjs(task.startDate));
            setEndDate(dayjs(task.dueDate));
        }
    }, [task]);


    const handleUpdateTask = async () => {
        if (!title || !title.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please fill in your title",
            });
            return;
        };

        try {
            const res = await updateTitleTaskAPI(
                task?.idGoal,
                task?.idTask,
                title,
                startDate,
                endDate
            );

            if (res?.data) {
                notification.success({
                    message: "Update created successfully",
                });
                resetAndCloseModal();
            }
        } catch (error: any) {
            notification.error({
                message: "Update Goal Failed",
                description: error?.response?.data?.message || "Unknown error",
            });
        }
    }

    const handleDeleteTask = async () => {
        if (!title || !title.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please fill in your title",
            });
            return;
        };

        try {
            const res = await deleteTaskAPI(
                task?.idGoal,
                task?.idTask,
            );

            if (res?.data) {
                notification.success({
                    message: "Delete created successfully",
                });
                resetAndCloseModal();
            }
        } catch (error: any) {
            notification.error({
                message: "Delete Goal Failed",
                description: error?.response?.data?.message || "Unknown error",
            });
        }
    }

    return (
        <>
            <Modal
                title="Task Info"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalTaskUpdateOpen}
                onOk={() => handleUpdateTask()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"UPDATE"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Title</span>
                        <TextArea
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        // key={isModalTaskUpdateOpen.toString()}
                        >
                        </TextArea>
                    </div>

                    <div>
                        <span>Start Date</span>
                        <DatePicker value={startDate} onChange={(date) => setStartDate(date)} style={{ width: '100%' }} />
                    </div>

                    <div>
                        <span>End Date</span>
                        <DatePicker value={endDate} onChange={(date) => setEndDate(date)} style={{ width: '100%' }} />
                    </div>

                    <div>
                        <Popconfirm
                            title="Delete task"
                            description="Are you sure to delete this Task?"
                            okText="Yes"
                            cancelText="No"
                            icon={<DeleteOutlined style={{ color: 'red' }} />}
                            onConfirm={() => handleDeleteTask()}
                        >
                            <Button
                                danger
                                type="primary"
                                icon={<Bomb />}
                                iconPosition="end">
                                Delete
                            </Button>
                        </Popconfirm>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default TaskUpdate;