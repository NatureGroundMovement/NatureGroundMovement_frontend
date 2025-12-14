import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { authService } from "../services/firebase";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";

const Login = () => {
  const navigate = useNavigate();
  
  const provider = new GoogleAuthProvider();

  const onGoogleLogin = async () => {
    await signInWithPopup(authService, provider);
    navigate("/");
  };

  return (
    <div className="login-container">
      <Link to="/" className="logo">
        A-Routine
      </Link>
      <h3>
        운동 없이 못 사는 사람들을 위한<br/> 운동 커뮤니티
      </h3>
      <button onClick={onGoogleLogin} className="google-login-btn">
          Google로 계속하기
      </button>
    </div>
  );
};

export default Login;