import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { ROUTES } from './constants/routes';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import DocListPage from './pages/doc/DocListPage/DocListPage';
import DocFilterResultPage from './pages/doc/DocFilterResultPage/DocFilterResultPage';

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
            <Route path={ROUTES.DOC.LIST} element={<DocListPage />} />
            <Route path={ROUTES.DOC.DEPT} element={<DocFilterResultPage />} />
            <Route path={ROUTES.QNA.LIST} element={<div>QnaListPage</div>} />
            <Route path={ROUTES.EDU.LIST} element={<div>EduListPage</div>} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path={ROUTES.ADMIN.DOC} element={<div>AdminDocPage</div>} />
        </Route>

        <Route path="/" element={<Navigate to={ROUTES.DOC.LIST} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
