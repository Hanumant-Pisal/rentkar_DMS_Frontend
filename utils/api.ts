import axios, { 
  AxiosError, 
  AxiosResponse, 
  AxiosRequestHeaders, 
  InternalAxiosRequestConfig,
  AxiosInstance
} from "axios";
import { getToken, removeToken, removeUser } from './auth';

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
    _retry?: boolean;
  };
};

// Ensure API URL is properly formatted
const getApiBaseUrl = (): string => {
  // Default to empty string if not set
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  // Remove trailing slash if present
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 15000, // Increased timeout for production
    withCredentials: true, // Important for cookies/sessions
  });

  // Request interceptor for API calls
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Only run on client-side
      if (typeof window !== 'undefined') {
        try {
          const token = getToken();
          
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            
            // Log for debugging (remove in production)
            if (process.env.NODE_ENV === 'development') {
              console.log('API Request:', {
                url: config.url,
                method: config.method,
                hasToken: !!token,
              });
            }
          }
        } catch (error) {
          console.error('Error in request interceptor:', error);
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log successful responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data,
        });
      }
      return response;
    },
    async (error: AxiosErrorWithResponse) => {
      const originalRequest = error.config;
      
      // Log error details for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status: error.response?.status,
          data: error.response?.data,
        });
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please check your internet connection.';
      } else if (!error.response) {
        error.message = 'Network Error: Unable to connect to the server';
      } 
      // Handle 401 Unauthorized
      else if (error.response.status === 401) {
        // Clear auth data and redirect to login
        if (typeof window !== 'undefined') {
          removeToken();
          removeUser();
          window.location.href = '/auth/login';
        }
        
        const responseData = error.response.data as ErrorResponse;
        const serverMessage = responseData?.message || responseData?.error;
        error.message = serverMessage || 'Your session has expired. Please log in again.';
      } 
      // Handle 403 Forbidden
      else if (error.response.status === 403) {
        const responseData = error.response.data as ErrorResponse;
        error.message = responseData.message || 'You do not have permission to access this resource.';
        
        // Optionally redirect to dashboard or home if user tries to access admin area
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.href = '/dashboard';
        }
      }
      // Handle other error statuses
      else if (error.response.data) {
        const responseData = error.response.data as ErrorResponse;
        error.message = responseData.message || responseData.error || 'An error occurred';
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create and export a single instance
const API = createApiInstance();

export default API;
