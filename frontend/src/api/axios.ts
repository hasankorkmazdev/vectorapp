import axios from "axios";
import i18n from "@/i18n/config";

const STORAGE_KEY = "auth-storage";

function getStoredAuth(): { token: string | null; orgId: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, orgId: null };
    const parsed = JSON.parse(raw);
    return {
      token: parsed?.state?.token || null,
      orgId: parsed?.state?.activeOrganizationId || null,
    };
  } catch {
    return { token: null, orgId: null };
  }
}

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const { token, orgId } = getStoredAuth();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (orgId) config.headers["X-Organization-Id"] = orgId;
  config.headers["Accept-Language"] = i18n.language || "tr";
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const handleLogoutAndRedirect = async () => {
  const { useAppStore } = await import("@/store/app-store");
  useAppStore.getState().logout();
};

const isAuthRequest = (url?: string): boolean => {
  return !!url?.includes("/auth/") && !url?.includes("/auth/refresh-token");
};

const queueFailedRequest = (originalRequest: any) => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  })
    .then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    })
    .catch((err) => Promise.reject(err));
};

const performTokenRefresh = async (): Promise<string> => {
  const response = await api.post("/auth/refresh-token");
  const newToken = response.data.token;

  const { useAppStore } = await import("@/store/app-store");
  useAppStore.getState().setToken(newToken);

  return newToken;
};

const handleUnauthorizedError = async (error: any) => {
  const originalRequest = error.config;
  const url = originalRequest.url;

  if (isAuthRequest(url)) {
    return Promise.reject(error);
  }

  if (url?.includes("/auth/refresh-token")) {
    await handleLogoutAndRedirect();
    return Promise.reject(error);
  }

  if (!originalRequest._retry) {
    if (isRefreshing) {
      return queueFailedRequest(originalRequest);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await performTokenRefresh();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await handleLogoutAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      return handleUnauthorizedError(error);
    }
    return Promise.reject(error);
  }
);
