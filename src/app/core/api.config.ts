export const ADMIN_TOKEN_KEY = 'within.admin.accessToken';
export const ADMIN_REFRESH_TOKEN_KEY = 'within.admin.refreshToken';
export const PROVIDER_TOKEN_KEY = 'within.provider.accessToken';
export const PROVIDER_REFRESH_TOKEN_KEY = 'within.provider.refreshToken';
export const API_TARGET_KEY = 'within.api.target';
export const CUSTOM_API_BASE_KEY = 'within.api.customBaseUrl';

const LOCAL_API_PORT = '5177';
//const ONLINE_API_BASE = 'https://webapp-within-np-001-bxftg0d9fhd8cjbg.australiasoutheast-01.azurewebsites.net/api';
const ONLINE_API_BASE = ' https://localhost:7264';


type ApiTarget = 'local' | 'online' | 'custom';

declare global {
  interface Window {
    __WITHIN_CONFIG__?: {
      apiBaseUrl?: string;
      apiTarget?: ApiTarget;
    };
  }
}

export const API_BASE = resolveApiBase();

export function setApiTarget(target: ApiTarget, customBaseUrl?: string): void {
  localStorage.setItem(API_TARGET_KEY, target);
  if (customBaseUrl) {
    localStorage.setItem(CUSTOM_API_BASE_KEY, trimTrailingSlash(customBaseUrl));
  }
}

export function clearApiTarget(): void {
  localStorage.removeItem(API_TARGET_KEY);
  localStorage.removeItem(CUSTOM_API_BASE_KEY);
}

function resolveApiBase(): string {
  const runtimeConfig = typeof window !== 'undefined' ? window.__WITHIN_CONFIG__ : undefined;
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalHost = isLocalDevelopmentHost(host);

  if (runtimeConfig?.apiBaseUrl) {
    return trimTrailingSlash(runtimeConfig.apiBaseUrl);
  }

  const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
  const queryTarget = normalizeTarget(url?.searchParams.get('api'));
  const queryCustomBase = url?.searchParams.get('apiBase');
  if (queryTarget) {
    setApiTarget(queryTarget, queryCustomBase ?? undefined);
    return targetToBaseUrl(queryTarget);
  }
  if (queryCustomBase) {
    setApiTarget('custom', queryCustomBase);
    return trimTrailingSlash(queryCustomBase);
  }

  if (isLocalHost) {
    return localApiBase();
  }

  const configuredTarget = normalizeTarget(runtimeConfig?.apiTarget ?? localStorage.getItem(API_TARGET_KEY));
  if (configuredTarget) {
    return targetToBaseUrl(configuredTarget);
  }

  return ONLINE_API_BASE;
}

function targetToBaseUrl(target: ApiTarget): string {
  if (target === 'local') return localApiBase();
  if (target === 'online') return ONLINE_API_BASE;
  return localStorage.getItem(CUSTOM_API_BASE_KEY) ?? localApiBase();
}

function localApiBase(): string {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const apiHost = host && host !== '127.0.0.1' && host !== '::1' ? host : 'localhost';
  return `http://${apiHost}:${LOCAL_API_PORT}/api`;
}

function isLocalDevelopmentHost(host: string): boolean {
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true;
  if (host.startsWith('192.168.') || host.startsWith('10.')) return true;

  const match = /^172\.(\d{1,2})\./.exec(host);
  return match ? Number(match[1]) >= 16 && Number(match[1]) <= 31 : false;
}

function normalizeTarget(value: string | null | undefined): ApiTarget | null {
  if (value === 'local' || value === 'online' || value === 'custom') return value;
  return null;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}
