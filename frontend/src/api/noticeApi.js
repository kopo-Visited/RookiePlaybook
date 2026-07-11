import axiosInstance from './axiosInstance';

/**
 * 공지사항 최근 목록 조회 (비로그인 접근 가능)
 * GET /api/notices
 */
export const getNotices = () => axiosInstance.get('/api/notices');

/**
 * 공지사항 전체 목록 조회 (로그인 사용자)
 * GET /api/notices/all
 */
export const getAllNotices = () => axiosInstance.get('/api/notices/all');

/**
 * 공지사항 전체 목록 조회 (관리자)
 * GET /api/admin/notices
 */
export const getAdminNotices = () => axiosInstance.get('/api/admin/notices');

/**
 * 공지사항 등록 (관리자)
 * POST /api/admin/notices
 */
export const createNotice = ({ title, content }) =>
  axiosInstance.post('/api/admin/notices', { title, content });

/**
 * 공지사항 수정 (관리자)
 * PUT /api/admin/notices/{noticeId}
 */
export const updateNotice = (noticeId, { title, content }) =>
  axiosInstance.put(`/api/admin/notices/${noticeId}`, { title, content });

/**
 * 공지사항 삭제 (관리자)
 * DELETE /api/admin/notices/{noticeId}
 */
export const deleteNotice = noticeId => axiosInstance.delete(`/api/admin/notices/${noticeId}`);
