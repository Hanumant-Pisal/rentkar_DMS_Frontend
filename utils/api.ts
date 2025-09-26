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
console.log('API Base URL:', API_BASE_URL); // Debug log

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Include cookies in cross-origin requests
});
// Add response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error: AxiosErrorWithResponse) => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      responseData: error.response?.data
    });

    if (error.response?.status === 403) {
      console.log('403 Forbidden - Token might be invalid or expired');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

API.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      console.log('Current token:', token ? 'Token exists' : 'No token found');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
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
      const responseData = error.response.data as ErrorResponse;
      const serverMessage = responseData?.message || responseData?.error;
      error.message = serverMessage || 'Invalid credentials. Please try again.';
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
