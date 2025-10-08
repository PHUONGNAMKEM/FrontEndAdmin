import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import RegisterPage from './pages/register.tsx';
import "./styles/global.scss";
import ErrorPage from './pages/error.tsx';
import SettingPage from './pages/setting.tsx';
import { AuthWrapper } from './components/context/auth.context.tsx';
import PrivateRoute from './pages/private.route.tsx';
import BodyPage from './components/layout/bodypage.tsx';
import GoalPage from './pages/goal.tsx';
import TaskPage from './pages/task.tsx';
import GoalDetail from './components/goal/goalDetail/goalDetail.tsx';
import Analytics from './pages/analytics.tsx';
import { ThemeProvider } from './components/context/ThemeContext.tsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from './pages/login.tsx';
import ProfilePage from './pages/Profile.tsx';
import ContractPage from './pages/Contract.tsx';
import AppointmentPage from './pages/Appointment.tsx';
import DismissalPage from './pages/Dismissal.tsx';
import TransferPage from './pages/Transfer.tsx';
import ResignationPage from './pages/Resignation.tsx';
import RewardPage from './pages/Reward.tsx';
import DisciplinePage from './pages/Discipline.tsx';
import IncidentPage from './pages/Incident.tsx';
import PlanningPage from './pages/Planning.tsx';
import ReportPage from './pages/Report.tsx';
import OverviewPage from './pages/Overview.tsx';

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


