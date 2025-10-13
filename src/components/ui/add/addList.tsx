import { Input, Button, notification } from "antd";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createColumnAPI } from "src/services/api.me.service";

type AddColumnTitleProps = {
    loadColumn: () => void;
}

const AddColumnTitle = ({ loadColumn }: AddColumnTitleProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [titleColumn, setTitleColumn] = useState("");
    const { idGoal } = useParams();

    const handleAdd = async () => {
        if (!titleColumn.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please enter the title",
            });
            return;
        };

        try {
            const res = await createColumnAPI(
                idGoal,
                titleColumn,
            );

            if (res?.data) {
                notification.success({
                    message: "Add new column",
                });
                setTitleColumn("");
                setIsAdding(false);
                await loadColumn();
            }
        } catch (error) {
            notification.error({
                message: "Failed",
            });
        }
    };

    return (
        <div style={{ padding: "10px", background: "#e6f4ff", borderRadius: 8, width: 200 }}>
            {isAdding ? (
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                    <Input
                        placeholder="Enter list name..."
                        value={titleColumn}
                        onChange={(e) => setTitleColumn(e.target.value)}
                        autoFocus
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                        <Button type="primary" onClick={handleAdd}>Add list</Button>
                        <Button onClick={() => setIsAdding(false)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button type="dashed" onClick={() => setIsAdding(true)}>+ Add list</Button>
            )}
        </div>
    );
};

export default AddColumnTitle;
