import axiosInstance from './axiosInstance';

export const getSchedules = date =>
  axiosInstance.get('/api/schedules', { params: date ? { date } : {} });

export const getAdminSchedules = () => axiosInstance.get('/api/admin/schedules');

export const createSchedule = data => axiosInstance.post('/api/admin/schedules', data);

export const updateSchedule = (id, data) => axiosInstance.put(`/api/admin/schedules/${id}`, data);

export const deleteSchedule = id => axiosInstance.delete(`/api/admin/schedules/${id}`);
