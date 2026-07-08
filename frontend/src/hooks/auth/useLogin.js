import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/authApi';
import useAuthStore from '../../stores/authStore';
import { ROUTES } from '../../constants/routes';
import { AUTH_MESSAGES, ERROR_MESSAGES } from '../../constants/message';

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setAuth = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const login = async ({ email, password }) => {
    if (!email.trim()) {
      setError(AUTH_MESSAGES.EMAIL_REQUIRED);
      return;
    }
    if (!password) {
      setError(AUTH_MESSAGES.PASSWORD_REQUIRED);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await loginApi({ email, password });
      const { accessToken, ...user } = response.data;
      setAuth(user, accessToken);
      const destination =
        user.roleCode === 'ROLE_ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.DOC.LIST;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
