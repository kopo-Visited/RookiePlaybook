import axiosInstance from './axiosInstance';

export const askAi = question =>
  axiosInstance.post('/api/ai/ask', { question }, { timeout: 30000 });
