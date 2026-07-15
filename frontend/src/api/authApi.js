import axiosInstance from './axiosInstance';

export const login = credentials => axiosInstance.post('/api/auth/login', credentials);
export const logout = () => axiosInstance.post('/api/auth/logout');
export const getMe = () => axiosInstance.get('/api/users/me');
export const changePassword = ({ currentPassword, newPassword }) =>
  axiosInstance.patch('/api/users/me/password', { currentPassword, newPassword });
