import { ClockCircleOutlined } from "@ant-design/icons";
import { Timeline } from "antd";
import { useEffect, useState } from "react";
import { GoalType } from "../types/Goal/GoalType";
import { TypeofGoal } from "../types/Goal/TypeofGoal";
import { fetchGoalAPI, getTypeofGoalByIdAPI } from "../services/api.me.service";
import { Link, useOutletContext } from "react-router-dom";
type OutletContextType = {
    setHeaderContent: (node: React.ReactNode) => void;
};
const Analytics = () => {
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
