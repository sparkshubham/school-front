import axios from 'axios';

const apiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://school-backend-eosin-rho.vercel.app/api/v1' : '/api/v1');

const api = axios.create({
  baseURL: apiBase,
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
