import { useAuth } from "../../contexts/AuthProvider";
import { useProfile } from "../../contexts/ProfileProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useState, useEffect } from "react";
import { authService, storageService } from "../../services/firebase";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import "./AccountSetting.css";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import useWindowWidth from "../../components/useWindowWidth";
import { v4 as uuid } from "uuid";

const AccountSetting = ({ currentMenuLabel, toggleSidebarOpen }) => {
    const { userUuid, authLoading, uid  } = useAuth();
    const { profile, reloadProfile, profileLoading  } = useProfile(); 
    const width = useWindowWidth();
    const isMobile = width < 1024;

    const [nickname, setNickname] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(null);

    const [preview, setPreview] = useState("");
    const [profileImg, setProfileImg] = useState(null);

    const api = useAxios();

    useEffect(() => {
        if (!profile) return;

        setNickname(profile?.nickname || "");
        setDescription(profile?.description || "");
        setIsPublic(profile?.isPublic ?? true);
        setPreview(profile?.photoUrl || "");
    }, [profile]);

    // 이미지 선택
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfileImg(file);
        setPreview(URL.createObjectURL(file));
    };

    // 🔥 Firebase Storage 업로드 (너가 사용하던 구조와 동일)
    const uploadProfileImage = async () => {
        if (!profileImg) return profile.photoUrl; // 변경 없으면 기존 URL 유지

        const fileRef = ref(
            storageService,
            `profileImages/${uid}/${uuid()}`
        );

        await uploadBytes(fileRef, profileImg);
        const url = await getDownloadURL(fileRef);

        return url; // storage URL 반환
    };

    const handleSave = async () => {
        // storage에 업로드 → url 받기
        const uploadedUrl = await uploadProfileImage();

        // MongoDB 업데이트 요청
        await api.put(
            `api/profiles/update`,
            {
                uuid: userUuid,
                nickname,
                description,
                isPublic,
                profileUrl: uploadedUrl,
            },
        );

        alert("프로필이 저장되었습니다!");
        reloadProfile();
    };

    const handleDelete = async () => {
        // 🔥 1. 삭제 확인 메시지
        const ok = window.confirm(
            "정말 계정을 삭제하시겠습니까?\n\n삭제 후에는 복구할 수 없습니다."
        );
        if (!ok) return;

        try {
            // 🔥 2. Firebase 계정 삭제 (uid 자동 포함)
            const user = authService.currentUser;
            if (!user) throw new Error("로그인이 필요합니다.");

            await user.delete(); // Firebase Auth 계정 삭제 (uid 사라짐 전)

            // 🔥 3. 백엔드 계정 삭제 API 호출
            await api.delete(`/api/users/${userUuid}`);

            // 🔥 4. 사용자에게 알림
            alert("계정이 완전히 삭제되었습니다.");

            // 🔥 5. 로그아웃 처리 (안전하게)
            authService.signOut();

            // 필요 시 Redirect
            window.location.href = "/";
        } catch (error) {
            console.error("계정 삭제 중 오류:", error);

            // Firebase는 최근 로그인 요구할 수 있음 (토큰 만료 등)
            if (error.code === "auth/requires-recent-login") {
            alert("보안을 위해 다시 로그인 후 삭제를 시도해주세요.");
            } else {
            alert("계정 삭제 중 문제가 발생했습니다.");
            }
        }
    };

    if (authLoading || profileLoading) return <Spinner />;

    return (
        <div className="account-setting">
            <div className="setting-header">
                {isMobile &&
                    <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
                }
                <h2>{currentMenuLabel}</h2>
            </div>

            {/* 프로필 이미지 */}
            <div className="profile-picture">
                <div className="profile">
                    {preview ? (
                      <img src={preview} alt="picture" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="icon" />
                    )}
                </div>

                <input
                    id="profileImgInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                />

                {/* 버튼으로 input 트리거 */}
                <button
                    onClick={() => document.getElementById("profileImgInput").click()}
                    className="change-picture-btn"
                >
                    프로필 사진 변경
                </button>
            </div>

            {/* 닉네임 */}
            <div className="nickname-change">
                <h3>닉네임</h3>
                <input
                    type="text"
                    value={nickname}
                    placeholder="닉네임 입력"
                    onChange={(e) => setNickname(e.target.value)}
                />
            </div>

            {/* 소개 */}
            <div className="description-change">
                <h3>소개글</h3>
                <textarea
                    type="text"
                    maxLength={150}
                    value={description}
                    placeholder="소개글 입력 (최대 150자)"
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {/* 일지 공개 여부 */}
            <div className="public-change">
                <p><strong>일지 공개 여부</strong>사람들이 회원님이 작성한 운동 일지를 볼 수 있는지를 선택하세요.</p>
                <label className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={() => setIsPublic((p) => !p)}
                    />
                    <span className="slider" />
                </label>
            </div>

            <div className="save-btn">
                <button
                    onClick={handleSave}
                >
                    저장하기
                </button>
            </div>

            <div className="delete-account">
                <p><strong>계정 삭제</strong></p>
                <button onClick={handleDelete}>삭제하기</button>
            </div>
        </div>
    );
};

export default AccountSetting;
