import axiosInstance from './axiosInstance';

export const getEducations = params => axiosInstance.get('/api/educations', { params });
export const getEducationDetail = id => axiosInstance.get(`/api/educations/${id}`);
export const getMaterial = stageId => axiosInstance.get(`/api/stages/${stageId}/material`);
export const saveVideoProgress = data => axiosInstance.post('/api/progress/video', data);
export const completeStage = stageId => axiosInstance.post('/api/progress/stage', { stageId });
export const getMyProgress = () => axiosInstance.get('/api/educations/my-progress');

export const createEducation = data => axiosInstance.post('/api/admin/educations', data);
export const updateEducation = (id, data) => axiosInstance.put(`/api/admin/educations/${id}`, data);
export const deleteEducation = id => axiosInstance.delete(`/api/admin/educations/${id}`);
export const createStage = (id, data) =>
  axiosInstance.post(`/api/admin/educations/${id}/stages`, data);
export const updateStage = (id, stageId, data) =>
  axiosInstance.put(`/api/admin/educations/${id}/stages/${stageId}`, data);
export const deleteStage = (id, stageId) =>
  axiosInstance.delete(`/api/admin/educations/${id}/stages/${stageId}`);
export const getAdminProgress = params =>
  axiosInstance.get('/api/admin/educations/progress', { params });
export const getIncomplete = params =>
  axiosInstance.get('/api/admin/educations/incomplete', { params });
