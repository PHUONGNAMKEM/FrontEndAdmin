import { ArrowRightOutlined } from "@ant-design/icons";
import { Avatar, Button, Col, Divider, Form, Input, message, notification, Row } from "antd";
import { FormProps, Link, Navigate, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "@components/context/auth.context";
import { IRegisterFormValues } from "src/interface/IRegisterFormValues";
import { loginAPI } from "src/services/api.services";
import { startConnection } from "src/services/signalr";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import { Check } from "lucide-react";

const LoginPage = () => {

    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { setUser } = useContext(AuthContext);

    const onFinish = async (values: IRegisterFormValues) => {
        setIsLoading(true);
        const res = await loginAPI(values.username, values.password);
        console.log(">>> check res: ", res);

        console.log(">>> check username", values.username);
        console.log(">>> check password", values.password);

        if (res.data) {
            message.success("Login successfully");
            setIsLoading(false);
            localStorage.setItem("access_token", res.data.access_token);
            // await startConnection();
            localStorage.setItem("role", res.data.user.role.name);
            localStorage.setItem("username", res.data.user.username);
            localStorage.setItem("userId", res.data.user.id);
            setUser(res.data.user);

            console.log(">>> check first login: ", res.data.user.is_first_login);
            const hasChangedPassword = localStorage.getItem("hasChangedPassword");
            if (res.data.user.role.name === "Employee" || res.data.user.role.name === "User") {
                if (res.data.user.is_first_login && !hasChangedPassword) {
                    navigate("/guide");
                } else {
                    console.log(">>> congrats");
                    navigate("/congrats");
                }
            }
            else {
                navigate("/overview");
            }
        }
        else {
            notification.error({
                message: "Error Login",
                description: JSON.stringify(res.message || "Unknown error")
            })
        }
        setIsLoading(false);
    }

    return (
        <>
            <Row justify={"center"} align="middle" style={{ minHeight: "100vh" }} >

                <Col xs={24} sm={24} md={16} lg={8} style={{ padding: "0 10px" }}>
                    {/* <fieldset style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: 8,
                        padding: 16,
                        margin: 5,
                        boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
                    }}> */}
                    {/* <legend style={{ padding: "0 8px" }}>Đăng Nhập</legend> */}
                    <div className="flex items-center">
                        {/* <IconWrapper Icon={Check} /> */}
                        <Avatar size={64} src={'/images/logo2.png'} />
                        <span className="text-2xl">HRM Admin</span>
                    </div>

                    <div className="w-full h-20"></div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        style={{ margin: "10px" }}
                    >

                        <h2 style={{ margin: "10px 0", textAlign: "left", }} className="text-6xl font-bold w-[70%]">Holla, Welcome Back</h2>
                        <div className="w-full h-5"></div>

                        <h2 style={{ margin: "10px 0", textAlign: "left", }} className="text-xl text-neutral-500">Hello, welcome back to your special place!</h2>

                        <div className="w-full h-20"></div>

                        {/* <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email!'
                                    },
                                    {
                                        type: 'email',
                                        message: 'Please enter a valid email address!'
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item> */}
                        <Form.Item
                            label="FullName"
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your full name!'
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input your password!'
                                },
                            ]}
                        >
                            <Input.Password onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    form.submit();
                                }
                            }} />
                        </Form.Item>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Button loading={isLoading} type="primary" onClick={() => form.submit()}>Login</Button>
                            <Link to="/" style={{ display: "flex", alignItems: "center" }}>Go to homepage
                                <ArrowRightOutlined style={{ margin: "0 5px" }} />
                            </Link>
                        </div>
                    </Form>
                    {/* <hr style={{ borderTop: " 1px solid #eee", margin: "24px 0" }} /> */}
                    <Divider />

                    {/* <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span>No account yet? </span>
                            <Link to="/register" style={{ marginLeft: 4 }}>Register here</Link>
                        </div> */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span>Forgot Password? </span>
                        <Link to="/reset-password" style={{ marginLeft: 4 }}>Reset password here</Link>
                    </div>
                    {/* </fieldset> */}
                </Col>
                <Col xs={0} sm={0} md={12} lg={10} style={{ padding: "0 10px", textAlign: "center" }}>
                    <img
                        src="/images/BannerRightDemo.svg"
                        alt="Banner"
                        style={{
                            width: "100%",
                            maxWidth: "700px",
                            height: "auto",
                            objectFit: "contain",
                            margin: "0 auto",
                        }}
                    />
                </Col>
            </Row>
        </>
    );
}

export default LoginPage;