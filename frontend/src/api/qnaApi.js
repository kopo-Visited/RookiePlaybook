import axiosInstance from './axiosInstance';

// 사용자 질문 (내 질문 목록/상세/작성/수정/삭제)
export const getQnas = params => axiosInstance.get('/api/questions/me', { params });
export const getQna = id => axiosInstance.get(`/api/questions/${id}`);
export const createQna = data => axiosInstance.post('/api/questions', data);
export const updateQna = (id, data) => axiosInstance.put(`/api/questions/${id}`, data);
export const deleteQna = id => axiosInstance.delete(`/api/questions/${id}`);

// 전체 질문(모든 사용자) — 목록/공개 상세
export const getAllQnas = params => axiosInstance.get('/api/questions/all', { params });
export const getPublicQna = id => axiosInstance.get(`/api/questions/all/${id}`);

// 질문 카테고리
export const getQuestionCategories = () => axiosInstance.get('/api/question-categories');

// 알림
export const getNotifications = () => axiosInstance.get('/api/notifications');
export const markNotificationRead = id =>
  axiosInstance.patch(`/api/notifications/${id}/read`);
export const deleteAllNotifications = () => axiosInstance.delete('/api/notifications');

// 관리자 (질문 목록/상세/답변/상태변경/FAQ 전환)
export const getAdminQnas = params => axiosInstance.get('/api/admin/questions', { params });
export const getAdminQna = id => axiosInstance.get(`/api/admin/questions/${id}`);
export const answerQna = (id, data) =>
  axiosInstance.put(`/api/admin/questions/${id}/answer`, data);
export const updateQnaStatus = (id, data) =>
  axiosInstance.patch(`/api/admin/questions/${id}/status`, data);
export const convertQnaToFaq = id => axiosInstance.post(`/api/admin/questions/${id}/faq`);
