import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edunest_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('edunest_refresh');
        const { data } = await api.post('/auth/refresh', refreshToken ? { refreshToken } : {});
        localStorage.setItem('edunest_access', data.accessToken);
        if (data.refreshToken) localStorage.setItem('edunest_refresh', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('edunest_access');
        localStorage.removeItem('edunest_refresh');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
