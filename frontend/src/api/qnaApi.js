import axiosInstance from './axiosInstance';

export const getQnas = params => axiosInstance.get('/api/qnas', { params });
export const getQna = id => axiosInstance.get(`/api/qnas/${id}`);
export const createQna = data => axiosInstance.post('/api/qnas', data);
export const updateQna = (id, data) => axiosInstance.put(`/api/qnas/${id}`, data);
export const deleteQna = id => axiosInstance.delete(`/api/qnas/${id}`);
export const createAnswer = (id, data) => axiosInstance.post(`/api/qnas/${id}/answers`, data);
