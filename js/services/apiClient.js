import axios from 'axios';

// Базовый URL API - настройте согласно вашему бэкенду
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Создание axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - добавляет токен к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Логирование запросов в dev режиме
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - обработка ответов и ошибок
apiClient.interceptors.response.use(
  (response) => {
    // Логирование успешных ответов в dev режиме
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response.data;
  },
  (error) => {
    // Детальная обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - очищаем токен и перенаправляем на логин
          console.error('[API Error] Unauthorized - redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');

          // Перенаправление на страницу логина
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - недостаточно прав
          console.error('[API Error] Forbidden - insufficient permissions');
          break;

        case 404:
          // Not Found
          console.error('[API Error] Resource not found');
          break;

        case 422:
          // Validation Error
          console.error('[API Error] Validation failed', data);
          break;

        case 500:
        case 502:
        case 503:
          // Server Error
          console.error('[API Error] Server error', data);
          break;

        default:
          console.error(`[API Error] ${status}`, data);
      }

      // Создаем более удобный объект ошибки
      const apiError = {
        status,
        message: data?.message || 'An error occurred',
        errors: data?.errors || {},
        data: data,
      };

      return Promise.reject(apiError);
    } else if (error.request) {
      // Запрос был отправлен, но ответа не получено
      console.error('[API Error] No response received', error.request);

      return Promise.reject({
        status: 0,
        message: 'Network error - no response from server',
        errors: {},
      });
    } else {
      // Ошибка при настройке запроса
      console.error('[API Error] Request setup failed', error.message);

      return Promise.reject({
        status: 0,
        message: error.message || 'Request failed',
        errors: {},
      });
    }
  }
);

// Вспомогательные методы для удобства использования
export const api = {
  // GET запрос
  get: (url, config = {}) => apiClient.get(url, config),

  // POST запрос
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

  // PUT запрос
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

  // PATCH запрос
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

  // DELETE запрос
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Установка базового URL (полезно для тестирования)
  setBaseURL: (url) => {
    apiClient.defaults.baseURL = url;
  },

  // Установка токена вручную
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('authToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('authToken');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },

  // Очистка токена
  clearAuthToken: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  },
};

export default apiClient;
