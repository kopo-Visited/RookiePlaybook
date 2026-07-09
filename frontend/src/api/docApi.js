import axiosInstance from './axiosInstance';

export const getDocuments = (params = {}) => axiosInstance.get('/api/documents', { params });

export const getDocument = id => axiosInstance.get(`/api/documents/${id}`);

export const searchDocuments = (keyword, params = {}) =>
  axiosInstance.get('/api/documents/search', { params: { q: keyword, ...params } });

export const createDocument = data => axiosInstance.post('/api/documents', data);

export const getFaqs = (params = {}) => axiosInstance.get('/api/faqs', { params });
