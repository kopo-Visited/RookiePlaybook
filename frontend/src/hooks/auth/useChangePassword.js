import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword as changePasswordApi } from '../../api/authApi';
import useAuthStore from '../../stores/authStore';
import { ROUTES } from '../../constants/routes';
import { AUTH_MESSAGES, ERROR_MESSAGES } from '../../constants/message';

const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  const navigate = useNavigate();

  const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    if (!currentPassword) {
      setError(AUTH_MESSAGES.CURRENT_PASSWORD_REQUIRED);
      return;
    }
    if (!newPassword) {
      setError(AUTH_MESSAGES.NEW_PASSWORD_REQUIRED);
      return;
    }
    if (!confirmPassword) {
      setError(AUTH_MESSAGES.NEW_PASSWORD_CONFIRM_REQUIRED);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(AUTH_MESSAGES.NEW_PASSWORD_MISMATCH);
      return;
    }
    if (newPassword === currentPassword) {
      setError(AUTH_MESSAGES.NEW_PASSWORD_SAME_AS_CURRENT);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await changePasswordApi({ currentPassword, newPassword });
      updateUser({ passwordChangeRequired: false });
      const destination = user?.roleCode === 'ROLE_ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.DOC.LIST;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
};

export default useChangePassword;
