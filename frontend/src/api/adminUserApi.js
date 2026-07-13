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
 * 부서 추가
 * POST /api/admin/departments
 */
export const createDepartment = async ({ code, name }) => {
  const response = await axiosInstance.post('/api/admin/departments', { code, name });
  return response.data;
};

/**
 * 부서 수정 (코드/이름)
 * PUT /api/admin/departments/{departmentId}
 */
export const updateDepartment = async (departmentId, { code, name }) => {
  const response = await axiosInstance.put(`/api/admin/departments/${departmentId}`, {
    code,
    name,
  });
  return response.data;
};

/**
 * 부서 삭제
 * DELETE /api/admin/departments/{departmentId}
 */
export const deleteDepartment = async departmentId => {
  const response = await axiosInstance.delete(`/api/admin/departments/${departmentId}`);
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

/**
 * 관리자 사용자 삭제
 * DELETE /api/admin/users/{userId}
 */
export const deleteAdminUser = async userId => {
  const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
  return response.data;
};
