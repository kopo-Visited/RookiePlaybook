import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { ROUTES } from './constants/routes';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/AdminLayout/AdminLayout';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage/DashboardPage';
import DocListPage from './pages/doc/DocListPage/DocListPage';
import DocFilterResultPage from './pages/doc/DocFilterResultPage/DocFilterResultPage';
import AdminUsersPage from './pages/admin/AdminUsersPage/AdminUsersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage/AdminDashboardPage';

function PrivateRoute() {
  const token = useAuthStore((state) => state.token);
  if (import.meta.env.DEV) return <Outlet />;
  return token ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}

function AdminRoute() {
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.roleCode === 'ROLE_ADMIN';
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.DOC.LIST} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.DOC.LIST} element={<DocListPage />} />
            <Route path={ROUTES.DOC.DEPT} element={<DocFilterResultPage />} />
            <Route path={ROUTES.QNA.LIST} element={<div>QnaListPage</div>} />
            <Route path={ROUTES.EDU.LIST} element={<div>EduListPage</div>} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
            <Route path={ROUTES.ADMIN.DOC} element={<div>AdminDocPage</div>} />
            <Route path={ROUTES.ADMIN.QNA} element={<div>AdminQnaPage</div>} />
            <Route path={ROUTES.ADMIN.EDU} element={<div>AdminEduPage</div>} />
            <Route path={ROUTES.ADMIN.INQUIRY} element={<div>AdminInquiryPage</div>} />
            <Route path={ROUTES.ADMIN.SETTINGS} element={<div>AdminSettingsPage</div>} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
