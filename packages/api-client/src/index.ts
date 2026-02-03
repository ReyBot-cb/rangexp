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

// Helper to set auth token
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T }> {
  const { method = "GET", body, headers = {} } = options;

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

  const response = await fetch(url, config);

  const data = await response.json();

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

  post: <T = unknown>(url: string, body?: unknown, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "POST", body, ...config }),

  put: <T = unknown>(url: string, body?: unknown, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "PUT", body, ...config }),

  patch: <T = unknown>(url: string, body?: unknown, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "PATCH", body, ...config }),

  delete: <T = unknown>(url: string, config?: { headers?: Record<string, string> }) =>
    request<T>(url, { method: "DELETE", ...config }),
};

export default apiClient;
