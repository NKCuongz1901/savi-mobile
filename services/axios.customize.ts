import { useAuthStore } from "@/store/auth";
import axios, { AxiosError, AxiosInstance } from "axios";
import Constants from "expo-constants";
import Toast from "react-native-toast-message";

// Compute API base URL from Expo extra or fallback
const baseURL: string =
  (Constants?.expoConfig?.extra as any)?.API_URL ||
  (Constants?.manifest2 as any)?.extra?.API_URL ||
  "http://localhost:3000";

console.log("API baseURL →", baseURL);

const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 20000,
});

// Request interceptor: attach Authorization header if token exists
api.interceptors.request.use((config) => {
  try {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  } catch {}

  // DEBUG LOGS
  (config as any)._ts = Date.now();
  const method = (config.method ?? "GET").toUpperCase();
  const fullUrl = `${config.baseURL ?? ""}${config.url ?? ""}`;
  console.log("HTTP →", method, fullUrl);
  if (config.params) console.log("Params →", config.params);
  if (config.data) console.log("Body →", config.data);

  return config;
});

// Response interceptor: standardize errors, auto-logout on 401
api.interceptors.response.use(
  (response) => {
    const started = (response.config as any)._ts ?? Date.now();
    const ms = Date.now() - started;
    const method = (response.config.method ?? "GET").toUpperCase();
    const fullUrl = `${response.config.baseURL ?? ""}${response.config.url ?? ""}`;
    console.log("HTTP ✓", response.status, method, fullUrl, `${ms}ms`);
    return response;
  },
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    if (status === 401) {
      try {
        useAuthStore.getState().logout();
      } catch {}
    }

    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      "Network error";

    // DEBUG LOGS
    const cfg: any = error.config || {};
    const method = (cfg.method ?? "GET").toUpperCase();
    const fullUrl = `${cfg.baseURL ?? ""}${cfg.url ?? ""}`;
    const started = cfg._ts ?? Date.now();
    const ms = Date.now() - started;
    console.log("HTTP ✗", status ?? "NO_STATUS", method, fullUrl, `${ms}ms`, "-", message);

    // Show toast for errors
    try {
      Toast.show({ type: "error", text1: "Request failed", text2: message });
    } catch {}

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
      original: error,
    });
  }
);

export default api;