import { useCallback, useEffect, useState } from 'react';
import {
  getAdminUsers,
  getDepartments,
  createAdminUser,
  updateAdminUser,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../../api/adminUserApi';
import { ERROR_MESSAGES } from '../../constants/message';

const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    getDepartments()
      .then(setDepartments)
      .catch(() => {});
  }, [fetchUsers]);

  const registerUser = async userData => {
    await createAdminUser(userData);
    await fetchUsers();
  };

  const editUser = async (userId, userData) => {
    await updateAdminUser(userId, userData);
    await fetchUsers();
  };

  const changeUserRole = async (userId, roleId) => {
    await updateAdminUserRole(userId, roleId);
    await fetchUsers();
  };

  const changeUserStatus = async (userId, status) => {
    await updateAdminUserStatus(userId, status);
    await fetchUsers();
  };

  return {
    users,
    departments,
    loading,
    error,
    registerUser,
    editUser,
    changeUserRole,
    changeUserStatus,
    refetch: fetchUsers,
  };
};

export default useAdminUsers;
