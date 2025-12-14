import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "./ReportAdmin.css";
import ReportTable from "./ReportTable";
import { useAxios } from "../../contexts/useAxios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const ReportAdmin = ({ currentMenuLabel, isMobile, toggleSidebarOpen }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const observerRef = useRef(null);
    const api = useAxios();

    const menu = searchParams.get("menu");
    const type = searchParams.get("type"); 
    const navigate = useNavigate();
    
    const fetchReports = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(
                `/api/admin/reports?type=${type}&page=${page}&limit=20`
            );
            setReports(prev => [...prev, ...res.data.reports]);
            setHasMore(res.data.hasMore);
        } catch (err) {
            console.error("신고 리스트 불러오기 실패:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 🔥 type 바뀌면 리스트 초기화
    useEffect(() => {
        setReports([]);   // 중요!
        setPage(1);
        setHasMore(true);
    }, [type]);

    // 🔥 page 바뀌면 fetch 실행
    useEffect(() => {
        if (!type) return;
        fetchReports();
    }, [page, type]);

    // 🔥 IntersectionObserver
    useEffect(() => {
        if (isLoading) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [isLoading, hasMore]);

    useEffect(() => {
        if (menu === "report") {
            if (!type) {
                navigate("/dashboard?menu=report&type=profile", { replace: true });
            }
        }
    }, [menu, type]);

    const deleteSelected = async () => {
        if (selectedIds.length === 0) return alert("선택된 항목이 없습니다.");

        await api.post(
            "/api/admin/delete-multiple",
            { 
                ids: selectedIds 
            },
        );

        setReports(reports.filter(r => !selectedIds.includes(r._id)));
        setSelectedIds([]);
    };

    const handleTypeClick = (t) => {
        setSearchParams({ menu: "report", type: t });
    };

    return (
        <div className="report-admin">
            <div className="admin-header">
                {isMobile &&
                <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
                }
                <h2>{currentMenuLabel}</h2>
            </div>
            
            <div className="type-tabs">
                <button className={type === "profile" ? "active" : ""} onClick={() => handleTypeClick("profile")}>프로필</button>
                <button className={type === "diary" ? "active" : ""} onClick={() => handleTypeClick("diary")}>일지</button>
                <button className={type === "routine" ? "active" : ""} onClick={() => handleTypeClick("routine")}>루틴</button>
                <button className={type === "highlight" ? "active" : ""} onClick={() => handleTypeClick("highlight")}>하이라이트</button>
                <button className={type === "community" ? "active" : ""} onClick={() => handleTypeClick("community")}>커뮤니티</button>
                <button className={type === "comment" ? "active" : ""} onClick={() => handleTypeClick("comment")}>댓글</button>
            </div>

            <ReportTable reports={reports} isLoading={isLoading} selectedIds={selectedIds} onSelectChange={setSelectedIds} deleteSelected={deleteSelected}/>

            <div ref={observerRef} style={{ height: 1 }} />
        </div>
    );
};

export default ReportAdmin;