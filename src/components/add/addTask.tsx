import { Input, Button, notification, DatePicker, DatePickerProps } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { ColumnTableType } from "../../types/ColumnType";
import { createTaskAPI } from "src/services/api.me.service";

type AddColumnTitleProps = {
    loadColumn: () => void;
    loadTask: () => void;

    column: ColumnTableType;
}

const AddNewTask = ({ column, loadTask }: AddColumnTitleProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [titleTask, setTitleTask] = useState("");
    const [dueDate, setDueDate] = useState<Dayjs | null>(null);
    const { idGoal } = useParams();

    const handleAdd = async () => {
        if (!titleTask.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please enter the title",
            });
            return;
        };

        if (!dueDate || dueDate === null) {
            notification.error({
                message: "Choose Due date",
                description: "Please enter your due date",
            });
            return;
        };

        try {
            const res = await createTaskAPI(
                titleTask,
                dueDate,
                idGoal,
                column.idColumn
            );

            if (res?.data) {
                notification.success({
                    message: "Add new task",
                });
                setTitleTask("");
                setIsAdding(false);
                await loadTask();
            }
            else {
                // throw new Error(res.message);
                throw new Error();
            }
        } catch (error) {
            notification.error({
                message: "Failed",
            });
        }
    };

    const selectDueDate: DatePickerProps['onChange'] = (date, dateString) => {
        console.log(">> check date: ", date);
        console.log(">> check  dateString: ", dateString);

        setDueDate(date);
    };

    return (
        <div style={{ padding: "10px", background: "#e6f4ff", borderRadius: 8 }}>
            {isAdding ? (
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                    <Input
                        placeholder="Enter task name..."
                        value={titleTask}
                        onChange={(e) => setTitleTask(e.target.value)}
                        autoFocus
                    />
                    <DatePicker onChange={selectDueDate} placeholder="Select due Date" />
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button type="primary" onClick={handleAdd}>Add task</Button>
                        <Button onClick={() => setIsAdding(false)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button type="dashed" onClick={() => setIsAdding(true)}>+ Add a new task</Button>
            )}
        </div>
    );
};

export default AddNewTask;
