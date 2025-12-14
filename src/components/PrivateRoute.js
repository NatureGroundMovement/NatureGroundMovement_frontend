import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";

function PrivateRoute({ children }) {
  const { isLoggedIn, status, authLoading } = useAuth();

  // 🔒 1) 인증 정보 로딩 중이면 어떤 동작도 하지 않음
  if (authLoading) {
    return <></>; 
  }

  // ❌ 2) 로그인 안 되어있으면 로그인 페이지로 이동
  if (!isLoggedIn) {
    alert("로그인 후 이용해 주세요.");
    return <Navigate to="/login" replace />;
  }

  // ⛔ 3) 계정 정지 상태라면 접근 차단
  if (status === "banned") {
    alert("현재 계정이 정지 상태입니다.");
    return <Navigate to="/" replace />;
  }

  // ✅ 4) 정상 접근
  return children;
}

export default PrivateRoute;
