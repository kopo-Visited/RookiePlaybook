import axios from 'axios';
import useAuthStore from '../stores/authStore';
import useToastStore from '../stores/toastStore';
import { ROUTES } from '../constants/routes';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response.data,
  error => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      useToastStore.getState().show('세션이 만료되었습니다. 다시 로그인해주세요.');
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }
    } else if (status === 403) {
      useToastStore.getState().show('접근 권한이 없습니다.');
    } else if (status >= 500) {
      useToastStore.getState().show('일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
