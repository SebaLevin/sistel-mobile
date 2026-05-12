import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from './secureStorage';
import { resetToLogin } from './navigationRef';

const DEFAULT_DNS = '10.0.2.2';
const DEFAULT_PORT = '3501';

async function buildBaseURL() {
  const dns = (await AsyncStorage.getItem('app_dns')) || DEFAULT_DNS;
  const port = (await AsyncStorage.getItem('app_port')) || DEFAULT_PORT;
  return `http://${dns}:${port}`;
}

export const api = axios.create();

api.interceptors.request.use(async (config) => {
  if (!config.baseURL) {
    config.baseURL = await buildBaseURL();
  }
  if (!config.skipAuth) {
    const token = await secureStorage.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let refreshPromise = null;

async function performRefresh() {
  const refreshToken = await secureStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  const baseURL = await buildBaseURL();
  const { data } = await axios.post(
    `${baseURL}/auth/refresh`,
    { refresh_token: refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!data?.access_token) throw new Error('Invalid refresh response');
  await secureStorage.setToken(data.access_token);
  if (data.refresh_token) await secureStorage.setRefreshToken(data.refresh_token);
  return data.access_token;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || original?._retry || original?.skipAuth) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
      const newToken = await refreshPromise;
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      await secureStorage.clearAuth();
      resetToLogin();
      return Promise.reject(refreshErr);
    }
  }
);
