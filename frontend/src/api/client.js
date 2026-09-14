import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const BASE_URL = "http://localhost:8000";

const client = axios.create({
  baseURL: BASE_URL,
});

// Attach token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error?.response?.data?.detail;
    const wasAuthenticated = useAuthStore.getState().isAuthenticated;
    
    if (
      wasAuthenticated &&
      error?.response?.status === 403 &&
      typeof detail === "string" &&
      detail.includes("blocked")
    ) {
      useAuthStore.getState().logout();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default client;