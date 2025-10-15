import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/Unused/register.tsx';
import "./styles/global.scss";
import ErrorPage from './pages/error.tsx';
import SettingPage from './pages/Unused/setting.tsx';
import { AuthWrapper } from './components/context/auth.context.tsx';
import BodyPage from './components/layout/bodypage.tsx';
import GoalPage from './pages/Unused/goal.tsx';
import TaskPage from './pages/Unused/task.tsx';
import GoalDetail from './components/goal/goalDetail/goalDetail.tsx';
import Analytics from './pages/Unused/analytics.tsx';
import { ThemeProvider } from './components/context/ThemeContext.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from './pages/LoginPage/login.tsx';
import ProfilePage from './pages/Unused/Profile.tsx';
import AppointmentPage from './pages/Unused/Appointment.tsx';
import DismissalPage from './pages/Unused/Dismissal.tsx';
import TransferPage from './pages/Unused/Transfer.tsx';
import ResignationPage from './pages/Unused/Resignation.tsx';
import RewardPage from './pages/Unused/Reward.tsx';
import DisciplinePage from './pages/Unused/Discipline.tsx';
import IncidentPage from './pages/Unused/Incident.tsx';
import PlanningPage from './pages/Unused/Planning.tsx';
import ReportPage from './pages/Unused/Report.tsx';
import UserManagementPage from './pages/UserPage/userManagement.tsx';
import EmployeePage from './pages/EmployeePage/EmployeePage.tsx';
import { GuidePage } from './pages/Guide/GuidePage.tsx';
import { CongratsPage } from './pages/Guide/CongratsPage.tsx';
import { ResetPasswordPage } from './pages/LoginPage/ResetPasswordPage.tsx';
import OverviewPage from './pages/Overview.tsx';
import { DepartmentPage } from './pages/Department/DepartmentPage.tsx';
import { PositionPage } from './pages/Position/PositionPage.tsx';
import { ContractPage } from './pages/Contract/ContractPage.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <BodyPage />,
        children: [
          { path: "/overview", element: <OverviewPage /> },
          { path: "/employee", element: <EmployeePage /> },
          { path: "/department", element: <DepartmentPage /> },
          { path: "/position", element: <PositionPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/contract", element: <ContractPage /> },
          { path: "/appointment", element: <AppointmentPage /> },
          { path: "/dismissal", element: <DismissalPage /> },
          { path: "/transfer", element: <TransferPage /> },
          { path: "/resignation", element: <ResignationPage /> },
          { path: "/reward", element: <RewardPage /> },
          { path: "/discipline", element: <DisciplinePage /> },
          { path: "/incident", element: <IncidentPage /> },
          { path: "/planning", element: <PlanningPage /> },
          { path: "/report", element: <ReportPage /> },
          { path: "/user-management", element: <UserManagementPage /> },
          {
            index: true,
            path: "/settings",
            element: <SettingPage />,
          },
          {
            path: "/goal",
            element: <GoalPage />,
          },
          {
            path: "/goal/:idGoal/tasks",
            element: <TaskPage />,
          },
          {
            path: "/tasks",
            element: <TaskPage />,
          },
          {
            path: "/tasks/:id",
            element: <GoalDetail />,
          },
          {
            path: "/analytics",
            element: <Analytics />,
          },
          {
            path: "/guide",
            element: <GuidePage />,
          },
          {
            path: "/congrats",
            element: <CongratsPage />,
          },
          {
            path: "/reset-password",
            element: <ResetPasswordPage />,
          }
        ]
      }
    ]
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <AuthWrapper>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthWrapper>
  </QueryClientProvider>
  // </React.StrictMode>,
)


