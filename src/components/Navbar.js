import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-regular-svg-icons";
import "../css/Navbar.css";
import { useProfile } from "../contexts/ProfileProvider";
import { faBook, faCalendar, faPencil, faSearch, faUsers, faVideo, faBox, faGear, faHammer, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthProvider";
import Notifications from "./Notifications";
import { useAxios } from "../contexts/useAxios";

const Navbar = () => {
  const { profile } = useProfile();
  const { userUuid, userRole, isLoggedIn, handleLogout } = useAuth();
  const api = useAxios();
  const [open, setOpen] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [notification, setNotification] = useState([]);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const uploadRef = useRef(null);

  // 무한스크롤
  const [notifyPage, setNotifyPage] = useState(1);
  const [notifyHasMore, setNotifyHasMore] = useState(true);

  const bottomNotifyRef = useRef(null);

  const navigate = useNavigate();

  const fetchNotifications = async (page = 1) => {
    try {
      setNotifyLoading(true);

      const res = await api.get(`/api/notify/list-and-read?page=${page}&limit=20`, {
        params: { userUuid, page },
      });

      const list = res.data.list || [];

      if (page === 1) {
        setNotification(list);
      } else {
        setNotification((prev) => [...prev, ...list]);
      }

      // 20개 미만이면 더 없음
      setNotifyHasMore(list.length === 20);

    } catch (err) {
      console.error("알람 불러오기 에러:", err);
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen((prev) => !prev)
  };

  const handleToggleBell = () => {
    setOpenBell((prev) => !prev);

    if (!openBell) {
      setNotifyPage(1);
      fetchNotifications(1);
    }
  };

  const handleToggleUpload = () => {
    setOpenUpload((prev) => !prev);
  };

  useEffect(() => {
    if (!openBell) return; // 알림창 열릴 때만 작동

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && notifyHasMore && !notifyLoading) {
        const nextPage = notifyPage + 1;
        setNotifyPage(nextPage);
        fetchNotifications(nextPage);
      }
    });

    if (bottomNotifyRef.current) observer.observe(bottomNotifyRef.current);

    return () => observer.disconnect();
  }, [openBell, notifyPage, notifyHasMore, notifyLoading]);

  useEffect(() => {
    if (!userUuid) return;

    const checkHasUnreadNotifications = async () => {
      try {
        const res = await api.get("/api/notify/unread-exists", {
          params: { userUuid },
        });

        setHasUnread(res.data.hasUnread);
      } catch (err) {
        console.error("안 읽은 알람 여부 조회 에러:", err);
        return false;
      }
    };

    checkHasUnreadNotifications();
  }, [userUuid, notification])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpenBell(false);
      }
      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        setOpenUpload(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    // 🔥 검색 결과 페이지로 이동
    navigate(`/search?type=profile&keyword=${keyword}`);
    setKeyword("");
  };

  return (
    <div
      className="navbar-wrapper"
      onMouseLeave={() => setShowCategory(false)}
    >
      <div className="navbar-container">
        <div className="navbar-content">
          <Link to="/" className="logo">
            A-Routine
          </Link>

          {/* ✅ 카테고리 */}
          <div
            className="category-container"
            onMouseEnter={() => setShowCategory(true)}
          >
            <div className="category-label">카테고리</div>
          </div>

          <form className="search" onSubmit={handleSearch}>
            <input
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit">
              <FontAwesomeIcon icon={faSearch} className="search-icon" onClick={handleSearch}/>
            </button>
          </form>

          <div className="my-page">
            {isLoggedIn ? (
              <>
                <div style={{ position: "relative" }}>
                  <button onClick={handleToggleUpload} className="upload-btn">
                    <FontAwesomeIcon icon={faPencil} /><span>작성</span>
                  </button>
                  {openUpload && (
                    <div className="upload-menu" ref={uploadRef}>
                      <ul>
                        <li onClick={() => {navigate("/diary/write");setOpenUpload(false)}}><FontAwesomeIcon icon={faBook} /><span>일지</span></li>
                        <li onClick={() => {navigate("/routine/write");setOpenUpload(false)}}><FontAwesomeIcon icon={faCalendar} /><span>루틴</span></li>
                        <li onClick={() => {navigate("/highlight/write");setOpenUpload(false)}}><FontAwesomeIcon icon={faVideo} /><span>하이라이트</span></li>
                        <li onClick={() => {navigate("/community/write");setOpenUpload(false)}}><FontAwesomeIcon icon={faUsers} /><span>커뮤니티</span></li>
                      </ul>
                    </div>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <button className="bell-btn" onClick={handleToggleBell}>
                    <FontAwesomeIcon icon={faBell} />

                    {/* 빨간 점 */}
                    {hasUnread && <span className="unread-dot"></span>}
                  </button>

                  {openBell && (
                    <div className="notification-menu" ref={notificationRef}>
                      <Notifications notification={notification} setOpenBell={setOpenBell} setNotification={setNotification} notifyLoading={notifyLoading}/>
                      <div ref={bottomNotifyRef} style={{ height: 1 }} />
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }}>
                  <div className="profile" onClick={handleToggle}>
                    {profile?.photoUrl ? (
                      <img src={profile?.photoUrl} alt="picture" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="icon" />
                    )}
                  </div>
                  {open && (
                    <div className="dropdown-menu" ref={dropdownRef}>
                      <ul>
                        <Link to={`/profile/${userUuid}`}><li onClick={handleToggle}><FontAwesomeIcon icon={faUser} /> <span>내 프로필</span></li></Link>
                        <Link to="/myroutine"><li onClick={handleToggle}><FontAwesomeIcon icon={faCalendar} /> <span>내 운동 루틴</span></li></Link>
                        <Link to="/myblock"><li onClick={handleToggle}><FontAwesomeIcon icon={faBox} /> <span>내 운동 블럭</span></li></Link>
                        <Link to="/setting"><li onClick={handleToggle}><FontAwesomeIcon icon={faGear} /> <span>설정</span></li></Link>
                        {userRole === "admin" &&
                          <Link to="/dashboard"><li onClick={handleToggle}><FontAwesomeIcon icon={faHammer} /> <span>관리자 페이지</span></li></Link>
                        }
                        <li onClick={handleLogout}><FontAwesomeIcon icon={faArrowRightFromBracket} /> <span>로그아웃</span></li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="login-btn">
                로그인/회원가입
              </Link>
            )}
          </div>
        </div>
        {/* ✅ 하단 전체폭 카테고리 메뉴 */}
        {showCategory && (
          <div className="category-bar">
            <ul>
              <li><Link to="/diary">운동 일지</Link></li>
              <li><Link to="/routine">운동 루틴</Link></li>
              <li><Link to="/highlight">하이라이트</Link></li>
              <li><Link to="/community">커뮤니티</Link></li>
              <li><Link to="/ranking">랭킹</Link></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
