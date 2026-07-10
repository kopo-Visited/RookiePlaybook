import axiosInstance from './axiosInstance';

/**
 * 계정 잠금해제 요청 등록 (비로그인 접근 가능)
 * POST /api/account-unlock-requests
 */
export const submitAccountUnlockRequest = ({
  name,
  email,
  employeeNo,
  departmentName,
  phone,
  memo,
}) =>
  axiosInstance.post('/api/account-unlock-requests', {
    name,
    email,
    employeeNo,
    departmentName,
    phone,
    memo,
  });

/**
 * 잠금해제 요청 목록 조회 (관리자)
 * GET /api/admin/account-unlock-requests
 */
export const getAccountUnlockRequests = () =>
  axiosInstance.get('/api/admin/account-unlock-requests');

/**
 * 처리 대기 중인 잠금해제 요청 수 조회 (관리자)
 * GET /api/admin/account-unlock-requests/pending-count
 */
export const getAccountUnlockPendingCount = () =>
  axiosInstance.get('/api/admin/account-unlock-requests/pending-count');

/**
 * 잠금해제 요청 처리 - 비밀번호 초기화 및 계정 잠금 해제 (관리자)
 * POST /api/admin/account-unlock-requests/{requestId}/resolve
 */
export const resolveAccountUnlockRequest = requestId =>
  axiosInstance.post(`/api/admin/account-unlock-requests/${requestId}/resolve`);
