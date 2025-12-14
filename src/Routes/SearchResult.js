import "../css/SearchResult.css";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DiaryList from "./Diary/DiaryList";
import RoutineList from "./Routine/RoutineList";
import HighlightList from "./Highlight/HighlightList";
import PostList from "./Community/PostList";
import ProfileList from "./ProfileList";
import SingleSelectDropdown from "../components/SingleSelectDropdown";
import useWindowWidth from "../components/useWindowWidth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const sortOptions = [
    { label: "최신순", value: "latest" },
    { label: "인기순", value: "popular" },
    { label: "조회순", value: "views" },
];

const SearchResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const width = useWindowWidth();
    const isMobile = width < 1024;

    const type = searchParams.get("type");
    const keyword = searchParams.get("keyword");

    const [results, setResults] = useState([]);
    const [keywordInput, setKeywordInput] = useState(keyword || "");
    const [sort, setSort] = useState("popular");

    // 🔥 무한 스크롤 상태
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    const bottomRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!keywordInput.trim()) return;

        navigate(`/search?type=profile&keyword=${keywordInput}`);
    };

    // 검색 데이터 fetch
    const fetchResults = async () => {
        if (!type || !keyword) return;
        if (isFetching || !hasMore) return;

        try {
            setIsFetching(true);

            const res = await axios.get("/api/search", {
                params: { type, keyword, sort, page, limit: "20" },
            });

            const newData = res.data.results || [];

            setResults((prev) => [...prev, ...newData]);

            // 20개 이상이면 다음 페이지 또 있음
            if (newData.length < 20) {
                setHasMore(false);
            }
        } catch (err) {
            console.error("검색 오류:", err);
        } finally {
            setIsFetching(false);
        }
    };

    // 💥 type, keyword, sort 변경 시 리셋
    useEffect(() => {
        setResults([]);
        setPage(1);
        setHasMore(true);
    }, [type, keyword, sort]);

    // 페이지가 1이거나 다시 로딩될 때 fetch
    useEffect(() => {
        if (page === 1 && results.length === 0) {
            fetchResults();
        }
    }, [page, results]);

    // 🔥 IntersectionObserver 로 "바닥" 감지
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isFetching) {
                setPage((prev) => prev + 1);
            }
        });

        if (bottomRef.current) observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, [hasMore, isFetching]);

    // 타입 변경 버튼 클릭
    const handleTypeChange = (newType) => {
        navigate(`/search?type=${newType}&keyword=${keyword}`);
    };

    // 타입별 리스트 컴포넌트 출력
    const renderList = () => {
        if (type === "diary") {
            return (
                <DiaryList
                    todayDiaries={results}
                    isLoading={false}
                    isMyLoading={false}
                    searchLoading={isFetching}
                />
            );
        }
        if (type === "routine") {
            return <RoutineList routines={results} searchLoading={isFetching} />;
        }
        if (type === "highlight") {
            return (
                <HighlightList highlights={results} searchLoading={isFetching} />
            );
        }
        if (type === "community") {
            return <PostList posts={results} searchLoading={isFetching} />;
        }
        if (type === "profile") {
            return (
                <ProfileList profiles={results} searchLoading={isFetching} />
            );
        }
    };

    return (
        <div className="search-result">
            {isMobile &&
            <form className="search" onSubmit={handleSearch}>
                <input
                placeholder="검색어를 입력하세요"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                />
                <button type="submit">
                <FontAwesomeIcon icon={faSearch} className="search-icon" onClick={handleSearch}/>
                </button>
            </form>
            }

            {!isMobile &&
                <h2>검색어: "{keyword}"</h2>
            }
            {/* 🔥 type 변경 버튼 */}
            <div className="type-buttons">
                <button
                    className={type === "profile" ? "active" : ""}
                    onClick={() => handleTypeChange("profile")}
                >
                    프로필
                </button>
                <button
                    className={type === "diary" ? "active" : ""}
                    onClick={() => handleTypeChange("diary")}
                >
                    일지
                </button>
                <button
                    className={type === "routine" ? "active" : ""}
                    onClick={() => handleTypeChange("routine")}
                >
                    루틴
                </button>
                <button
                    className={type === "highlight" ? "active" : ""}
                    onClick={() => handleTypeChange("highlight")}
                >
                    하이라이트
                </button>
                <button
                    className={type === "community" ? "active" : ""}
                    onClick={() => handleTypeChange("community")}
                >
                    커뮤니티
                </button>
            </div>

            <div className="result-header">
                <h3>{results.length}개의 결과</h3>

                {type !== "profile" &&
                <SingleSelectDropdown
                    options={sortOptions}
                    value={sort}
                    onChange={setSort}
                    label="정렬"
                />
                }
            </div>

            <div className="result-container">{renderList()}</div>

            {/* 🔥 화면 마지막 감지용 */}
            <div ref={bottomRef} style={{ height: 30 }}></div>
        </div>
    );
};

export default SearchResult;
