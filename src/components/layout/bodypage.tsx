import {
    AimOutlined,
    BarChartOutlined,
    ExclamationCircleOutlined,
    FileDoneOutlined,
    FileTextOutlined,
    GiftOutlined,
    HomeOutlined,
    IdcardOutlined,
    LeftOutlined,
    LogoutOutlined,
    PieChartOutlined,
    ProjectOutlined,
    RightOutlined,
    RocketOutlined,
    SettingOutlined,
    StopOutlined,
    SwapOutlined,
    UserOutlined,
    UserSwitchOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme, MenuProps } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import './layoutStyle/bodyPageStyle.scss'
import { getGoalByIdAPI } from '../../services/api.me.service';
import { ArrowLeftRight, ArrowRight, Bell, BookOpenCheck, ChartColumn, ChartNoAxesGantt, CircleAlert, CircleCheckBig, ClockArrowUp, CreditCard, FileSpreadsheet, FileUser, Gift, GiftIcon, GraduationCap, HandCoins, House, PartyPopper, Settings, Shield, SquareKanban, TriangleAlert, UserCog, UserRound, UserRoundMinus, UserRoundPlus, UserRoundX, UserStar, Warehouse } from 'lucide-react';
import ThemeToggle from '../theme/ThemeToggle';
import { useTheme } from '@components/context/ThemeContext';
import { IconWrapper } from '@components/customsIconLucide/IconWrapper';
import { useHeaderStore } from 'src/stores/useHeaderStore';

type MenuItem = Required<MenuProps>['items'][number];

