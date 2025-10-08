import { Button, ColorPicker, DatePicker, Dropdown, Flex, GetProp, Image, Input, InputNumber, MenuProps, Modal, notification, Popconfirm, Progress, Radio, Select, Space, Tag, Upload, UploadFile, UploadProps } from "antd";
import { useEffect, useState } from "react";
import { HiOutlineBookmark } from "react-icons/hi";
import { Link } from "react-router-dom";
import { GoalType } from "../../../../types/Goal/GoalType";
import dayjs, { Dayjs, extend } from "dayjs";
import { DashOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { createGoalAPI, createTypeofGoalAPI, deleteGoalAPI } from "../../../../services/api.me.service";
import TextArea from "antd/es/input/TextArea";
import { RcFile } from "antd/es/upload";
import { AxiosResponse } from "axios";

interface TypeofGoalAddProps {
    goalData: GoalType;
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    loadGoal: () => void;
    idGoal: number | undefined;
    loadTypeofGoal: () => void;
}

const TypeofGoalAdd = ({ goalData, isModalOpen, setIsModalOpen, loadGoal, idGoal, loadTypeofGoal }: TypeofGoalAddProps) => {

    const [nameType, setNameType] = useState("");
    const [colorHex, setColorHex] = useState('#1677ff');


    useEffect(() => {

    }, [goalData])

    const handleCreateGoal = async () => {
        if (!nameType || !colorHex) {
            notification.error({
                message: "Missing fields",
                description: "Please fill in all required fields. (NameType or Theme)",
            });
            return;
        }

        try {
            const res = await createTypeofGoalAPI(
                nameType,
                colorHex,
                idGoal
            );

            if (res.data) {
                // notification.success({
                //     message: "Type of Goal created successfully",
                // });
                resetAndCloseModal();
            }
            else {
                throw new Error(res.message || "Unexpected response");
            }

            console.log(">>> check res: ", res);
        } catch (error: any) {
            console.log(">>> check error: ", error);
            // console.log(error.response?.data?.message);

            notification.error({
                message: "Create Goal Failed",
                description: error?.response?.data?.message || error.message || "Unknown error",
            });
        }
    };

    const resetAndCloseModal = () => {
        setNameType("");
        setColorHex("#1677ff");
        setIsModalOpen(false);
        loadGoal();
        loadTypeofGoal();
    };

    return (
        <div className="user-form">
            <Modal
                title="Create New Type"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpen}
                onOk={() => handleCreateGoal()}
                onCancel={() => resetAndCloseModal()}
                maskClosable={false}
                okText={"CREATE"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Name</span>
                        <Input
                            placeholder="Enter Name for Type of Goal"
                            value={nameType}
                            onChange={(event) => setNameType(event.target.value)} />
                    </div>
                    <div>
                        <span>Theme</span>
                        <TextArea
                            placeholder="Your style..."
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            value={colorHex}
                            onChange={(e) => setColorHex(e.target.value)}
                        />
                        <ColorPicker value={colorHex}
                            size="small"
                            onChange={(color) => {
                                const hex = color.toHexString();
                                setColorHex(hex);
                            }}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default TypeofGoalAdd;