import { ClockCircleOutlined } from "@ant-design/icons";
import { Timeline } from "antd";
import { useEffect, useState } from "react";
import { GoalType } from "../types/Goal/GoalType";
import { TypeofGoal } from "../types/Goal/TypeofGoal";
import { fetchGoalAPI, getTypeofGoalByIdAPI } from "../services/api.me.service";
import ButtonAddNewGoal from "../components/layout/buttonAddNewGoal/buttonAddNewGoal";
import { Link, useOutletContext } from "react-router-dom";
type OutletContextType = {
    setHeaderContent: (node: React.ReactNode) => void;
};
const Analytics = () => {
    // const [goalData, setGoalData] = useState<GoalType[]>([]);
    // const [typeofGoalData, setTypeofGoalData] = useState<TypeofGoal[]>([]);

    // const loadGoal = async () => {
    //     const res = await fetchGoalAPI();
    //     if (res.data) {
    //         setGoalData(res.data);
    //     }
    //     console.log(">>> check goal", res)
    // }

    // const loadTypeofGoal = async () => {
    //     const res = await getTypeofGoalByIdAPI(1);
    //     if (res.data) {
    //         setTypeofGoalData(res.data);
    //         console.log("Type of goal in: ", typeofGoalData);
    //     }
    // }

    // useEffect(() => {
    //     loadGoal();
    //     loadTypeofGoal();
    // }, [])
    // return (
    //     <>
    //         <h1>Analytics Page</h1>
    //         <Timeline
    //             mode="alternate"
    //             items={[
    //                 {
    //                     children: <><p>Create a new Goal</p> <ButtonAddNewGoal goalData={goalData} loadGoal={loadGoal} /></>,
    //                 },
    //                 {
    //                     children: <>
    //                         {/* <Link to={`/goal/${goalData[0].idGoal}/tasks/`} className="goal-card-title"
    //                         style={{
    //                             fontSize: "20px",
    //                             lineHeight: "24px",
    //                             fontWeight: "500",
    //                             marginBottom: "6px",
    //                             color: "rgba(70, 69, 60, 1)",
    //                             display: "-webkit-box",
    //                             WebkitLineClamp: 2,
    //                             WebkitBoxOrient: "vertical",
    //                             overflow: "hidden",
    //                             textOverflow: "ellipsis",
    //                         }}>{goalData.title}</Link> */}

    //                         <p>Create your first list of a task</p>
    //                     </>,
    //                     color: 'green',
    //                 },
    //                 {
    //                     dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
    //                     children: `Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    //                 },
    //                 {
    //                     color: 'red',
    //                     children: 'Network problems being solved 2015-09-01',
    //                 },
    //                 {
    //                     children: 'Create a services site 2015-09-01',
    //                 },
    //                 {
    //                     dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
    //                     children: 'Technical testing 2015-09-01',
    //                 },
    //             ]}
    //         />
    //     </>
    // );

    const { setHeaderContent } = useOutletContext<OutletContextType>();

    useEffect(() => {
        setHeaderContent(
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Analytics Management</h2>
                <button className="btn-primary">+ New Analytic</button>
            </div>
        );

        // cleanup: khi rời khỏi page thì clear header
        return () => setHeaderContent(null);
    }, [setHeaderContent]);

    return <div>Đây là content của Analytics Page</div>;
}

export default Analytics;
