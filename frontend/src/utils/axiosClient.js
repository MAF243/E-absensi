import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import useUiStore from '../store/useUiStore';
import { API_URL } from '../config/api';

const axiosClient = axios.create({
  baseURL: `${API_URL}/api`, 
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Abaikan auto-logout jika request berasal dari endpoint login
        const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
        
        if (!isLoginRequest) {
          // Auto logout if 401 Unauthorized dari endpoint selain login
          useAuthStore.getState().logout();
          useUiStore.getState().showToast('Sesi berakhir, silakan login kembali', 'error');
          window.location.href = '/'; // Force redirect to login
        }
      } else if (error.response.status >= 500) {
        // Global Server Error Toast
        useUiStore.getState().showToast(error.response.data?.message || 'Terjadi kesalahan pada server (500)', 'error');
      }
    } else {
      // Network error (no response)
      useUiStore.getState().showToast('Koneksi terputus. Gagal menghubungi server.', 'error');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
