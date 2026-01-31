// RangeXp API Client
import createClient from "openapi-fetch";
import type { paths } from "./types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/v1";

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});

// Helper to set auth token
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Request interceptor to add auth
apiClient.use({
  onRequest: (request) => {
    if (authToken) {
      request.headers.set("Authorization", `Bearer ${authToken}`);
    }
  },
});

export default apiClient;
