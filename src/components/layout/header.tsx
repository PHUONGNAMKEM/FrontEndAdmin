import { Link, useNavigate } from "react-router-dom";
// import "./header.css"
import { Menu, MenuProps, message, Spin } from "antd";
import {
    HomeOutlined,
    UsergroupDeleteOutlined,
    BookOutlined,
    // SettingOutlined,
    LoginOutlined,
    AliwangwangOutlined
} from '@ant-design/icons';
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { logoutAPI } from "../../services/api.me.service";
import "./layoutStyle/header.scss"
import { useTheme } from "@components/context/ThemeContext";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(AuthContext);
    const { theme } = useTheme();

    // Lấy path hiện tại từ URL, ví dụ: "/users"
    const path = location.pathname;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await new Promise(resolve => setTimeout(resolve, 500)); // giả lập delay như khi gọi BE
            // const res = await logoutAPI();
            // if (res.data) {
            //     // clear data
            //     localStorage.removeItem("access_token")
            //     localStorage.removeItem("role")
            //     localStorage.removeItem("username")
            //     setUser(null);
            //     message.success("Logout successfully")
            //     // redirect user to home page
            //     navigate("/", { replace: true });
            // }

            // clear data
            localStorage.removeItem("access_token")
            localStorage.removeItem("role")
            localStorage.removeItem("username")
            localStorage.removeItem("userId")
            localStorage.removeItem("hasChangedPassword")
            setUser(null);
            message.success("Logout successfully")
            // redirect user to home page
            navigate("/", { replace: true });
        } catch (error) {
            message.error("Logout failed");
        }
        finally {
            setIsLoggingOut(false);
        }
    }

    const onClick: MenuProps['onClick'] = async (e) => {
        console.log('Clicked key:', e.key);
        if (e.key === 'logout') {
            await handleLogout();
        }
    };

    const items = [
        {
            label: <Link to={"/overview"}>Home</Link>,
            key: 'overview',
            icon: <HomeOutlined />,
        },
        ...(!user ? [
            {
                label: <Link to={"/login"}>Login</Link>,
                key: 'login',
                icon: <LoginOutlined />,
            },
            {
                label: <Link to={"/register"}>Register</Link>,
                key: 'register',
                icon: <UsergroupDeleteOutlined />,
            },] : []),

        ...(user ? [
            {
                label: `Welcome ${user.username}`,
                key: 'settings',
                icon: <AliwangwangOutlined />,
            },
            {
                label: isLoggingOut ? (
                    <span><Spin size="small" /> Logging out...</span>
                ) : (
                    'Logout'
                ),
                key: 'logout',
                disabled: isLoggingOut, // ngăn spam click
                icon: <LoginOutlined />,
            }
        ] : []),

    ];
    return (

        <div className="bg-[var(--background-header)] border-b border-b-[var(--border-default)]"
            style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {isLoggingOut && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <Spin size="large" tip="Logging out..." />
                </div>
            )}
            <Menu
                style={{ borderBottom: "none", width: '100%', justifyContent: "flex-end" }}
                onClick={onClick}
                selectedKeys={[path]}
                mode="horizontal"
                items={items}
                theme={theme}
            />
        </div>
    );
}

export default Header;