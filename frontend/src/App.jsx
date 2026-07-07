import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import { ROUTES } from './constants/routes';

function PrivateRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}

function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ROLE_ADMIN';
  return isAdmin ? <Outlet /> : <Navigate to={ROUTES.DOC.LIST} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<div>LoginPage (준비 중)</div>} />

        <Route element={<PrivateRoute />}>
          <Route path={ROUTES.DOC.LIST} element={<div>DocListPage</div>} />
          <Route path={ROUTES.QNA.LIST} element={<div>QnaListPage</div>} />
          <Route path={ROUTES.EDU.LIST} element={<div>EduListPage</div>} />
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
