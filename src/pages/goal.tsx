
import { Button, Col, Form, notification, Row } from "antd";
import Goal from "../components/goal/goalComponent/goalComponent";
import { useContext, useEffect, useState } from "react";
import { createGoalAPI, fetchGoalAPI, getAllTypeofGoal, getTypeofGoalByIdAPI } from "src/services/api.me.service";
import { GoalType } from "../types/Goal/GoalType";
import { PlusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import GoalAdd from "../components/goal/goalAdd/goalAdd";
import ButtonAddNewGoal from "../components/layout/buttonAddNewGoal/buttonAddNewGoal";
import { AuthContext } from "../components/context/auth.context";
import { TypeofGoal } from "../types/Goal/TypeofGoal";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const GoalPage = () => {

    const [goalData, setGoalData] = useState<GoalType[]>([]);
    const [allTypeofGoalData, setAllTypeofGoalData] = useState<TypeofGoal[]>([]);

    const loadGoal = async () => {
        const res = await fetchGoalAPI();
        if (res.data) {
            setGoalData(res.data);
        }
        console.log(">>> check goal", res)
    }

    const loadTypeofGoal = async () => {
        const res = await getAllTypeofGoal();
        if (res.data) {
            setAllTypeofGoalData(res.data);
            console.log("Type of goal in: ", allTypeofGoalData);
        }
    }

    useEffect(() => {
        loadGoal();
        loadTypeofGoal();
    }, [])

    console.log(">>> check goal data: ", goalData);

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div></div>
                <div>
                    <ButtonAddNewGoal goalData={goalData} loadGoal={loadGoal} />
                </div>
            </div>
            <Row gutter={[16, 16]}>
                {goalData.map((goal) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={goal.idGoal}>
                        <Goal goalData={goal} loadGoal={loadGoal}
                            typeofGoalData={goal.goalTypes.map(goalType => goalType.typeofGoal)}
                            allTypeofGoalData={
                                allTypeofGoalData.filter(t =>
                                    !goal.goalTypes.some(gt =>
                                        // tùy payload: có thể là gt.idTypeGoal hoặc gt.typeofGoal.idTypeGoal
                                        (gt.idTypeGoal ?? gt.typeofGoal.idTypeGoal) === t.idTypeGoal
                                    )
                                )
                            }

                            loadTypeofGoal={loadTypeofGoal}
                        />
                    </Col>
                ))}

            </Row>
        </>
    )
}

export default GoalPage;