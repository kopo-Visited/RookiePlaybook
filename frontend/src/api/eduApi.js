import axiosInstance from './axiosInstance';

export const getEducations = params => axiosInstance.get('/api/educations', { params });
export const getEducationDetail = id => axiosInstance.get(`/api/educations/${id}`);
export const getMaterial = stageId => axiosInstance.get(`/api/stages/${stageId}/material`);
export const saveVideoProgress = data => axiosInstance.post('/api/progress/video', data);
export const completeStage = stageId => axiosInstance.post('/api/progress/stage', { stageId });
export const getMyProgress = () => axiosInstance.get('/api/progress/me');
export const enroll = id => axiosInstance.post(`/api/educations/${id}/enroll`);

// 관리자 교육 관리 페이지 전용 - 부서 필터 없이 전체 과정 조회
export const getAdminEducations = params => axiosInstance.get('/api/admin/educations', { params });

export const createEducation = data => axiosInstance.post('/api/admin/educations', data);
export const updateEducation = (id, data) => axiosInstance.put(`/api/admin/educations/${id}`, data);
export const deleteEducation = id => axiosInstance.delete(`/api/admin/educations/${id}`);
export const createStage = data => axiosInstance.post('/api/admin/stages', data);
export const updateStage = (stageId, data) =>
  axiosInstance.put(`/api/admin/stages/${stageId}`, data);
export const deleteStage = stageId => axiosInstance.delete(`/api/admin/stages/${stageId}`);
export const getAdminProgress = params => axiosInstance.get('/api/admin/progress', { params });
export const getIncomplete = params =>
  axiosInstance.get('/api/admin/progress/incomplete', { params });
