import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { getApiBaseUrl } from './baseUrl';

const API_BASE_URL = getApiBaseUrl();

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function extractErrorMessage(error: AxiosError): string {
  const responseData = error.response?.data as
    | { message?: string; error?: string }
    | undefined;

  return responseData?.message || responseData?.error || error.message || 'Request failed';
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
    }

    if (import.meta.env.DEV) {
      if (error.response) {
        console.error(`API error (${error.response.status}):`, error.response.data);
      } else if (error.request) {
        console.error('Network error - no response received');
      } else {
        console.error('Error setting up request:', error.message);
      }
    }

    return Promise.reject(new Error(extractErrorMessage(error)));
  }
);

export default apiClient;

// Unwrap API envelope: backend returns {success, data, meta?} — extract inner payload
function unwrap(response: { success: boolean; data: unknown; meta?: Record<string, unknown> }) {
  if (response.meta) {
    // Paginated: merge meta into the response so slices get {data, total, page, pageSize, totalPages}
    return { data: response.data, ...response.meta };
  }
  return response.data;
}

export const api = {
  get: <T = unknown>(url: string, config?: object) =>
    apiClient.get<T>(url, config).then(res => unwrap(res.data as any) as T),
  post: <T = unknown>(url: string, data?: object, config?: object) =>
    apiClient.post<T>(url, data, config).then(res => unwrap(res.data as any) as T),
  put: <T = unknown>(url: string, data?: object, config?: object) =>
    apiClient.put<T>(url, data, config).then(res => unwrap(res.data as any) as T),
  patch: <T = unknown>(url: string, data?: object, config?: object) =>
    apiClient.patch<T>(url, data, config).then(res => unwrap(res.data as any) as T),
  delete: <T = unknown>(url: string, config?: object) =>
    apiClient.delete<T>(url, config).then(res => unwrap(res.data as any) as T),
};
