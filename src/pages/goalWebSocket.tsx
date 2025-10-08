
import { Col, Row } from "antd";
import Goal from "../components/goal/goalComponent/goalComponent";
import { useEffect, useRef, useState } from "react";
import { fetchGoalAPI } from "../services/api.me.service";
import { GoalType } from "../types/Goal/GoalType";
import { io, Socket } from "socket.io-client";


// const socket = io(import.meta.env.VITE_BACKEND_URL);
const GoalPage = () => {

    const [goalData, setGoalData] = useState<GoalType[]>([]);
    const socketRef = useRef<Socket>();

    const loadGoal = async () => {
        const res = await fetchGoalAPI();
        if (res.data) {
            setGoalData(res.data);
        }
        console.log(">>> check goal", res)

    }
    useEffect(() => {
        loadGoal();

        socketRef.current = io(import.meta.env.VITE_BACKEND_URL);
        // Lắng nghe sự change từ server 8080
        socketRef.current.on("goalUpdated", () => {
            console.log("Goal changed! Reloading...");
            loadGoal();
        });

        return () => {
            socketRef.current?.disconnect(); // cleanup khi unmount
        };
    }, [])


    return (

        <Row gutter={[16, 16]}>
            {/* <Col xs={24} sm={12} md={8} lg={6}><Goal goalData={goalData} /></Col> */}
            {goalData.map((goal) => (
                <Col xs={24} sm={12} md={8} lg={6} key={goal.idGoal}>
                    {/* <Goal goalData={goal} loadGoal={loadGoal} /> */}
                </Col>
            ))}

            {/* <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col>
            <Col xs={24} sm={12} md={8} lg={6}><Goal /></Col> */}
        </Row>
    )
}

export default GoalPage;