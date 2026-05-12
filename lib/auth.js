import { api } from './api';
import { secureStorage } from './secureStorage';
import { resetToLogin } from './navigationRef';

export async function login(username, password) {
  const { data } = await api.post('/auth/login', { username, password }, { skipAuth: true });
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error('Respuesta de login inválida');
  }
  await secureStorage.setToken(data.access_token);
  await secureStorage.setRefreshToken(data.refresh_token);
  if (data.user) await secureStorage.setUser(data.user);
  if (data.empresas) await secureStorage.setEmpresas(data.empresas);
  return data;
}

export async function logout() {
  try {
    const user = await secureStorage.getUser();
    const token = await secureStorage.getToken();
    if (user?.username && token) {
      try {
        const { data } = await api.post('/auth/logout', {
          usuario: user.username,
          token,
        });
        console.log('[logout] backend OK', data);
      } catch (err) {
        console.warn(
          '[logout] backend FAILED',
          err?.response?.status,
          err?.message,
        );
      }
    }
  } finally {
    await secureStorage.clearAuth();
    resetToLogin();
  }
}

export async function isAuthenticated() {
  const token = await secureStorage.getToken();
  return !!token;
}
