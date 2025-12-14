import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import "./Diary.css";
import { useNavigate } from "react-router-dom";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import DiaryList from "./DiaryList";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";
import axios from "axios";

const sortOptions = [
    { label: "최신순", value: "latest" },
    { label: "인기순", value: "popular" },
    { label: "조회순", value: "views" },
];

const Diary = () => {
    const { userUuid } = useAuth();
    const [myDiaries, setMyDiaries] = useState([]);
    const [myDiaryCount, setMyDiaryCount] = useState(0);

    // 🔥 무한 스크롤 상태
    const [todayDiaries, setTodayDiaries] = useState([]);
    const [sortType, setSortType] = useState("latest");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [isMyLoading, setIsMyLoading] = useState(false);

    const width = useWindowWidth();
    const isMobile = width < 1024;

    const bottomRef = useRef(null);
    const navigate = useNavigate();
    const api = useAxios();

    // ======================================
    // 🔥 오늘 일지 무한 스크롤 데이터 로드
    // ======================================
    const fetchTodayDiaries = async () => {
        if (!hasMore) return;
        if (isFetching) return;

        try {
        setIsFetching(true);

        const res = await axios.get("/api/diaries/today", {
            params: {
            userUuid,
            sort: sortType,
            page,
            },
        });

        // 새 데이터 붙이기
        setTodayDiaries((prev) => [...prev, ...res.data]);

        // 더 이상 데이터 없으면 중지
        if (res.data.length < 20) setHasMore(false);
        } catch (error) {
        console.error("🚨 오늘 일지 불러오기 실패:", error);
        } finally {
        setIsFetching(false);
        }
    };

    // ======================================
    // 🔥 필터(정렬) 바뀌면 초기화
    // ======================================
    useEffect(() => {
        setTodayDiaries([]);
        setPage(1);
        setHasMore(true);
    }, [sortType, userUuid]);

    // ======================================
    // 🔥 page=1 & 리스트 초기화시 첫 로드
    // ======================================
    useEffect(() => {
        if (page === 1 && todayDiaries.length === 0) {
        fetchTodayDiaries();
        }
    }, [page, todayDiaries]);

    // ======================================
    // 🔥 IntersectionObserver - 바닥 도달
    // ======================================
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
            setPage((prev) => prev + 1);
        }
        });

        if (bottomRef.current) observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, [hasMore, isFetching]);

    // ======================================
    // 🔥 내 오늘 일지 로드 (기존 그대로)
    // ======================================
    useEffect(() => {
        const fetchMyDiaries = async () => {
        if (!userUuid) return;
        try {
            setIsMyLoading(true);
            const res = await api.get("/api/diaries/today/mine", {
            params: { userUuid },
            });
            setMyDiaries(res.data);
            console.log(res.data)
        } catch (error) {
            console.error("🚨 내 일지 불러오기 실패:", error);
        } finally {
            setIsMyLoading(false);
        }
        };
        fetchMyDiaries();
    }, [userUuid]);

    // ======================================
    // 🔥 내 일지 개수 조회 (변경 없음)
    // ======================================
    useEffect(() => {
        const fetchMyDiaryCount = async () => {
        if (!userUuid) return;
        try {
            const res = await api.get("/api/diaries/today/mine/count", {
            params: { userUuid },
            });
            setMyDiaryCount(res.data.count);
        } catch (error) {
            console.error("🚨 내 일지 개수 조회 실패:", error);
        }
        };
        fetchMyDiaryCount();
    }, [userUuid]);

    const handleWrite = () => {
        if (myDiaryCount >= 2) {
        alert("🚫 오늘은 최대 2개의 일지만 작성할 수 있습니다.");
        return;
        }
        navigate("/diary/write");
    };

    if (isFetching) return <div />

    return (
        <div className="diary-container">
            <div className="my-diary">
                <h2>나의 일지</h2>
                {myDiaries.length === 0 ? (
                    <div className="no-my-diary">
                        <p>
                            <strong>오늘 작성된 일지가 없습니다.</strong> 
                            새로운 일지를 작성해보세요.
                        </p>

                        {!isMobile &&
                            <button onClick={handleWrite} className="write-btn">일지 작성하러 가기</button>
                        }
                    </div>
                ) : (
                    <DiaryList 
                        todayDiaries={myDiaries}
                        isMyLoading={isMyLoading}
                    />
                )}
            </div>

            <div className="today-diary">
                <div className="today-diary-header">
                    <h2>오늘의 일지</h2>
                    <SingleSelectDropdown
                        options={sortOptions}
                        value={sortType}
                        onChange={setSortType}
                        label="정렬"
                    />
                </div>
                <DiaryList 
                    todayDiaries={todayDiaries}
                    isLoading={isFetching}
                    isMyLoading={isMyLoading}
                />
                <div ref={bottomRef} style={{ height: 30 }}></div>
            </div>

        </div>
    );
};

export default Diary;