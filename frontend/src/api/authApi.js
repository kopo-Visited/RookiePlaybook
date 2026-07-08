import axiosInstance from './axiosInstance';

export const login = (credentials) => axiosInstance.post('/api/auth/login', credentials);
export const logout = () => axiosInstance.post('/api/auth/logout');
export const getMe = () => axiosInstance.get('/api/users/me');
