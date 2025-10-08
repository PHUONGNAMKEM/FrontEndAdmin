import { Button, Checkbox, CheckboxProps, ColorPicker, Divider, Flex, Modal, notification, Popconfirm } from "antd";
import { useEffect, useState } from "react";

import TextArea from "antd/es/input/TextArea";
import { DeleteOutlined } from "@ant-design/icons";
import { Bomb, Pencil, X } from "lucide-react";
import { TaskType } from "../../../../types/TaskType";
import { GoalType } from "../../../../types/Goal/GoalType";
import { addTypeofGoalToGoalTypeAPI, deleteAllTypeofGoalAPI, deleteTypeofGoalAPI, updateTypeofGoalAPI } from "src/services/api.me.service";
import { TypeofGoal } from "../../../../types/Goal/TypeofGoal";
import ButtonAddNewTypeofGoal from "../typeofGoalAdd/buttonAddNewTypeofGoal";
import { GoalTypeBetween } from "../../../../types/Goal/GoalTypeBetween";

interface TypeofGoalUpdateProps {
    isModalTypeofGoalUpdateOpen: boolean;
    setIsModalTypeofGoalUpdateOpen: (open: boolean) => void;
    typeofGoalData?: TypeofGoal[];
    loadGoal: () => void;
    allTypeofGoalData: TypeofGoal[];
    task?: TaskType | null;
    loadTask?: () => void;
    goal: GoalType;
    loadTypeofGoal: () => void;
}

