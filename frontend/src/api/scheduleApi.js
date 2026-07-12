import axiosInstance from './axiosInstance';

export const getDepartments = () => axiosInstance.get('/api/admin/departments');

export const getSchedules = date =>
  axiosInstance.get('/api/schedules', { params: date ? { date } : {} });

export const getAdminSchedules = () => axiosInstance.get('/api/admin/schedules');

export const createSchedule = data => axiosInstance.post('/api/admin/schedules', data);

export const updateSchedule = (id, data) => axiosInstance.put(`/api/admin/schedules/${id}`, data);

export const deleteSchedule = id => axiosInstance.delete(`/api/admin/schedules/${id}`);

export const getUserSchedules = date =>
  axiosInstance.get('/api/user/schedules', { params: date ? { date } : {} });

export const createUserSchedule = data => axiosInstance.post('/api/user/schedules', data);

export const updateUserSchedule = (id, data) =>
  axiosInstance.put(`/api/user/schedules/${id}`, data);

export const deleteUserSchedule = id => axiosInstance.delete(`/api/user/schedules/${id}`);
