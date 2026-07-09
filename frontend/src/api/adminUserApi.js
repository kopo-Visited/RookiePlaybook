import axiosInstance from './axiosInstance';

/**
 * 관리자 사용자 목록 조회
 * GET /api/admin/users
 */
export const getAdminUsers = async () => {
  const response = await axiosInstance.get('/api/admin/users');
  return response.data;
};

/**
 * 부서 목록 조회
 * GET /api/departments
 */
export const getDepartments = async () => {
  const response = await axiosInstance.get('/api/departments');
  return response.data;
};

/**
 * 권한 목록 조회
 * GET /api/roles
 */
export const getRoles = async () => {
  const response = await axiosInstance.get('/api/roles');
  return response.data;
};

/**
 * 관리자 사용자 등록
 * POST /api/admin/users
 */
export const createAdminUser = async userData => {
  const response = await axiosInstance.post('/api/admin/users', userData);
  return response.data;
};

/**
 * 관리자 사용자 정보 수정
 * PUT /api/admin/users/{userId}
 */
export const updateAdminUser = async (userId, userData) => {
  const response = await axiosInstance.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

/**
 * 관리자 사용자 권한 변경
 * PATCH /api/admin/users/{userId}/roles
 */
export const updateAdminUserRole = async (userId, roleId) => {
  const response = await axiosInstance.patch(`/api/admin/users/${userId}/roles`, {
    roleId,
  });
  return response.data;
};

/**
 * 관리자 사용자 상태 변경
 * PATCH /api/admin/users/{userId}/status
 */
export const updateAdminUserStatus = async (userId, status) => {
  const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, {
    status,
  });
  return response.data;
};
