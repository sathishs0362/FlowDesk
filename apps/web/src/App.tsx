import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { TasksPage } from './features/tasks/pages/TasksPage';
import { KanbanPage } from './features/kanban/pages/KanbanPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ToastContainer } from './components/toast/ToastContainer';
import { TopLoadingBar } from './components/loading/TopLoadingBar';
import { DashboardOverviewPage } from './features/dashboard/pages/DashboardOverviewPage';
import { OfflineBanner } from './components/network/OfflineBanner';

const App = () => {
  return (
    <>
      <TopLoadingBar />
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardOverviewPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="kanban" element={<KanbanPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer />
    </>
  );
};

export default App;
