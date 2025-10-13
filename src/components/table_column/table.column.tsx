import { TaskType } from "../../types/TaskType";
import './table.column.scss'
import { ColumnTableType } from "../../types/ColumnType";
import Task from "../task/task.component";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DeleteOutlined } from "@ant-design/icons";
import { Ellipsis } from "lucide-react";
import { Dropdown, MenuProps, notification, Popconfirm, Space } from "antd";
import { deleteColumnAPI, deleteTaskAPI } from "../../services/api.me.service";
import { useParams } from "react-router-dom";
import AddNewTask from "../ui/add/addTask";
import { useState } from "react";
import TaskUpdate from "../task/taskUpdate/taskUpdate";
import TableColumnUpdate from "./tableColumnUpdate/tableColumnUpdate";

interface TableColumnProps {
    column: ColumnTableType;
    tasks: TaskType[];
    loadTask: () => void;
    loadColumn: () => void;
    handleClickTask: (task: TaskType) => void;
}

const TableColumn = ({ column, tasks, loadTask, loadColumn, handleClickTask }: TableColumnProps) => {
    // const { setNodeRef } = useDroppable({
    //     id: column.idColumn
    // })

    const { idGoal } = useParams();

    const { setNodeRef } = useDroppable({
        id: `column-${column.idColumn}`,
    });

    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState<ColumnTableType | null>(null);

    const items: MenuProps['items'] = [
        {
            key: '1',
            label: 'Options',
            // icon: <SettingOutlined />,
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: '2',
            label: <Popconfirm
                title="Delete column"
                description="Are you sure to delete this column?"
                okText="Yes"
                cancelText="No"
                icon={<DeleteOutlined style={{ color: 'red' }} />}
                onConfirm={
                    () => {
                        if (idGoal && column.idColumn) {
                            handleDeleteColumn(Number(idGoal), column.idColumn)
                        }
                        return;
                    }
                }
            >
                Delete
            </Popconfirm>,
        },
        {
            key: '3',
            label: <p
                onClick={() => {
                    setSelectedColumn(column);
                    setIsUpdateOpen(true);
                }}
            >
                Update
            </p>
        },
    ];

    const handleDeleteColumn = async (idGoal: number, idColumn: number) => {
        const res = await deleteColumnAPI(idGoal, idColumn);
        const res2 = await deleteTaskAPI(idGoal, idColumn);
        if (res.data) {
            notification.success(
                {
                    message: "Delete A Column",
                    description: "Successfully",
                    duration: 2,
                    showProgress: true,
                }
            )
            loadColumn();
        }
        else {
            notification.error(
                {
                    message: "Error Delete A Column Failed",
                    description: JSON.stringify(res.data.message),
                    duration: 3,
                    showProgress: true,
                }
            )
        }
    }

    return (
        <div className="flex flex-col rounded-lg p-2 min-h-[100px]" ref={setNodeRef}
            style={{
                backgroundColor: "#F0F2F5",
                boxShadow: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px"
            }}>
            <div className="flex items-center justify-between column-header">
                <h2 className="mb-2 text-xl font-semibold text-neutral-100" style={{ color: "#172B4D" }}>{column.title}</h2>
                <Dropdown menu={{ items }} placement="topRight">
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <Ellipsis style={{ fontSize: "20px", cursor: "pointer" }} />
                        </Space>
                    </a>
                </Dropdown>
            </div>
            <div className="flex flex-col flex-1 gap-4"
            >
                <SortableContext
                    id={`column-${column.idColumn}`}
                    items={tasks.map(task => task.idTask)}

                    // id={column.idColumn.toString()}
                    // items={tasks.map((task) => task.idTask.toString())}

                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <Task key={task.idTask} taskData={task} loadTask={loadTask} onClick={() => handleClickTask(task)} />
                    ))}
                </SortableContext>

                <AddNewTask column={column} loadColumn={loadColumn} loadTask={loadTask} />
            </div>
            <div>
                {
                    <TableColumnUpdate
                        isModalOpen={isUpdateOpen}
                        setIsModalOpen={setIsUpdateOpen}
                        column={selectedColumn}
                        loadColumn={loadColumn}
                    />
                }
            </div>
        </div >
    )
}

export default TableColumn;