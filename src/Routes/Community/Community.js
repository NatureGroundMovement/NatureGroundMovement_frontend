// Community.jsx
import "./Community.css";
import Posts from "./PostList";
import Topic from "./Topic";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import { useAuth } from "../../contexts/AuthProvider";
import useWindowWidth from "../../components/useWindowWidth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

// 카테고리
const categories = [
  { value: "notify", label: "공지" },
  { value: "free", label: "자유게시판" },
  { value: "workout", label: "헬스" },
  { value: "calisthenics", label: "맨몸운동" },
  { value: "diet", label: "다이어트" },
  { value: "stretching", label: "스트레칭" },
  { value: "meal", label: "식단" },
  { value: "rehab", label: "재활" },
];

// 부위 필터
const partOptions = [
  { value: "all", label: "전체" },
  { value: "상체", label: "상체" },
  { value: "하체", label: "하체" },
  { value: "복근", label: "복근" },
  { value: "어깨", label: "어깨" },
  { value: "팔", label: "팔" },
  { value: "전신", label: "전신" },
  { value: "유산소", label: "유산소" },
];

// 정렬 필터
const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "views", label: "조회순" },
];

const Community = () => {
  const width = useWindowWidth();
  const isMobile = width < 1024;
  const { userUuid, userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [part, setPart] = useState("");
  const [sort, setSort] = useState("latest");

  // 🔥 무한 스크롤 상태
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebarOpen = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const category = searchParams.get("category");

  // category 없으면 free로 이동
  useEffect(() => {
    if (!category) {
      navigate("/community?category=free", { replace: true });
    }
  }, [category, navigate]);

  // 🔥 게시글 불러오기 (무한 스크롤 적용)
  const fetchPosts = async () => {
    if (!category) return;
    if (isFetching || !hasMore) return;

    try {
      setIsFetching(true);

      const res = await axios.get("/api/community", {
        params: { category, part, sort, page, userUuid, userRole },
      });

      setPosts((prev) => [...prev, ...res.data]);

      // 20개 미만이면 더 없음
      if (res.data.length < 20) setHasMore(false);
    } catch (err) {
      console.error("게시글 불러오기 실패:", err);
    } finally {
      setIsFetching(false);
    }
  };

  // 🔥 필터 변경 시 초기화
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [category, part, sort]);

  // 🔥 페이지 초기화 시 첫 로드
  useEffect(() => {
    if (page === 1 && posts.length === 0) {
      fetchPosts();
    }
  }, [page, posts]);

  // 🔥 IntersectionObserver로 바닥 감지
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetching) {
        setPage((prev) => prev + 1);
      }
    });

    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  const currentCategoryLabel =
    categories.find((c) => c.value === category)?.label || "자유게시판";

  return (
    <div className="community-container">
      {isMobile && (
        <div
          className={`mobile-overlay ${isSidebarOpen ? "show" : ""}`}
          onClick={toggleSidebarOpen}
        >
          {/* 슬라이드 패널 */}
          <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
            <Topic toggleSidebarOpen={toggleSidebarOpen} isSidebarOpen={isSidebarOpen} />
          </div>
        </div>
      )}

      {!isMobile &&
      <div className="topic">
        <Topic />
      </div>
      }

      <div className="community-content">
        <div>
          <div className="community-header">
            {isMobile &&
              <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
            }
            <h1>커뮤니티</h1>
          </div>
          <p className="category">
            카테고리 <span>{">"}</span> {currentCategoryLabel}
          </p>

          
          <div className="filter-bar">
            {category !== "notify" &&
              <SingleSelectDropdown
                options={partOptions}
                value={part}
                onChange={setPart}
                label="부위 선택"
              />
            }

              <SingleSelectDropdown
                options={sortOptions}
                value={sort}
                onChange={setSort}
                label="정렬"
              />
          </div>
          
        </div>

        {/* 게시글 목록 */}
        <Posts posts={posts} loading={isFetching} />

        {/* 바닥 감지용 ref */}
        <div ref={bottomRef} style={{ height: 30 }} />
      </div>
    </div>
  );
};

export default Community;
