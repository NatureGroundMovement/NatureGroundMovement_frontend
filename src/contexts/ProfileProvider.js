// ProfileContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { useAxios } from "./useAxios";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { userUuid } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true); // ⭐ 로딩 추가
  const api = useAxios();

  const fetchProfile = async () => {
    if (!userUuid) return;

    setProfileLoading(true); // ⭐ 로딩 시작

    try {
      const res = await api.get(
        `http://localhost:5000/api/users/${userUuid}`,
        {
          headers: {
            "Content-Type": "application/json"          
          },
        }
      );

      if (!res.data) throw new Error("프로필 정보 가져오기 실패");
      setProfile(res.data);
    } catch (error) {
      console.error("Profile fetch error:", error.message);
    }

    setProfileLoading(false); // ⭐ 로딩 끝
  };

  useEffect(() => {
    fetchProfile();
  }, [userUuid]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileLoading, // ⭐ 추가
        reloadProfile: fetchProfile, // ⭐ 새로고침 기능
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
