import { DatePicker, Input, Modal, notification, Radio } from "antd";
import RichEditor from "../../ui/richTextEditor/RichEditor";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ColumnTableType } from "../../../types/ColumnType";
import { updateTitleColumnAPI } from "../../../services/api.me.service";
import TextArea from "antd/es/input/TextArea";

interface ColumnUpdateProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    column: ColumnTableType | null;
    loadColumn: () => void;
}

const TableColumnUpdate = ({ isModalOpen, setIsModalOpen, column, loadColumn }: ColumnUpdateProps) => {

    const [title, setTitle] = useState<string | undefined>("");
    const [titleStorage, setTitleStorage] = useState<string | undefined>("");

    const resetAndCloseModal = () => {
        setIsModalOpen(false);
        loadColumn();
    };

    useEffect(() => {
        if (column) {
            setTitle(column?.title);
            setTitleStorage(column.title);
        }
    }, [column]);


    const handleUpdateColumn = async () => {
        if (!title || !title.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please fill in your title",
            });
            return;
        };

        if (title.trim() === titleStorage?.trim()) {
            notification.info({
                message: "No changes detected",
                description: "You haven't modified the title.",
            });
            return;
        }

        try {
            const res = await updateTitleColumnAPI(
                column?.idGoal,
                column?.idColumn,
                title,
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

    return (
        <>
            <Modal
                title="Update Title"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={() => handleUpdateColumn()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"UPDATE"}
            >
                <div className="flex gap-[15px] flex-col mt-4">
                    <div>
                        {/* <span>Title</span> */}
                        <TextArea
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        >
                        </TextArea>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default TableColumnUpdate;