const TypeofGoalUpdate = ({ isModalTypeofGoalUpdateOpen, setIsModalTypeofGoalUpdateOpen, task, typeofGoalData, goal, loadGoal, allTypeofGoalData, loadTypeofGoal }: TypeofGoalUpdateProps) => {

    const [nameType, setNameType] = useState<string | undefined>("");
    const [theme, setTheme] = useState<string | undefined>("");
    const [idTypeGoal, setIdTypeGoal] = useState<number>(0);
    const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

    const resetAndCloseModalView = () => {
        setIsModalTypeofGoalUpdateOpen(false);
    };

    const resetAndCloseModalUpdate = () => {
        setIsModalUpdateOpen(false);
        loadGoal();
        loadTypeofGoal();
    };

    useEffect(() => {
        // loadTypeofGoal();
    }, [allTypeofGoalData]);


    const handleUpdateTypeofGoal = async () => {
        if (!nameType || !nameType.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please fill in your Name Type",
            });
            return;
        };
        if (!theme || !theme.trim()) {
            notification.error({
                message: "Missing Title",
                description: "Please fill in your Name Type",
            });
            return;
        };

        try {
            const res = await updateTypeofGoalAPI(
                nameType,
                theme,
                idTypeGoal
            );

            if (res?.data) {
                resetAndCloseModalUpdate();
            }
        } catch (error: any) {
            notification.error({
                message: "Update TypeofGoal Failed",
                description: error?.response?.data?.message || "Unknown error",
            });
        }
    }

    const handleSetDataTypeofGoal = async (nameTypeVar: string, themeVar: string, idTypeGoal: number) => {
        setIsModalUpdateOpen(true);
        setNameType(nameTypeVar);
        setTheme(themeVar);
        setIdTypeGoal(idTypeGoal);
    }

    const handleDeleteTypeofGoal = async (idTypeGoal: number) => {
        // Kiểm tra: nếu là type của goal đó (typeofGoalData) -> thì gọi API xóa bảng goalType
        const inTypeofGoalData = typeofGoalData!.some(
            (gt) => gt.idTypeGoal === idTypeGoal
        );

        // Kiểm tra: nếu là type trong bảng typeofGoal (tất cả các type) -> thì gọi API xóa bảng typeofGoal
        const inAllTypeofGoalData = allTypeofGoalData.some(
            (t) => t.idTypeGoal === idTypeGoal
        );

        try {
            if (inTypeofGoalData) {
                const res = await deleteTypeofGoalAPI(idTypeGoal, goal.idGoal);

                if (res?.data) {
                    resetAndCloseModalUpdate();
                }
            }
            else {
                const res = await deleteAllTypeofGoalAPI(idTypeGoal);

                if (res?.data) {
                    resetAndCloseModalUpdate();
                }
            }

        } catch (error: any) {
            notification.error({
                message: "Delete TypeofGoal Failed",
                description: error?.response?.data?.message || "Unknown error",
            });
        }
    }



    const handleSelectTypeofGoal: CheckboxProps['onChange'] = async (e) => {
        try {
            const res = await addTypeofGoalToGoalTypeAPI(e.target.value, goal.idGoal);

            if (res.data) {
                loadGoal();
                loadTypeofGoal();
            }
        } catch (error: any) {
            notification.error({
                message: "Create Goal Failed",
                description: error?.response?.data?.message || error.message || "Unknown error",
            });
        }
    };

    return (
        <>
            <Modal
                title={goal.title}
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalTypeofGoalUpdateOpen}
                // onOk={() => resetAndCloseModalView()}
                onCancel={() => resetAndCloseModalView()}
                maskClosable={false}
                okText={"OK"}
                footer={[
                    <Button key="ok" type="primary" onClick={() => resetAndCloseModalView()}>
                        Ok
                    </Button>
                ]}
            >
                <Divider>All TypeofGoal - Select your Label</Divider>

                <div>
                    {allTypeofGoalData!.map(type => {
                        return (
                            <Flex justify="space-between" gap={12} className="mb-1" key={type.idTypeGoal}>
                                <Checkbox
                                    value={type.idTypeGoal}
                                    checked={typeofGoalData?.some(gt => gt.idTypeGoal === type.idTypeGoal)}
                                    onChange={(e) => {
                                        // handleSetDataTypeofGoal(type?.nameType, type?.theme, type?.idTypeGoal);
                                        handleSelectTypeofGoal(e)
                                    }}></Checkbox>

                                <div
                                    onClick={() => setIsModalTypeofGoalUpdateOpen(true)}
                                    key={type.idTypeGoal}
                                    className="
                                        px-2 py-0.5 text-sm rounded border flex-1 
                                        [color:var(--primary)]
                                        [border-color:color-mix(in_oklch,var(--primary)_75%,white)]
                                        [background-color:color-mix(in_oklch,var(--primary)_12%,white)]
                                    "
                                    style={
                                        {
                                            '--primary': type?.theme || '#1677ff',
                                            fontWeight: 400,
                                        } as React.CSSProperties
                                    }
                                >

                                    <div className="flex justify-between">
                                        {
                                            type?.nameType
                                        }
                                    </div>
                                </div>
                                <Pencil size={20} color="#737373" className="cursor-pointer"
                                    onClick={() => handleSetDataTypeofGoal(type?.nameType, type?.theme, type?.idTypeGoal)}
                                />
                            </Flex>
                        );
                    })}
                </div>
                <Divider>Your Label</Divider>

                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        {typeofGoalData!.map(type => {
                            return (
                                <Flex justify="space-between" gap={12} className="mb-1">
                                    <div
                                        onClick={() => setIsModalTypeofGoalUpdateOpen(true)}
                                        key={type.idTypeGoal}
                                        className="
                                        px-2 py-0.5 text-sm rounded border flex-1 
                                        [color:var(--primary)]
                                        [border-color:color-mix(in_oklch,var(--primary)_75%,white)]
                                        [background-color:color-mix(in_oklch,var(--primary)_12%,white)]
                                    "
                                        style={
                                            {
                                                '--primary': type?.theme || '#1677ff',
                                                fontWeight: 400,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <div className="flex justify-between">
                                            {
                                                type?.nameType
                                            }
                                            <X size={20} color="#737373" className="cursor-pointer"
                                                onClick={() => handleDeleteTypeofGoal(type?.idTypeGoal)}
                                            />
                                        </div>
                                    </div>

                                    <Pencil size={20} color="#737373" className="cursor-pointer"
                                        onClick={() => handleSetDataTypeofGoal(type?.nameType, type?.theme, type?.idTypeGoal)}
                                    />
                                </Flex>
                            );
                        })}
                    </div>

                    <div className="text-xl">
                        <ButtonAddNewTypeofGoal
                            idGoal={goal.idGoal}
                            goalData={goal}
                            loadGoal={loadGoal}
                            loadTypeofGoal={loadTypeofGoal}
                        />
                    </div>
                </div>
            </Modal>

            <Modal
                title="Update Type"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalUpdateOpen}
                onOk={() => handleUpdateTypeofGoal()}
                onCancel={() => resetAndCloseModalUpdate()}
                maskClosable={false}
                okText={"UPDATE"}
            >
                <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
                    <div>
                        <span>Name Type</span>
                        <TextArea
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            value={nameType}
                            onChange={(e) => setNameType(e.target.value)}
                        // key={isModalTaskUpdateOpen.toString()}
                        >
                        </TextArea>
                    </div>
                    <div>
                        <span>Theme</span>
                        <TextArea
                            autoSize={{ minRows: 1, maxRows: 6 }}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        // key={isModalTaskUpdateOpen.toString()}
                        >
                        </TextArea>

                        <ColorPicker value={theme}
                            size="small"
                            onChange={(color) => {
                                const hex = color.toHexString();
                                setTheme(hex);
                            }}
                        />
                    </div>


                    <div>
                        <Popconfirm
                            title="Delete Label"
                            description="This will remove this label from all goal?"
                            okText="Yes"
                            cancelText="No"
                            icon={<DeleteOutlined style={{ color: 'red' }} />}
                            onConfirm={() => handleDeleteTypeofGoal(idTypeGoal)}
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

export default TypeofGoalUpdate;