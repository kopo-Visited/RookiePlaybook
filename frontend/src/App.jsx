import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { ROUTES } from './constants/routes';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/AdminLayout/AdminLayout';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage/ChangePasswordPage';
import AccountUnlockRequestPage from './pages/auth/AccountUnlockRequestPage/AccountUnlockRequestPage';
import DashboardPage from './pages/dashboard/DashboardPage/DashboardPage';
import DocListPage from './pages/doc/DocListPage/DocListPage';
import DocFilterResultPage from './pages/doc/DocFilterResultPage/DocFilterResultPage';
import DocDetailPage from './pages/doc/DocDetailPage/DocDetailPage';
import AdminUsersPage from './pages/admin/AdminUsersPage/AdminUsersPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage/AdminDashboardPage';
import AdminDocPage from './pages/admin/AdminDocPage/AdminDocPage';
import AdminQnaPage from './pages/admin/AdminQnaPage/AdminQnaPage';
import QnaListPage from './pages/qna/QnaListPage/QnaListPage';
import QnaAllPage from './pages/qna/QnaAllPage/QnaAllPage';
import NoticeListPage from './pages/notice/NoticeListPage/NoticeListPage';
import InquiryPage from './pages/inquiry/InquiryPage/InquiryPage';
import AdminInquiryPage from './pages/admin/AdminInquiryPage/AdminInquiryPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage/AdminSettingsPage';
import AdminEduPage from './pages/admin/AdminEduPage/AdminEduPage';
import EducationListPage from './pages/edu/EducationListPage/EducationListPage';
import EducationDetailPage from './pages/edu/EducationDetailPage/EducationDetailPage';
import VideoPlayerPage from './pages/edu/VideoPlayerPage/VideoPlayerPage';
import NotFoundPage from './pages/error/NotFoundPage/NotFoundPage';

function PrivateRoute() {
  const token = useAuthStore(state => state.token);
  if (import.meta.env.DEV) return <Outlet />;
  return token ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}

function AdminRoute() {
  const user = useAuthStore(state => state.user);
  if (import.meta.env.DEV) return <Outlet />;
  const isAdmin = user?.roleCode === 'ROLE_ADMIN';
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.DOC.LIST} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.ACCOUNT_UNLOCK} element={<AccountUnlockRequestPage />} />

        <Route element={<PrivateRoute />}>
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
          <Route element={<Layout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.DOC.LIST} element={<DocListPage />} />
            <Route path={ROUTES.DOC.DEPT} element={<DocFilterResultPage />} />
            <Route path="/doc/:id" element={<DocDetailPage />} />
            <Route path={ROUTES.QNA.LIST} element={<QnaListPage />} />
            <Route path={ROUTES.QNA.ALL} element={<QnaAllPage />} />
            <Route path={ROUTES.NOTICE.LIST} element={<NoticeListPage />} />
            <Route path={ROUTES.EDU.LIST} element={<EducationListPage />} />
            <Route path="/edu/:id" element={<EducationDetailPage />} />
            <Route path="/edu/:id/stages/:stageId" element={<VideoPlayerPage />} />
            <Route path={ROUTES.INQUIRY} element={<InquiryPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN.USERS} element={<AdminUsersPage />} />
            <Route path={ROUTES.ADMIN.DOC} element={<AdminDocPage />} />
            <Route path={ROUTES.ADMIN.QNA} element={<AdminQnaPage />} />
            <Route path={ROUTES.ADMIN.EDU} element={<AdminEduPage />} />
            <Route path={ROUTES.ADMIN.INQUIRY} element={<AdminInquiryPage />} />
            <Route path={ROUTES.ADMIN.SETTINGS} element={<AdminSettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
