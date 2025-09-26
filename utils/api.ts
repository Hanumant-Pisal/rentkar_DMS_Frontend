import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosRequestHeaders } from "axios";
type ErrorResponse = {
  message?: string;
  error?: string;
  [key: string]: string | number | boolean | null | undefined | string[] | number[] | Record<string, unknown>; 
};
type AxiosErrorWithResponse = AxiosError & {
  response?: AxiosResponse<ErrorResponse>;
  config?: {
    url?: string;
    method?: string;
    headers?: AxiosRequestHeaders;
  };
};
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});
API.interceptors.request.use(
  (config) => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers = config.headers || {};
          // Ensure we don't send empty or invalid tokens
          if (token.trim() !== '') {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            console.warn('Empty token found in localStorage');
          }
        } else {
          console.warn('No token found in localStorage');
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);
API.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosErrorWithResponse) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your internet connection.';
    } else if (!error.response) {
      error.message = 'Network Error: Unable to connect to the server';
    } else if (error.response.status === 401) {
      // Handle unauthorized (token expired or invalid)
      const responseData = error.response.data as ErrorResponse;
      const serverMessage = responseData?.message || responseData?.error;
      error.message = serverMessage || 'Your session has expired. Please log in again.';
      
      // Clear invalid token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    } else if (error.response.status === 403) {
      // Handle forbidden (no permission)
      const responseData = error.response.data as ErrorResponse;
      const serverMessage = responseData?.message || responseData?.error;
      error.message = serverMessage || 'You do not have permission to access this resource.';
      
      // Optionally redirect to dashboard or home if needed
      if (typeof window !== 'undefined' && !window.location.pathname.includes('dashboard')) {
        window.location.href = '/dashboard';
      }
    } else if (error.response.data) {
      const responseData = error.response.data as ErrorResponse;
      const serverMessage = responseData?.message || responseData?.error;
      if (serverMessage) {
        error.message = serverMessage;
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  }
);
export default API;
