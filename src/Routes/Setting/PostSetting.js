import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./PostSetting.css";
import DiaryList from "../Diary/DiaryList";
import RoutineList from "../Routine/RoutineList";
import HighlightList from "../Highlight/HighlightList";
import PostList from "../Community/PostList";
import { useAuth } from "../../contexts/AuthProvider";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const PostSetting = ({ currentMenuLabel, toggleSidebarOpen }) => {
    const { userUuid } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [list, setList] = useState([]);
    const [postLoading, setPostLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const api = useAxios();
    const width = useWindowWidth();
    const isMobile = width < 1024;

    const loaderRef = useRef(null);

    const menu = searchParams.get("menu");
    const postType = searchParams.get("post"); 
    const type = searchParams.get("type"); 
    const navigate = useNavigate();

    // 기본값 설정
    useEffect(() => {
        if (menu === "post") {
            if (!postType) {
                navigate("/setting?menu=post&post=created&type=diary", { replace: true });
            } else if (!type) {
                setSearchParams({ menu: "post", post: postType, type: "diary" });
            }
        }
    }, [menu, postType, type]);

    // 탭 변경
    const handleTabClick = (t) => {
        setSearchParams({ menu: "post", post: t, type: type || "diary" });
    };

    const handleTypeClick = (t) => {
        setSearchParams({ menu: "post", post: postType, type: t });
    };

    // 리스트 불러오기
    useEffect(() => {
        if (!userUuid || !postType || !type) return;

        const fetchPostList = async () => {
            try {
                setPostLoading(true);
                const res = await api.get("/api/posts/post-list", {
                    params: { postType, type, userUuid, page },
                });

                setList(prev => [...prev, ...res.data.results]); 
                setHasMore(res.data.hasMore);
            } catch (err) {
                console.error("fetchPostList error:", err);
            } finally {
                setPostLoading(false);
            }
        };

        fetchPostList();
    }, [postType, type, userUuid, page]);

    // 메뉴나 타입 바뀔 때 리스트 초기화 + page 리셋
    useEffect(() => {
        setList([]);
        setPage(1);
        setHasMore(true);
    }, [postType, type]);

    // IntersectionObserver
    useEffect(() => {
        if (!loaderRef.current) return;
        if (!hasMore || postLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 1 }
        );

        observer.observe(loaderRef.current);

        return () => observer.disconnect();
    }, [loaderRef, hasMore, postLoading]);

    return (
        <div className="post-setting">
            <div className="setting-header">
                {isMobile &&
                    <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
                }
                <h2>{currentMenuLabel}</h2>
            </div>

            {/* Tab */}
            <div className="link-tabs">
                <div
                    className={`tab ${postType === "created" ? "active" : ""}`}
                    onClick={() => handleTabClick("created")}
                >
                    <h3>내가 작성한 게시물</h3>
                </div>
                <div
                    className={`tab ${postType === "liked" ? "active" : ""}`}
                    onClick={() => handleTabClick("liked")}
                >
                    <h3>좋아요 누른 게시물</h3>
                </div>
            </div>

            {/* Type Tabs */}
            <div className="type-tabs">
                <button className={type === "diary" ? "active" : ""} onClick={() => handleTypeClick("diary")}>일지</button>
                <button className={type === "routine" ? "active" : ""} onClick={() => handleTypeClick("routine")}>루틴</button>
                <button className={type === "highlight" ? "active" : ""} onClick={() => handleTypeClick("highlight")}>하이라이트</button>
                <button className={type === "community" ? "active" : ""} onClick={() => handleTypeClick("community")}>커뮤니티</button>
            </div>

            {/* Content */}
            <div className="post-content">
                {postType === "liked" && <LikedPosts type={type} list={list} postLoading={postLoading} />}
                {postType === "created" && <CreatedPosts type={type} list={list} postLoading={postLoading} />}
            </div>

            {/* 무한스크롤 로딩 트리거 */}
            <div ref={loaderRef} style={{ height: "40px" }}></div>
        </div>
    );
};

const LikedPosts = ({ type, list, postLoading }) => {
    if (type === "diary") return <DiaryList todayDiaries={list} postLoading={postLoading} />;
    if (type === "routine") return <RoutineList routines={list} postLoading={postLoading} />;
    if (type === "highlight") return <HighlightList highlights={list} />;
    if (type === "community") return <PostList posts={list} />;
    return null;
};

const CreatedPosts = ({ type, list, postLoading }) => {
    if (type === "diary") return <DiaryList todayDiaries={list} postLoading={postLoading} />;
    if (type === "routine") return <RoutineList routines={list} postLoading={postLoading} />;
    if (type === "highlight") return <HighlightList highlights={list} postLoading={postLoading} />;
    if (type === "community") return <PostList posts={list} postLoading={postLoading} />;
    return null;
};

export default PostSetting;
