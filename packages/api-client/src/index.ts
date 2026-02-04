// RangeXp API Client - uses native fetch for React Native compatibility

// En desarrollo, usa la IP de la máquina local
// En producción, usar variable de entorno o URL de producción
const getApiBaseUrl = () => {
  // @ts-ignore - Expo environment variable
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) {
    // @ts-ignore
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // Fallback para desarrollo - cambiar IP según tu red local
  return "http://192.168.1.37:3000/v1";
};

const API_BASE_URL = getApiBaseUrl();

// Auth token management
let authToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Callbacks for token refresh and logout
let onTokenRefreshed: ((newToken: string) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;
let getRefreshToken: (() => string | null) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
};

export const getStoredRefreshToken = () => refreshToken;

// Configure callbacks for token refresh handling
export const configureAuth = (config: {
  onTokenRefreshed?: (newToken: string) => void;
  onRefreshFailed?: () => void;
  getRefreshToken?: () => string | null;
}) => {
  onTokenRefreshed = config.onTokenRefreshed || null;
  onRefreshFailed = config.onRefreshFailed || null;
  getRefreshToken = config.getRefreshToken || null;
};

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuthRefresh?: boolean; // Skip refresh logic (used for refresh endpoint itself)
}

async function attemptTokenRefresh(): Promise<string | null> {
  // Get refresh token from callback or stored value
  const currentRefreshToken = getRefreshToken ? getRefreshToken() : refreshToken;

  if (!currentRefreshToken) {
    console.log('[apiClient] No refresh token available');
    return null;
  }

  try {
    console.log('[apiClient] Attempting token refresh...');

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      console.log('[apiClient] Token refresh failed with status:', response.status);
      return null;
    }

    const data = await response.json();

    if (data.accessToken) {
      console.log('[apiClient] Token refreshed successfully');
      authToken = data.accessToken;

      // Notify the app about the new token
      if (onTokenRefreshed) {
        onTokenRefreshed(data.accessToken);
      }

      return data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('[apiClient] Token refresh error:', error);
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T }> {
  const { method = "GET", body, headers = {}, skipAuthRefresh = false } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (authToken) {
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${authToken}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, config);
  let data = await response.json();

  // Handle 401 Unauthorized - attempt token refresh
  if (response.status === 401 && !skipAuthRefresh) {
    const errorMessage = data.message || '';
    const isTokenExpired = errorMessage.includes('expired') ||
                          errorMessage.includes('jwt') ||
                          errorMessage === 'Unauthorized';

    if (isTokenExpired) {

      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = attemptTokenRefresh();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (newToken) {
        // Retry the original request with new token
        console.log('[apiClient] Retrying request with new token...');
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;

        response = await fetch(url, config);
        data = await response.json();

        if (response.ok) {
          return { data };
        }
      } else {
        // Refresh failed - notify app to logout
        console.log('[apiClient] Token refresh failed, triggering logout...');
        if (onRefreshFailed) {
          onRefreshFailed();
        }
      }
    }
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed") as Error & { response?: { data: unknown; status: number } };
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
}

export const apiClient = {
  get: <T = unknown>(url: string, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "GET", ...config }),

  post: <T = unknown>(url: string, body?: unknown, config?: { headers?: Record<string, string>; skipAuthRefresh?: boolean }) =>
    request<T>(url, { method: "POST", body, ...config }),

  put: <T = unknown>(url: string, body?: unknown, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "PUT", body, ...config }),

  patch: <T = unknown>(url: string, body?: unknown, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "PATCH", body, ...config }),

  delete: <T = unknown>(url: string, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "DELETE", ...config }),
};

export default apiClient;