const BodyPage = () => {
    const { theme: appTheme } = useTheme();

    const { Header, Content, Sider } = Layout;
    function getItem(
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[]
    ): MenuItem {
        return {
            key,
            icon,
            children,
            label,
        } as MenuItem;
    }
    const [collapsed, setCollapsed] = useState(false);

    // Check role and display follow role
    const role = localStorage.getItem("role") || "Employee" || "User";
    // const { user } = useContext(AuthContext); và check if (user?.role?.name === "ADMIN") {

    const baseItems: MenuItem[] = [
        getItem(<Link to="/guide">Hướng dẫn</Link>, "guide", <IconWrapper Icon={GraduationCap} />),
        getItem(<Link to="/congrats">Nhân viên</Link>, "congrats", <IconWrapper Icon={PartyPopper} />),
    ];

    // Danh sách menu chung cho HR và Admin
    const hrAndAdminItems: MenuItem[] = [
        getItem(<Link to="/overview">Tổng quan</Link>, "overview", <IconWrapper Icon={House} />),
        getItem(<Link to="/employee">Nhân viên</Link>, "employee", <IconWrapper Icon={UserRound} />),
        getItem(<Link to="/department">Phòng ban</Link>, "department", <IconWrapper Icon={Warehouse} />),
        getItem(<Link to="/position">Chức vụ</Link>, "position", <IconWrapper Icon={ChartNoAxesGantt} />),
        getItem(<Link to="/profile">Hồ sơ</Link>, "profile", <IconWrapper Icon={FileUser} />),
        getItem(<Link to="/contract">Hợp đồng</Link>, "contract", <IconWrapper Icon={FileSpreadsheet} />,
            [
                getItem(<Link to="/contract">Danh sách</Link>, "contract-list"),
                getItem(<Link to="/contract/expiring">Sắp hết hạn</Link>, "contract-expiring"),
            ]),
        getItem(<Link to="/salary">Tính lương</Link>, "salary", <IconWrapper Icon={CreditCard} />,
            [
                getItem(<Link to="/salary/config">Cấu hình</Link>, "config"),
                getItem(<Link to="/salary/table">Bảng tính lương</Link>, "table"),
                getItem(<Link to="/salary/accept">Chốt lương</Link>, "accept"),
            ]
        ),
        getItem(<Link to="/request">Yêu cầu</Link>, "request", <IconWrapper Icon={CircleCheckBig} />),
        getItem(<Link to="/reward-penalty">Thưởng phạt</Link>, "reward-penalty", <IconWrapper Icon={GiftIcon} />,
            [
                getItem(<Link to="/reward-penalty/rules">Nội quy</Link>, "rules"),
                getItem(<Link to="/reward-penalty/list">Danh sách</Link>, "reward-penalty-list"),
            ]
        ),
        getItem(<Link to="/overtime">Làm thêm</Link>, "overtime", <IconWrapper Icon={ClockArrowUp} />),
        getItem(<Link to="/course">Khóa học</Link>, "course", <IconWrapper Icon={BookOpenCheck} />),
        getItem(<Link to="/notification">Thông báo</Link>, "notification", <IconWrapper Icon={Bell} />,
            [
                getItem(<Link to="/notification/history">Lịch sử</Link>, "history"),
                getItem(<Link to="/notification/list">Danh sách</Link>, "notification-list"),
            ]
        ),
        getItem(<Link to="/appointment">Bổ nhiệm</Link>, "appointment", <IconWrapper Icon={UserRoundPlus} />),
        getItem(<Link to="/dismissal">Miễn nhiệm</Link>, "dismissal", <IconWrapper Icon={UserRoundX} />),
        getItem(<Link to="/transfer">Thuyên chuyển</Link>, "transfer", <IconWrapper Icon={ArrowLeftRight} />),
        getItem(<Link to="/resignation">Nghỉ việc</Link>, "resignation", <IconWrapper Icon={UserRoundMinus} />),
        getItem(<Link to="/reward">Khen thưởng</Link>, "reward", <IconWrapper Icon={Gift} />),
        getItem(<Link to="/discipline">Kỷ luật</Link>, "discipline", <IconWrapper Icon={Shield} />),
        getItem(<Link to="/incident">Sự cố</Link>, "incident", <IconWrapper Icon={CircleAlert} />),
        getItem(<Link to="/planning">Quy hoạch</Link>, "planning", <IconWrapper Icon={SquareKanban} />),
        getItem(<Link to="/report">Báo cáo</Link>, "report", <IconWrapper Icon={ChartColumn} />),
        getItem(<Link to="/settings">Thiết lập</Link>, "settings", <IconWrapper Icon={Settings} />),
    ];

    // Chỉ Admin mới có thêm
    const adminExtraItems: MenuItem[] = [
        getItem(<Link to="/user-management">Quản lý người dùng</Link>, "user-management", <IconWrapper Icon={UserCog} />),
        getItem(<Link to="/role">Phân quyền</Link>, "role", <IconWrapper Icon={UserStar} />),
    ];

    // Build danh sách cuối cùng
    let items: MenuItem[] = [];

    if (role === "Admin") {
        items = [...hrAndAdminItems, ...adminExtraItems, ...baseItems];
    } else if (role === "HR") {
        items = [...hrAndAdminItems, ...baseItems]; // HR có tất cả trừ user-management
    } else if (role === "Employee" || role === "User") {
        items = [...baseItems]; // Employee chỉ có Hướng dẫn
    }

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [breadcrumbTitle, setBreadcrumbTitle] = useState<{ title: string }[]>([{ title: 'Goal' }]);
    const breadcrumbMap: Record<string, string[]> = {
        goal: ['Goal'],
        tasks: ['Tasks'],
        user: ['User'],
        u1: ['User', 'Tom'],
        u2: ['User', 'Bill'],
        u3: ['User', 'Alex'],
        performance: ['Performance'],
        p1: ['Performance', 'Team 1'],
        p2: ['Performance', 'Team 2'],
        settings: ['Settings'],
        analytics: ['Analytics'],
    };

    // const path = location.pathname;

    // Change color theme
    const switchTheme = (theme: 'primary' | 'secondary' | 'third') => {
        document.documentElement.style.setProperty(
            '--theme-current',
            getComputedStyle(document.documentElement).getPropertyValue(`--theme-${theme}`)
        );
    };

    const { idGoal } = useParams();
    let [titleGoal, setTitleGoal] = useState("");
    const getGoalById = async () => {
        try {
            const res = await getGoalByIdAPI(idGoal);
            if (res.data) {
                setTitleGoal(res.data.title)
            }
        } catch (error) {
        }
    }

    const { headerContent, setHeaderContent } = useHeaderStore();
    useEffect(() => {
        // getGoalById();
    }, [headerContent]);


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}
                style={{
                    background: "var(--background-sider)",
                    borderRight: "1px solid #ccc",
                }}
                trigger={
                    <div
                        style={{
                            // backgroundColor: 'var(--theme-current)',
                            backgroundColor: 'var(--button-toggle-sider)',
                            color: 'rgb(169, 168, 168)',
                            height: 48,
                            lineHeight: '48px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: "1px solid #CDCDCC",
                        }}
                    >
                        {collapsed ? <LeftOutlined /> : <RightOutlined />}
                    </div>
                }
            >
                <div className="demo-logo-vertical" />
                {/* có thể gán theme được cho menu -> light/dark */}
                <Menu
                    defaultSelectedKeys={['goal']}
                    theme={appTheme}
                    mode="inline"
                    items={items}
                    onClick={(info: { key: string }) => {
                        // console.log("check info: ", info)
                        const path = breadcrumbMap[info.key];
                        if (path) {
                            // console.log(">>> check path: ", path);
                            setBreadcrumbTitle(path.map(p => ({ title: p })))
                            // console.log(">>> check breadcrumbtitle: ", breadcrumbTitle);
                        }
                    }}
                />
            </Sider>
            <Layout style={{ background: "var(--theme-current)" }}>
                {/* <Header
                    // className='border-b border-b-[var(--border-default)]'
                    style={{
                        padding: 0,
                        // background: colorBgContainer
                        backgroundColor: 'var(--background-header-layout)'
                    }}
                >
                </Header> */}
                <Content style={{ backgroundColor: "var(--background-content)" }}>
                    <div className='content-header' style={{ width: "100%", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "var(--background-content)", }}>
                        {/* <div className='flex items-center justify-between mx-4 my-0 h-[100px]'>
                            <div className='flex items-center text-[var(--text-color)]'>
                                <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbTitle} className='!text-[var(--text-color)]' />
                                <ArrowRight size={20} className='ml-2' />
                            </div>
                            <div className="themeColor">
                                <ThemeToggle />
                            </div>
                        </div>
                        <p>{titleGoal}</p> */}
                        <div className="themeColor">
                            <ThemeToggle />
                        </div>
                        {headerContent}
                    </div>

                    <div
                        style={{
                            margin: "0 16px",
                            padding: 24,
                            minHeight: 360,
                            // background: "rgb(247 247 247)",
                            // backgroundImage: `url('https://c4.wallpaperflare.com/wallpaper/73/811/589/mac-os-x-5k-lake-river-wallpaper-preview.jpg')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            backgroundBlendMode: 'lighten',
                            // backgroundColor: 'rgba(255, 255, 255, 0.161)',
                            borderRadius: borderRadiusLG,
                            border: "1px solid #ccc",
                            position: "relative"
                            // boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px"
                        }}
                    >
                        <Outlet context={{ setHeaderContent }} />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default BodyPage;