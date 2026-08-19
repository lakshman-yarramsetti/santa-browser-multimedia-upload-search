import axios from 'axios';

const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshPromise;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;

    if (
      error.response?.status !== 401 ||
      request?._retry ||
      request?.url === '/auth/refresh'
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      refreshPromise ??= api
        .post('/auth/refresh')
        .finally(() => {
          refreshPromise = undefined;
        });

      await refreshPromise;

      return api(request);
    } catch {
      return Promise.reject(error);
    }
  }
);

export default api;