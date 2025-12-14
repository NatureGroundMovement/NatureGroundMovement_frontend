import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import "./ProfileHeader.css";
import { useEffect, useState, useRef } from "react";
import { faGear, faX } from "@fortawesome/free-solid-svg-icons";
import { faBell, faBellSlash } from "@fortawesome/free-regular-svg-icons";
import { faBox, faHammer, faArrowRightFromBracket, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../components/formatDate";
import "../../components/ReportButton";
import ReportButton from "../../components/ReportButton";
import { useNavigate, Link } from "react-router-dom";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";
import { useAuth } from "../../contexts/AuthProvider";

const ProfileHeader = ({ profile, counts, profileId, userUuid, isFollowed, myProfile, notify, setNotify, setIsFollowed, userRole }) => {
    const { handleLogout } = useAuth();
    const [moreMode, setMoreMode] = useState(false);
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const api = useAxios();
    const width = useWindowWidth();
    const isMobile = width < 768;
    const isTablet = width > 768 && width < 1024;
    const dropdownRef = useRef(null);

    const navigate = useNavigate();

    const handleToggle = () => {
        setIsSettingOpen((prev) => !prev)
    };

    useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSettingOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

    const handleFollow = async () => {
        if (!userUuid) {
            alert("로그인 후 이용해주세요.");
            return;
        }

        try {
            await api.post(
            "/api/follow",
            { followerUuid: userUuid, followingUuid: profileId },
            );

            setIsFollowed(true);
            setNotify(true);
        } catch (err) {
            console.error("팔로우 오류:", err);
            throw err;
        }
    };

    const handleUnfollow = async () => {
        if (!userUuid) {
            alert("로그인 후 이용해주세요.");
            return;
        }

        try {
            await api.post(
            "/api/follow/unfollow",
            { followerUuid: userUuid, followingUuid: profileId },
            );

            setIsFollowed(false);
        } catch (err) {
            console.error("언팔로우 오류:", err);
            throw err;
        }
    };

    const handleToggleNotify = async () => {
        try {
            const res = await api.patch(
            "/api/follow/notify",
            { userUuid, profileId },
            );

            setNotify(res.data.notify);
        } catch (err) {
            console.error("알림 토글 오류:", err);
            throw err;
        }
    };

    return (
        <div className="profile-header">
            {!isMobile ?
            <>
                <div className="profile">
                    {profile?.photoUrl ? (
                        <img src={profile?.photoUrl} alt="picture" />
                    ) : (
                        <FontAwesomeIcon icon={faUser} className="icon" />
                    )}
                </div>

                <div className="profile-info">
                    <h2 className="nickname">{profile?.nickname}{userRole === "admin" && <span className="admin-badge">*</span>}</h2>
                    <p className="follower">팔로워: {profile?.follower}명</p>
                    <p className="description">
                        {profile?.description.slice(0, 30)} 
                        <button onClick={() => setMoreMode(true)} className="see-more-btn">더보기</button>
                    </p>
                    
                    <div className="follow-container">
                        {myProfile ? (
                            <button className="follow-btn" onClick={() => navigate("/setting?menu=account")}>프로필 편집</button>
                            ) : (
                            <>
                                {isFollowed ? (
                                <>
                                    <button onClick={handleUnfollow} className="follow-btn cancel">언팔로우</button>

                                    {notify ? (
                                        <button className="notify-btn" onClick={handleToggleNotify}>
                                            <FontAwesomeIcon icon={faBell} />
                                        </button>
                                    ) : (
                                        <button className="notify-btn" onClick={handleToggleNotify}>
                                            <FontAwesomeIcon icon={faBellSlash} />
                                        </button>
                                    )}
                                </>
                                ) : (
                                <button onClick={handleFollow} className="follow-btn">
                                    팔로우
                                </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {isTablet &&
                    <div style={{ position: "relative" }}>
                        <button className="gear" onClick={handleToggle}>
                            <FontAwesomeIcon icon={faGear} />
                        </button>

                        {isSettingOpen &&
                            <div className="dropdown-menu" ref={dropdownRef}>
                                <ul>
                                    <Link to="/myroutine"><li onClick={handleToggle}><FontAwesomeIcon icon={faCalendar} /> <span>내 운동 루틴</span></li></Link>
                                    <Link to="/myblock"><li onClick={handleToggle}><FontAwesomeIcon icon={faBox} /> <span>내 운동 블럭</span></li></Link>
                                    <Link to="/setting"><li onClick={handleToggle}><FontAwesomeIcon icon={faGear} /> <span>설정</span></li></Link>
                                    {userRole === "admin" &&
                                    <Link to="/dashboard"><li onClick={handleToggle}><FontAwesomeIcon icon={faHammer} /> <span>관리자 페이지</span></li></Link>
                                    }
                                    <li onClick={handleLogout}><FontAwesomeIcon icon={faArrowRightFromBracket} /> <span>로그아웃</span></li>
                                </ul>
                            </div>
                        }
                    </div>
                }
            </> : 
            <div className="mobile-profile-header">
                <div className="mobile-profile">
                    <div className="profile">
                        {profile?.photoUrl ? (
                            <img src={profile?.photoUrl} alt="picture" />
                        ) : (
                            <FontAwesomeIcon icon={faUser} className="icon" />
                        )}
                    </div>

                    <div className="profile-info">
                        <h2 className="nickname">{profile?.nickname}{userRole === "admin" && <span className="admin-badge">*</span>}</h2>
                        <p className="follower">팔로워: {profile?.follower}명</p>
                    </div>

                    {isMobile &&
                    <div style={{ position: "relative" }}>
                        <button className="gear" onClick={handleToggle}>
                            <FontAwesomeIcon icon={faGear} />
                        </button>

                        {isSettingOpen &&
                            <div className="dropdown-menu" ref={dropdownRef}>
                                <ul>
                                    <Link to="/myroutine"><li onClick={handleToggle}><FontAwesomeIcon icon={faCalendar} /> <span>내 운동 루틴</span></li></Link>
                                    <Link to="/myblock"><li onClick={handleToggle}><FontAwesomeIcon icon={faBox} /> <span>내 운동 블럭</span></li></Link>
                                    <Link to="/setting"><li onClick={handleToggle}><FontAwesomeIcon icon={faGear} /> <span>설정</span></li></Link>
                                    {userRole === "admin" &&
                                    <Link to="/dashboard"><li onClick={handleToggle}><FontAwesomeIcon icon={faHammer} /> <span>관리자 페이지</span></li></Link>
                                    }
                                    <li onClick={handleLogout}><FontAwesomeIcon icon={faArrowRightFromBracket} /> <span>로그아웃</span></li>
                                </ul>
                            </div>
                        }
                    </div>
                    }
                </div>

                <p className="description">
                        {profile?.description.slice(0, 30)} 
                        <button onClick={() => setMoreMode(true)} className="see-more-btn">더보기</button>
                    </p>
                    
                    <div className="follow-container">
                        {myProfile ? (
                            <>  
                                <button className="follow-btn" onClick={() => navigate("/setting?menu=account")}>프로필 편집</button>
                            </>
                            ) : (
                            <>
                                {isFollowed ? (
                                <>
                                    <button onClick={handleUnfollow} className="follow-btn cancel">언팔로우</button>

                                    {notify ? (
                                        <button className="notify-btn" onClick={handleToggleNotify}>
                                            <FontAwesomeIcon icon={faBell} />
                                        </button>
                                    ) : (
                                        <button className="notify-btn" onClick={handleToggleNotify}>
                                            <FontAwesomeIcon icon={faBellSlash} />
                                        </button>
                                    )}
                                </>
                                ) : (
                                <button onClick={handleFollow} className="follow-btn">
                                    팔로우
                                </button>
                                )}
                            </>
                        )}
                    </div>
            </div>
            }

            {moreMode &&
            <div className="overlay">
                <div className="more-mode">
                    <div className="header">
                        <h3>{profile?.nickname}</h3>
                        <button onClick={() => setMoreMode(false)}>
                            <FontAwesomeIcon icon={faX} />
                        </button>
                    </div>
                    <div className="content">
                        <div>
                            <label>소개글</label>
                            <p className="info">{profile?.description}</p>
                        </div>
                        <div>
                            <label>추가 정보</label>
                            <div className="extra-info">
                                <p>일지 {counts.diary || 0}개</p>
                                <p>루틴 {counts.routine || 0}개</p>
                                <p>하이라이트 {counts.highlight || 0}개</p>
                                <p>커뮤니티 {counts.community || 0}개</p>
                                <p>프로필 생성일: {formatDate(profile.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                    {!myProfile &&
                    <div className="footer">
                        <ReportButton
                            targetId={profileId}
                            targetType="profile"
                        />
                    </div> 
                    }
                </div>
            </div>
            }
        </div>
    );
};

export default ProfileHeader;