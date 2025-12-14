import axios from "axios";
import { useAuth } from "./AuthProvider";

export const useAxios = () => {
  const { accessToken, refreshTokens, handleLogout } = useAuth();
  const instance = axios.create();

  // 요청 인터셉터: refreshPromise가 있으면 대기 + 최신 accessToken 사용
  instance.interceptors.request.use(async (config) => {
    if (refreshTokens) {
      try {
        const newAccess = await refreshTokens();
        config.headers.Authorization = `Bearer ${newAccess}`;
      } catch {
        // refresh 실패 → handleLogout에서 처리
        throw new axios.Cancel("Token refresh failed");
      }
    } else if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // 응답 인터셉터: 401 → refresh 후 재시도
  instance.interceptors.response.use(
    (res) => res,
    async (err) => {
      const originalReq = err.config;

      if (axios.isCancel(err)) return Promise.reject(err);

      if (err.response?.status === 401 && !originalReq._retry) {
        originalReq._retry = true;
        try {
          const newAccess = await refreshTokens();
          originalReq.headers.Authorization = `Bearer ${newAccess}`;
          return instance(originalReq);
        } catch {
          return Promise.reject(err);
        }
      }
      return Promise.reject(err);
    }
  );

  return instance;
};
