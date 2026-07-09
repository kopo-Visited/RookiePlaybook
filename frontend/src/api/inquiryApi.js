import axiosInstance from './axiosInstance';

export const createInquiry = ({ type, title, content }) =>
  axiosInstance.post('/api/inquiries', { type, title, content });

export const getMyInquiries = () => axiosInstance.get('/api/inquiries/me');

export const getMyInquiry = inquiryId => axiosInstance.get(`/api/inquiries/${inquiryId}`);

export const getAdminInquiries = () => axiosInstance.get('/api/admin/inquiries');

export const getAdminInquiry = inquiryId =>
  axiosInstance.get(`/api/admin/inquiries/${inquiryId}`);

export const answerInquiry = (inquiryId, answer) =>
  axiosInstance.patch(`/api/admin/inquiries/${inquiryId}/answer`, { answer });
