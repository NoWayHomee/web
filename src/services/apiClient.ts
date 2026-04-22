// src/services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  // Đảm bảo URL này khớp với cổng NestJS đang chạy (mặc định 3000)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor gắn JWT Token vào Header trước khi gửi
apiClient.interceptors.request.use((config) => {
  // Lấy token từ localStorage (hoặc Zustand store)
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Xử lý Lỗi từ NestJS
apiClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng data để UI dễ dùng
    return response.data;
  },
  (error) => {
    // NestJS thường ném lỗi theo format: { statusCode, message, error }
    const res = error.response;
    if (res && res.data) {
      // Ép kiểu lỗi NestJS về một câu thông báo dễ hiểu cho UI
      const errorMessage = Array.isArray(res.data.message) 
        ? res.data.message[0] // NestJS Validation Array
        : res.data.message || 'Lỗi hệ thống từ Backend';
        
      console.error("API Error:", errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    return Promise.reject(error);
  }
);

export default apiClient;