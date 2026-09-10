import axios from 'axios';

const apiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://school-backend-eosin-rho.vercel.app/api/v1' : '/api/v1');

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
  timeout: 45000,
});

const GET_CACHE_TTL = 60_000;
const GET_CACHE = new Map();
const INFLIGHT = new Map();
const CACHE_PATHS = new Set(['/classes', '/sections', '/subjects', '/periods', '/meta']);

function cacheKey(config) {
  const url = (config.url || '').split('?')[0];
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${(config.method || 'get').toLowerCase()}:${url}?${params}`;
}

function isCacheableGet(config) {
  const url = (config.url || '').split('?')[0];
  return (config.method || 'get').toLowerCase() === 'get' && CACHE_PATHS.has(url);
}

function isGet(config) {
  return (config.method || 'get').toLowerCase() === 'get';
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edunest_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (isCacheableGet(config) && !config.params?.q) {
    const hit = GET_CACHE.get(cacheKey(config));
    if (hit && Date.now() - hit.at < GET_CACHE_TTL) {
      config.adapter = async () => ({
        data: hit.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      });
      return config;
    }
  }
  if (isGet(config)) {
    const key = cacheKey(config);
    const pending = INFLIGHT.get(key);
    if (pending) {
      config.adapter = () => pending;
    } else {
      const adapter = config.adapter || axios.getAdapter(axios.defaults.adapter);
      config.adapter = (cfg) => {
        const req = Promise.resolve(adapter(cfg)).finally(() => INFLIGHT.delete(key));
        INFLIGHT.set(key, req);
        return req;
      };
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (isCacheableGet(res.config) && !res.config.params?.q) {
      GET_CACHE.set(cacheKey(res.config), { at: Date.now(), data: res.data });
    }
    const method = (res.config.method || '').toLowerCase();
    if (['post', 'patch', 'put', 'delete'].includes(method)) {
      GET_CACHE.clear();
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    if (
      original &&
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
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
