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
    const isGuest = !user || user.username === "Guest";

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
            localStorage.removeItem("refresh_token")
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
        const load = async () => {
            if (!meta?.total) {
                // fetch meta trước
                await fetchAllNotificationsHistory!(1, 9999); // nếu chưa load kịp total thì cho là 9999, vì nếu không thì nó sẽ fetch mặc định là 10 trước (tầm 0.5s) rồi mới load lại đúng được
                return;
            }

            await fetchAllNotificationsHistory!(1, meta?.total); // total là tất cả, 1 là lấy ra 1 trang cho fetchAll để tính đúng tổng số noti chưa được duyệt
        };

        load();
    }, [meta?.total]);
    const items = [

        ...(isGuest
            ? [
                {
                    label: <Link to={"/login"}>Login</Link>,
                    key: "login",
                    icon: <IconWrapper Icon={LogIn} />,
                },
                {
                    label: <Link to={"/register"}>Register</Link>,
                    key: "register",
                    icon: <IconWrapper Icon={UserSquare2} />,
                },
            ]
            : []),

        // ...(!user ? [
        //     {
        //         label: <Link to={"/login"}>Login</Link>,
        //         key: 'login',
        //         icon: <IconWrapper Icon={LogIn} />,
        //     },
        //     {
        //         label: <Link to={"/register"}>Register</Link>,
        //         key: 'register',
        //         icon: <IconWrapper Icon={UserSquare2} />,
        //     },] : []),

        ...(user ? [
            {
                label: `Chào ${user.username}`,
                key: 'settings',
                icon: role === "Admin" ? <IconWrapper Icon={Crown} color="#ffc401" /> : <IconWrapper Icon={Cannabis} color="#1f96f8" />,
            },
            ...(!isGuest) ? [
                {
                    label: <Link to={"/overview"}>Home</Link>,
                    key: 'overview',
                    icon: <IconWrapper Icon={House} />,
                },
                {
                    label: (
                        <Badge count={unreadCount} offset={[10, -2]} color="red">
                            <Link
                                to="/notification/history"
                                className={theme === "dark" ? "text-[#ffffffa6]" : "text-black"}
                            >
                                Thông báo
                            </Link>
                        </Badge>
                    ),
                    key: 'notification',
                    icon: <IconWrapper Icon={BellRing} />,
                    children: [
                        {
                            label: <Link to={"/notification/history"}>Lịch sử thông báo</Link>,
                            key: 'noti-all',
                            icon: <IconWrapper Icon={ListTodo} />,
                        },
                        {
                            label: (
                                <Link to="/notification/history?unread=true">
                                    <div className="flex">
                                        <span>Thông báo chưa đọc của nhân viên</span>
                                        <Badge count={unreadCount} color="red" />
                                    </div>
                                </Link>
                            ),
                            key: 'noti-unread',
                            icon: <IconWrapper Icon={BellDot} />,
                        },
                        // {
                        //     label: 'Cài đặt thông báo',
                        //     key: 'noti-settings',
                        //     icon: <IconWrapper Icon={Settings} />,
                        // }
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
            ] : []
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