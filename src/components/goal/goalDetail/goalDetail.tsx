import { LeftCircleOutlined } from "@ant-design/icons";
import { Card, DatePicker, notification, Space } from "antd";
import Meta from "antd/es/card/Meta";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";

const GoalDetail = () => {
    const { id } = useParams(); // get id from url
    const { RangePicker } = DatePicker;

    // time default will be replaced by the value of API
    const defaultStart = dayjs('2025-07-18 08:00:00', 'YYYY-MM-DD HH:mm:ss');
    const defaultEnd = dayjs('2025-07-20 18:00:00', 'YYYY-MM-DD HH:mm:ss');


    const handleChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null, dateString: [string, string]) => {

        console.log("Check typeof date:", typeof (dates));
        console.log("Check date:", dates);

        console.log("Check typeof values:", typeof (dateString));
        console.log("Check values:", dateString);

        if (!dates || !dates[0] || !dates[1]) return;

        const [, selectedEnd] = dates;

        const diffInDays = selectedEnd!.diff(defaultEnd, 'day');

        if (diffInDays > 10) {
            notification.error({
                message: "Update time end",
                description: "Do you want to update end day?",
            });
        }
    }

    return (
        <div>
            <div style={{ margin: "10px 0" }}>

                <p>Goal detail with id: {id}</p>
                <Space direction="vertical" size={12}>
                    <RangePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        defaultValue={[defaultStart, defaultEnd]}
                        onChange={handleChange}
                        style={{ width: 400 }}
                        allowClear
                        placeholder={['Chọn ngày bắt đầu', 'Chọn ngày kết thúc']}
                    />
                </Space>
            </div>

            <Card
                hoverable
                style={{ width: 240, boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
                cover={<img alt="example" src="https://images.unsplash.com/photo-1635215277614-5bea1b092836?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZnVqaXxlbnwwfHwwfHx8MA%3D%3D" />}
            >
                <Meta title="Europe Street beat" description="www.instagram.com" />
            </Card>


            <Link to={'/goal'}>
                <LeftCircleOutlined style={{
                    position: "absolute",
                    bottom: "1rem",
                    right: "1rem",
                    fontSize: "24px",
                    color: "#969696"
                }} />
            </Link>
        </div>
    );
}

export default GoalDetail;