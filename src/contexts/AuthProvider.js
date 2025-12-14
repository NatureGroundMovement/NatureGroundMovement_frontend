import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/firebase";
import axios from "axios";

const AuthContext = createContext();
let refreshPromise = null;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken"));
  const [userUuid, setUserUuid] = useState(null);
  const [uid, setUid] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchUserInfo = async (jwt) => {
    try {
      const res = await axios.get("/api/users/myUuid", { headers: { Authorization: `Bearer ${jwt}` } });
      setUserUuid(res.data.uuid);
      setUserRole(res.data.role);
      setStatus(res.data.status);
    } catch (err) {
      console.error("사용자 정보 불러오기 실패:", err);
    }
  };

  const loginToServer = async (firebaseIdToken) => {
    try {
      const res = await axios.post("/api/auth/google-login", { idToken: firebaseIdToken });
      const { accessToken: a, refreshToken: r } = res.data;
      localStorage.setItem("accessToken", a);
      localStorage.setItem("refreshToken", r);
      setAccessToken(a);
      setRefreshToken(r);
      setIsLoggedIn(true);
      await fetchUserInfo(a);
    } catch (err) {
      console.error("서버 로그인 실패:", err);
    }
  };

  // 🔹 refreshToken 중복 호출 방지 + 최신 accessToken 반환
  const refreshTokens = async () => {
    if (!refreshToken) throw new Error("No refresh token");
    if (refreshPromise) return refreshPromise; // 이미 진행 중이면 Promise 재사용

    refreshPromise = axios
      .post("/api/auth/refresh", {}, { headers: { Authorization: `Bearer ${refreshToken}` } })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        return res.data.accessToken; // 요청에서 바로 사용 가능
      })
      .catch((err) => {
        console.error("Refresh 실패 → 로그아웃", err);
        handleLogout();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
        setRefreshLoading(false);
      });

    return refreshPromise;
  };

  const handleLogout = async () => {
    try { if (userUuid) await axios.post("/api/auth/logout", { userUuid }); } catch {}
    setAccessToken(null);
    setRefreshToken(null);
    setUserUuid(null);
    setUserRole(null);
    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    await authService.signOut();
  };

  // Firebase 상태 감지
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        setUid(user.uid);
        const idToken = await user.getIdToken();
        if (!accessToken) await loginToServer(idToken);
        setIsLoggedIn(true);
      } else {
        setUid(null);
        handleLogout();
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 새로고침 시 초기 refresh
  useEffect(() => {
    const initAuth = async () => {
      if (refreshToken) {
        setRefreshLoading(true);
        try {
          const newAccess = await refreshTokens();
          await fetchUserInfo(newAccess);
          setIsLoggedIn(true);
        } catch {
          handleLogout();
        }
      } else {
        setRefreshLoading(false);
      }
    };
    initAuth();
  }, []);

  const value = {
    accessToken,
    refreshToken,
    userUuid,
    userRole,
    status,
    authLoading,
    refreshLoading,
    isLoggedIn,
    setAccessToken,
    setRefreshToken,
    refreshTokens,
    handleLogout,
    uid
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
