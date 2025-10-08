import { Button } from "antd";
import { GoalType } from "../../../types/Goal/GoalType"
import GoalAdd from "../../goal/goalAdd/goalAdd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

interface ButtonAddNewGoalProps {
    goalData: GoalType[];
    loadGoal: () => void;
}

const ButtonAddNewGoal = ({ goalData, loadGoal }: ButtonAddNewGoalProps) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                type="primary"
                icon={<PlusCircleOutlined />}
                iconPosition="end"
                className="mb-4"
            >
                Add A New Goal
            </Button>
            <GoalAdd
                goalData={goalData}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                loadGoal={loadGoal}
            />
        </>
    );
}

export default ButtonAddNewGoal;