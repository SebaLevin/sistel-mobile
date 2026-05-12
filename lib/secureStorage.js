import * as SecureStore from 'expo-secure-store';

const KEYS = {
  token: 'auth_token',
  refreshToken: 'auth_refresh_token',
  user: 'auth_user',
  empresas: 'auth_empresas',
  savedUsername: 'saved_username',
  savedPassword: 'saved_password',
};

export const secureStorage = {
  async setToken(token) {
    await SecureStore.setItemAsync(KEYS.token, token);
  },
  async getToken() {
    return SecureStore.getItemAsync(KEYS.token);
  },
  async setRefreshToken(token) {
    await SecureStore.setItemAsync(KEYS.refreshToken, token);
  },
  async getRefreshToken() {
    return SecureStore.getItemAsync(KEYS.refreshToken);
  },
  async setUser(user) {
    await SecureStore.setItemAsync(KEYS.user, JSON.stringify(user));
  },
  async getUser() {
    const raw = await SecureStore.getItemAsync(KEYS.user);
    return raw ? JSON.parse(raw) : null;
  },
  async setEmpresas(empresas) {
    await SecureStore.setItemAsync(KEYS.empresas, JSON.stringify(empresas));
  },
  async getEmpresas() {
    const raw = await SecureStore.getItemAsync(KEYS.empresas);
    return raw ? JSON.parse(raw) : null;
  },
  async setSavedCredentials(username, password) {
    await SecureStore.setItemAsync(KEYS.savedUsername, username);
    await SecureStore.setItemAsync(KEYS.savedPassword, password);
  },
  async getSavedCredentials() {
    const username = await SecureStore.getItemAsync(KEYS.savedUsername);
    const password = await SecureStore.getItemAsync(KEYS.savedPassword);
    if (username && password) return { username, password };
    return null;
  },
  async clearSavedCredentials() {
    await SecureStore.deleteItemAsync(KEYS.savedUsername);
    await SecureStore.deleteItemAsync(KEYS.savedPassword);
  },
  async clearAuth() {
    await SecureStore.deleteItemAsync(KEYS.token);
    await SecureStore.deleteItemAsync(KEYS.refreshToken);
    await SecureStore.deleteItemAsync(KEYS.user);
    await SecureStore.deleteItemAsync(KEYS.empresas);
  },
};
