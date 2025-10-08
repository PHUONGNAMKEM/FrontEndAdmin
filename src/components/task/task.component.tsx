import { Card, Checkbox, CheckboxProps, message, notification } from "antd";
import Meta from "antd/es/card/Meta";
import { TaskType } from "../../types/TaskType";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './task.component.scss'
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { changeStatusTask } from "../../services/api.me.service";
import { StarFilled, StarOutlined, UndoOutlined } from "@ant-design/icons";
import { Color } from "antd/es/color-picker";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities"
import { EllipsisVertical } from "lucide-react";

interface TaskProps {
    taskData: TaskType;
    loadTask: () => void;
    onClick: () => void;
}

const Task = ({ taskData, loadTask, onClick }: TaskProps) => {
    // const { attributes, listeners, setNodeRef, transform } = useDraggable({
    //     id: taskData.idTask
    // })

    // const style = transform ? {
    //     transform: `translate(${transform.x}px, ${transform.y}px)`,
    // } : undefined;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: taskData.idTask });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    // const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: taskData.idTask })

    // const isDragging = !!transform;

    // const style = transform ? {
    //     // transform: CSS.Transform.toString(transform),
    //     transform: `translate(${transform.x}px, ${transform.y}px)`,
    //     transition,
    // } : undefined;

    const [messageApi, contextHolder] = message.useMessage();
    const [isDisabled, setIsDisabled] = useState(false);
    const { idGoal } = useParams();

    useEffect(() => {
        setIsDisabled(taskData.isDone);
    }, [taskData.isDone]);

    const onChangeStatus: CheckboxProps['onChange'] = async (e: CheckboxChangeEvent) => {
        const newStatus = e.target.checked;
        setIsDisabled(e.target.checked);

        try {
            const res = await changeStatusTask(idGoal, taskData.idTask, newStatus);
            if (res.data) {
                messageApi.open({
                    type: 'success',
                    content: 'This is a success message',
                });
                loadTask();
            }
        } catch (error) {
            // Rollback UI if api fail
            setIsDisabled(prev => !prev);
        }
    };

    const onRollBackStatus = async () => {
        const rollbackStatus = !taskData.isDone;
        try {
            const res = await changeStatusTask(idGoal, taskData.idTask, rollbackStatus);
            if (res.data) {
                messageApi.open({
                    type: 'success',
                    content: 'Rollback Successfully',
                });
                loadTask();
                setIsDisabled(false);
            }
        } catch (error) {
            // Rollback UI if api fail
            setIsDisabled(prev => !prev);
            messageApi.open({
                type: 'error',
                content: 'Rollback failed!',
            });
        }
    }

    const [starColor, setStarColor] = useState(false);
    const changeStar = () => {
        // setStarColor('rgba(246, 210, 7, 1)');
        //rgb(229, 228, 228)
        setStarColor(prev => !prev);
    }

    return (
        <>
            {/* <div className="matrix-manage-time">
                <div className="important-urgent">Do it now</div>
                <div className="important-not-urgent">Decide - Schedule a time to do it</div>
                <div className="not-important-urgent">Delegate - Who can do it for u</div>
                <div className="not-important-not-urgent">Delete - Eliminate it</div>
            </div> */}

            {contextHolder}
            <div
                ref={setNodeRef}
                style={style}
            >

                <div className={`task ${isDisabled ? "disabled" : ""}`}
                    style={{
                        // ...style,
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: isDisabled ? "#f6f6f6" : "#fff",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.6 : 1,
                        padding: "10px",
                        borderRadius: "5px",
                        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                    }}>

                    <div className="task-content"
                        style={{
                            flex: 1,
                            lineHeight: "22px",
                            color: isDisabled ? "#888" : "#000",
                        }}
                        {...listeners}
                        {...attributes}
                    >
                        {taskData.title}
                    </div>
                    <div className="flex items-center justify-between task-status">
                        <Checkbox onChange={onChangeStatus} disabled={isDisabled} />
                        {/* {
                            !starColor ?
                                <StarOutlined style={{ marginLeft: "8px", fontSize: 18, color: "rgb(229, 228, 228)", fill: 'orange' }} onClick={changeStar} />
                                :
                                <StarFilled style={{ marginLeft: "8px", fontSize: 18, color: "rgba(246, 210, 7, 1)", fill: 'orange' }} onClick={changeStar} />
                        } */}
                        <EllipsisVertical size={16}
                            onClick={() => onClick()}
                        />
                    </div>
                    <UndoOutlined style={{ marginLeft: "8px", position: "relative", fontSize: 16, color: "rgb(94, 94, 94)", cursor: "pointer" }} onClick={onRollBackStatus} />
                </div>
            </div>
        </>
    );
}

export default Task;