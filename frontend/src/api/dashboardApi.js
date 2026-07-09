import axiosInstance from './axiosInstance';

/**
 * 관리자 대시보드 통계 조회
 * GET /api/admin/dashboard/stats
 */
export const getDashboardStats = async () => {
  const response = await axiosInstance.get('/api/admin/dashboard/stats');
  return response.data;
};
