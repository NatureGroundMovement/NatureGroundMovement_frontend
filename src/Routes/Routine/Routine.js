import { Link, useNavigate } from "react-router-dom";
import "./Routine.css";
import { useEffect, useRef, useState } from "react";
import MultiSelectDropdown from "../../components/MultiSelectDropdown";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import axios from "axios";
import RoutineList from "./RoutineList";
import useWindowWidth from "../../components/useWindowWidth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsProgress } from "@fortawesome/free-solid-svg-icons";

const Routine = () => {
    const [routines, setRoutines] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [filters, setFilters] = useState({
        sort: "popular",
        purpose: [],
        bodyPart: [],
        duration: "",
        difficulty: "",
        type: "",
    });

    const width = useWindowWidth();
    const isMobile = width < 1024;

    const filterRef = useRef(null);

    const bottomRef = useRef(null);

    // =====================
    // 📌 데이터 불러오기
    // =====================
    const fetchRoutines = async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            query.append("page", page);
            query.append("limit", 20);

            // 단일 값
            if (filters.sort) query.append("sort", filters.sort);
            if (filters.duration) query.append("duration", filters.duration);
            if (filters.difficulty) query.append("difficulty", filters.difficulty);
            if (filters.type) query.append("type", filters.type);

            // 배열 값
            filters.purpose.forEach((p) => query.append("purpose", p));
            filters.bodyPart.forEach((b) => query.append("bodyPart", b));

            const res = await axios.get(`/api/routines?${query.toString()}`);

            setRoutines(prev => [...prev, ...res.data]);
            setHasMore(res.data.hasMore);

            setPage(prev => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (filterRef.current && !filterRef.current.contains(event.target)) {
            setIsSidebarOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // =====================
    // 📌 필터가 바뀌면 리스트 초기화
    // =====================
    useEffect(() => {
        setPage(1);
        setRoutines([]);
        setHasMore(true);
    }, [filters]);

    // =====================
    // 📌 무한 스크롤: 맨 아래 도달 감지
    // =====================
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchRoutines();
            }
        });

        if (bottomRef.current) observer.observe(bottomRef.current);
        return () => observer.disconnect();
    }, [bottomRef, filters, page, hasMore]);

    return (
        <div className="routine-container">
            <div className="header">
                <h1>운동 루틴</h1>
                {!isMobile ?
                <div className="filters">
                    <SingleSelectDropdown
                        label="정렬"
                        value={filters.sort}
                        onChange={(val) => setFilters({ ...filters, sort: val })}
                        options={[
                            { value: "latest", label: "최신순" },
                            { value: "popular", label: "인기순" },
                            { value: "views", label: "조회순" },
                            { value: "applied", label: "적용순" },
                        ]}
                    />

                    <SingleSelectDropdown
                        label="루틴 타입"
                        value={filters.type}
                        onChange={(val) => setFilters({ ...filters, type: val })}
                        options={[
                            { value: "all", label: "전체" },
                            { value: "day", label: "하루 루틴" },
                            { value: "week", label: "주간 루틴" },
                        ]}
                    />
                      
                    <MultiSelectDropdown
                        label="운동 목적"
                        options={["근력 강화", "근비대", "체중감량", "체력 향상", "유산소 강화", "체형 교정", "유연성 향상"]}
                        selectedOptions={filters.purpose}
                        onChange={(selected) => setFilters({ ...filters, purpose: selected })}
                    />

                    <MultiSelectDropdown
                        label="운동 부위"
                        options={["가슴", "하체", "등", "어깨", "팔", "전신"]}
                        selectedOptions={filters.bodyPart}
                        onChange={(selected) => setFilters({ ...filters, bodyPart: selected })}
                    />

                    <SingleSelectDropdown
                        label="소요시간"
                        value={filters.duration}
                        onChange={(val) => setFilters({ ...filters, duration: val })}
                        options={[
                            { value: "all", label: "전체" },
                            { value: "15", label: "15분 이내" },
                            { value: "30", label: "30분 이내" },
                            { value: "45", label: "45분 이내" },
                            { value: "60", label: "1시간 이내" },
                        ]}
                    />

                    {/* 난이도 */}
                    <div className="difficulty-filter">
                        <span>난이도</span>
                        {[1, 2, 3, 4, 5].map((num) => (
                            <span
                                key={num}
                                className="star"
                                style={{
                                    cursor: "pointer",
                                    color: num <= filters.difficulty ? "#ffc107" : "#ccc",
                                }}
                                onClick={() =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        difficulty: prev.difficulty === num ? "" : num,
                                    }))
                                }
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>
                :
                <button onClick={() => setIsSidebarOpen(true)} className="filter-btn">
                    <FontAwesomeIcon icon={faBarsProgress} />
                    <span>필터</span>
                </button>
                }
            </div>

            {isMobile &&
                <div
                    className={`mobile-overlay ${isSidebarOpen ? "show" : ""}`}
                >
                    
                    <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`} ref={filterRef}>
                        <SingleSelectDropdown
                            label="정렬"
                            value={filters.sort}
                            onChange={(val) => setFilters({ ...filters, sort: val })}
                            options={[
                                { value: "latest", label: "최신순" },
                                { value: "popular", label: "인기순" },
                                { value: "views", label: "조회순" },
                                { value: "applied", label: "적용순" },
                            ]}
                        />

                        <SingleSelectDropdown
                            label="루틴 타입"
                            value={filters.type}
                            onChange={(val) => setFilters({ ...filters, type: val })}
                            options={[
                                { value: "all", label: "전체" },
                                { value: "day", label: "하루 루틴" },
                                { value: "week", label: "주간 루틴" },
                            ]}
                        />

                        <MultiSelectDropdown
                            label="운동 목적"
                            options={["근력 강화", "근비대", "체중감량", "체력 향상", "유산소 강화", "체형 교정", "유연성 향상"]}
                            selectedOptions={filters.purpose}
                            onChange={(selected) => setFilters({ ...filters, purpose: selected })}
                        />

                        <MultiSelectDropdown
                            label="운동 부위"
                            options={["가슴", "하체", "등", "어깨", "팔", "전신"]}
                            selectedOptions={filters.bodyPart}
                            onChange={(selected) => setFilters({ ...filters, bodyPart: selected })}
                        />

                        <SingleSelectDropdown
                            label="소요시간"
                            value={filters.duration}
                            onChange={(val) => setFilters({ ...filters, duration: val })}
                            options={[
                                { value: "all", label: "전체" },
                                { value: "15", label: "15분 이내" },
                                { value: "30", label: "30분 이내" },
                                { value: "45", label: "45분 이내" },
                                { value: "60", label: "1시간 이내" },
                            ]}
                        />

                        {/* 난이도 */}
                        <div className="difficulty-filter">
                            <span>난이도</span>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <span
                                    key={num}
                                    className="star"
                                    style={{
                                        cursor: "pointer",
                                        color: num <= filters.difficulty ? "#ffc107" : "#ccc",
                                    }}
                                    onClick={() =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            difficulty: prev.difficulty === num ? "" : num,
                                        }))
                                    }
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            }

            <RoutineList routines={routines} isLoading={isLoading} />

            {/* 🔥 무한 스크롤 트리거 */}
            <div ref={bottomRef} style={{ height: "40px" }}></div>

        </div>
    );
};

export default Routine;
