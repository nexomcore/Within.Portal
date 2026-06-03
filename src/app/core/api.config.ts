export const ADMIN_TOKEN_KEY = 'within.admin.accessToken';
export const ADMIN_REFRESH_TOKEN_KEY = 'within.admin.refreshToken';

export const API_BASE = (() => {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5177/api';
  }
  return 'https://app-within-api-np-001.azurewebsites.net/api';
})();
