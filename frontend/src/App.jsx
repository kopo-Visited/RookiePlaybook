import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DocListPage from './pages/doc/DocListPage/DocListPage';
import { ROUTES } from './constants/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.DOC.LIST} element={<DocListPage />} />
          <Route path="/" element={<Navigate to={ROUTES.DOC.LIST} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
