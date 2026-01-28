import axios from 'axios';
import { getToken } from '../components/authStorage';

// CourseService API runs on port 5021
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5021/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Thêm token vào header
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    console.log('[axiosClient] Token from localStorage:', token ? 'EXISTS' : 'NULL');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[axiosClient] Added Authorization header');
    } else {
      console.warn('[axiosClient] NO TOKEN FOUND!');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - KHÔNG redirect, chỉ handle errors
axiosClient.interceptors.response.use(
  (res) => res.data,
  (error) => {
    // Log lỗi để debug
    console.error('[API Error]', error.response?.status, error.response?.data);
    
    const message = error.response?.data?.message || 'Lỗi kết nối server';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;