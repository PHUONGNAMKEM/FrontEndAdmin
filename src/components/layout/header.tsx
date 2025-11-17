import { Link, useNavigate } from "react-router-dom";
// import "./header.css"
import { Badge, Menu, MenuProps, message, Spin } from "antd";
import {
    HomeOutlined,
    UsergroupDeleteOutlined,
    BookOutlined,
    // SettingOutlined,
    LoginOutlined,
    AliwangwangOutlined
} from '@ant-design/icons';
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { logoutAPI } from "../../services/api.me.service";
import "./layoutStyle/header.scss"
import { useTheme } from "@components/context/ThemeContext";
import { ArrowBigRightDash, Bell, BellDot, BellRing, Cannabis, CircleArrowRight, Crown, House, KeyRound, List, ListTodo, LogIn, LogOut, PartyPopper, Settings, UserSquare2 } from "lucide-react";
import { IconWrapper } from "@components/customsIconLucide/IconWrapper";
import './header.scss';
import { useNotificationHistoryStore } from "src/stores/notification/useNotificationHistoryStore";

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

    const role = localStorage.getItem('role');
    // const unreadCount = useNotificationStore((s) => s.unreadCount); //-> chỉ render khi unreadCount thay đổi
    const { unreadCount, fetchAllNotificationsHistory, meta } = useNotificationHistoryStore(); //-> đây là useNotificationStore(), tức là lấy toàn bộ store ra, field nào thay đổi trong store thì component redender 

    useEffect(() => {
        fetchAllNotificationsHistory!(1, meta?.total); // total là tất cả, 1 là lấy ra 1 trang cho fetchAll để tính đúng tổng số noti chưa được duyệt
    }, []);
    const items = [
        {
            label: <Link to={"/overview"}>Home</Link>,
            key: 'overview',
            icon: <IconWrapper Icon={House} />,
        },
        ...(!user ? [
            {
                label: <Link to={"/login"}>Login</Link>,
                key: 'login',
                icon: <IconWrapper Icon={LogIn} />,
            },
            {
                label: <Link to={"/register"}>Register</Link>,
                key: 'register',
                icon: <IconWrapper Icon={UserSquare2} />,
            },] : []),

        ...(user ? [
            {
                label: `Chào ${user.username}`,
                key: 'settings',
                icon: role === "Admin" ? <IconWrapper Icon={Crown} color="#ffc401" /> : <IconWrapper Icon={Cannabis} color="#1f96f8" />,
            },

            {
                label: (
                    <Badge count={unreadCount} offset={[10, -2]} color="red">
                        Thông báo
                    </Badge>
                ),
                key: 'notification',
                icon: <IconWrapper Icon={BellRing} />,
                children: [
                    {
                        label: 'Tất cả thông báo',
                        key: 'noti-all',
                        icon: <IconWrapper Icon={ListTodo} />,
                    },
                    {
                        label: (
                            <div className="flex">
                                <span>Thông báo chưa đọc</span>
                                <Badge count={unreadCount} color="red" />
                            </div>
                        ),
                        key: 'noti-unread',
                        icon: <IconWrapper Icon={BellDot} />,
                    },
                    {
                        label: 'Cài đặt thông báo',
                        key: 'noti-settings',
                        icon: <IconWrapper Icon={Settings} />,
                    }
                ]
            },
            {
                label: isLoggingOut ? (
                    <span><Spin size="small" /> Logging out...</span>
                ) : (
                    'Logout'
                ),
                key: 'logout',
                disabled: isLoggingOut, // ngăn spam click
                icon: <IconWrapper Icon={LogOut} />,
            },
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