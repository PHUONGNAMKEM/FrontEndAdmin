import { useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import { getAllColumnAPI, getTaskByIdGoal, updateTaskColumn, updateTaskOrders } from "src/services/api.me.service";
import { useParams } from "react-router-dom";
import { closestCorners, DndContext, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { TaskType } from "src/types/TaskType";
import { ColumnTableType } from "src/types/ColumnType";
import TableColumn from "@components/table_column/table.column";
import AddColumnTitle from "@components/ui/add/addList";
import TaskUpdate from "@components/task/taskUpdate/taskUpdate";

const TaskPage = () => {

    const [taskData, setTaskData] = useState<TaskType[]>([]);
    const [columnData, setColumnData] = useState<ColumnTableType[]>([]);
    const { idGoal } = useParams();

    const loadTask = async () => {
        const res = await getTaskByIdGoal(idGoal);
        if (res.data) {
            setTaskData(res.data);
        }
    }

    const loadColumn = async () => {
        const res = await getAllColumnAPI(idGoal);
        if (res.data) {
            setColumnData(res.data);
        }
    }

    useEffect(() => {
        loadTask();
        loadColumn();
    }, [])

    // Sử dụng use Ref để lưu lại giá trị của activeTask và targetColumnId và sử dụng lại trong handleDragEnd
    // Khi người dùng drag (đang kéo) chưa thả -> lưu vào Ref: dragInfoRef
    const dragInfoRef = useRef
        <
            {
                task?: TaskType;
                targetColumnId?: number;
            }
            | null
        >(null);

    const handleDragOver = async (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        setTaskData((tasks) => {
            console.log(">>> check tasks: ", tasks)
            const activeIndex = tasks.findIndex((t) => t.idTask === active.id);
            const overIndex = tasks.findIndex((t) => t.idTask === over.id);
            const activeTask = tasks[activeIndex];
            console.log(">>> check active.id: ", active.id)
            console.log(">>> check activeIndex: ", activeIndex)
            console.log(">>> check activeTask: ", activeTask)

            // Xác định cột đích: over.id có thể là id cột (column-<id>)
            let targetColumnId: number | undefined;
            if (typeof over.id === 'string' && over.id.startsWith('column-')) {
                targetColumnId = Number(over.id.split('-')[1]);
            } else {
                targetColumnId = tasks[overIndex]?.idColumn;
            }

            // Lưu vào ref để dùng lại trong handleDragEnd
            dragInfoRef.current = {
                task: activeTask,
                targetColumnId,
            };

            // Nếu kéo sang cột khác thì cập nhật idColumn
            if (targetColumnId && targetColumnId !== activeTask.idColumn) {
                return tasks.map((t) =>
                    t.idTask === activeTask.idTask ? { ...t, idColumn: targetColumnId! } : t,
                );
            }

            // Nếu vẫn trong cùng cột thì sắp xếp lại
            if (overIndex !== -1 && tasks[activeIndex].idColumn === tasks[overIndex].idColumn) {
                return arrayMove(tasks, activeIndex, overIndex);
            }
            return tasks;
        });
    };

    // Hàm này không cần thiết (nó xảy ra khi người dùng thả chuột - hoàn tất kéo thả)
    const handleDragEnd = async (event: DragEndEvent) => {
        const { task, targetColumnId } = dragInfoRef.current || {};
        if (!task || targetColumnId === undefined) return;

        console.log(">>> check task: ", task)
        console.log(">>> check targetColumnId: ", targetColumnId)

        // Cập nhật lại idColumn của task được kéo thả
        await updateTaskColumn(Number(idGoal), task.idTask, targetColumnId);

        // Cập nhật lại thứ tự của các task trong cùng 1 column (khi kéo thả task mới vào column đó)
        const tasksInTargetColumn = taskData
            .filter((t) =>
                t.idTask === task.idTask
                    ? true // lấy ra task mới vừa thả vô
                    : t.idColumn === targetColumnId // giữ lại những tasks khác của column được thả vô
            )
            .map((task, index) => ({ idTask: task.idTask, priority: index }));
        console.log(">>> check tasksInTargetColumn: ", tasksInTargetColumn);

        await updateTaskOrders(Number(idGoal), tasksInTargetColumn);
        dragInfoRef.current = null;
    };

    const [isModalUpdateTaskOpen, setIsModalUpdateTaskOpen] = useState(false);
    const [taskSelected, setTaskSelected] = useState<TaskType | null>(null);
    const handleClickTask = (task: TaskType) => {
        setTaskSelected(task);
        setIsModalUpdateTaskOpen(true);
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <DndContext
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <Row gutter={[8, 8]} className="w-full">
                    {columnData.map((column) => (
                        <Col xs={24} sm={12} md={8} lg={8} key={column.idColumn}>
                            <TableColumn
                                key={column.idColumn}
                                column={column}
                                tasks={taskData.filter(task => task.idColumn === column.idColumn)}
                                loadTask={loadTask}
                                loadColumn={loadColumn}
                                handleClickTask={handleClickTask}
                            />
                        </Col>
                    ))}
                </Row>
            </DndContext>
            <AddColumnTitle loadColumn={loadColumn} />

            <div>
                {
                    <TaskUpdate
                        isModalTaskUpdateOpen={isModalUpdateTaskOpen}
                        setIsModalTaskUpdateOpen={setIsModalUpdateTaskOpen}
                        task={taskSelected}
                        loadTask={loadTask}
                    />
                }
            </div>
        </div>
    );
}

export default TaskPage;