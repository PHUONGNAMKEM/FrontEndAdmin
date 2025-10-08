import { CircleFadingPlus } from "lucide-react";
import { createTypeofGoalAPI } from "../../../../services/api.me.service";
import { useState } from "react";
import TypeofGoalAdd from "./typeofGoalAdd";
import { GoalType } from "../../../../types/Goal/GoalType";
import { Button } from "antd";
import './buttonAddNewTypeofGoal.scss'


interface ButtonAddNewTypeofGoalProps {
    idGoal: number | undefined;
    goalData: GoalType;
    loadGoal: () => void;
    loadTypeofGoal: () => void;
}

const ButtonAddNewTypeofGoal = ({ idGoal, goalData, loadGoal, loadTypeofGoal }: ButtonAddNewTypeofGoalProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* <CircleFadingPlus color="#858585" size={"20px"} style={{ marginLeft: "10px", cursor: "pointer" }}

                onClick={() => setIsModalOpen(true)}
            /> */}

            <Button className="border-none no-hover"
                icon={<CircleFadingPlus color="#858585" size={"20px"} style={{ marginLeft: "10px", cursor: "pointer" }} />}
                onClick={() => setIsModalOpen(true)}
                iconPosition={"end"}
            >Create a new label</Button>

            <TypeofGoalAdd
                idGoal={idGoal}
                goalData={goalData}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                loadGoal={loadGoal}
                loadTypeofGoal={loadTypeofGoal}
            />
        </>
    );
}

export default ButtonAddNewTypeofGoal;