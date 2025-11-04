
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { getAccessToken, setAccessToken } from "./context/tokenHelper"; 


export const API_BASE = process.env.API_BASE || "http://192.168.1.25:5001"; 

const api = axios.create({
  baseURL: API_BASE + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

let isRefreshing = false;
let failedQueue: { resolve: (v?: any) => void; reject: (e?: any) => void; config: any }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else {
      if (p.config.headers) p.config.headers.Authorization = `Bearer ${token}`;
      p.resolve(api(p.config));
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const r = await axios.post(
          API_BASE + "/api/auth/refresh",
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = r.data.accessToken;
        await setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (e) {
        processQueue(e as any, null);
        isRefreshing = false;
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
