import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const studentAPI = {
  getAll: (params?: any) => api.get('/students', { params }),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  updateStatus: (id: string, status: string) => api.put(`/students/${id}/status`, { status }),
};

export const documentAPI = {
  upload: (formData: FormData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getByStudent: (studentId: string) => api.get(`/documents/student/${studentId}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const paymentAPI = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  confirm: (paymentId: string) => api.post('/payments/confirm', { paymentId }),
  getByStudent: (studentId: string) => api.get(`/payments/student/${studentId}`),
  getReceipt: (id: string) => api.get(`/payments/${id}/receipt`),
  getAll: (params?: any) => api.get('/payments', { params }),
};
