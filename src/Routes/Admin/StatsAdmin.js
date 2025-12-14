import "./StatsAdmin.css";
import { useEffect, useState } from "react";
import PostsMonthlyChart from "./StatsGraphs/PostsMonthlyChart";
import UserJoinChart from "./StatsGraphs/UserJoinChart";
import ActivityActionTable from "./StatsGraphs/ActivityActionTable";
import ActivityMonthlyChart from "./StatsGraphs/ActivityMonthlyChart";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const RANGE_OPTIONS = [
    { label: "전체", value: "all" },
    { label: "3개월", value: "3m" },
    { label: "6개월", value: "6m" },
    { label: "12개월", value: "12m" },
];

const actionLabels = {
  "create_post": "게시글 작성",
  "login": "로그인",
  "like": "좋아요",
  "view_post": "게시글 조회",
  "comment": "댓글",
  "follow": "팔로우",
  "report": "신고",
  "save": "루틴 저장"
};

const StatsAdmin = ({ currentMenuLabel, isMobile, toggleSidebarOpen }) => {
    const [stats, setStats] = useState(null);
    const [range, setRange] = useState("12m"); // 기본은 최근 1년
    const api = useAxios();

    const fetchStats = () => {
        const params = {};

        if (range !== "custom") {
            params.range = range;
        }

        api
            .get("/api/stats", {
            params,
            })
            .then((res) => setStats(res.data))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchStats();
    }, [range]);

    if (!stats) return <div className="stats-admin"><Spinner /></div>;

    return (
        <div className="stats-admin">
            <div className="admin-header">
                {isMobile &&
                <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
                }
                <h2>{currentMenuLabel}</h2>
            </div>

            {/* ---------------------------- */}
            {/* 🔥 기간 선택 Range Filter */}
            {/* ---------------------------- */}
            <div className="range-filter">
                {RANGE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        className={`range-btn ${range === opt.value ? "active" : ""}`}
                        onClick={() => setRange(opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* ---------------------------- */}
            {/* 그래프 렌더링 */}
            {/* ---------------------------- */}

            <UserJoinChart
                monthlyJoin={stats.users.monthlyJoin}
                total={stats.users.total}
            />
            <div className="total-posts">
                <h3>게시물 총 생성량</h3>
                <div className="values">
                    <p>일지: <strong>{stats.posts.total.diary}</strong></p>
                    <p>루틴: <strong>{stats.posts.total.routine}</strong></p>
                    <p>하이라이트: <strong>{stats.posts.total.highlight}</strong></p>
                    <p>커뮤니티: <strong>{stats.posts.total.community}</strong></p>
                </div>
            </div>
            <PostsMonthlyChart monthlyPosts={stats.posts.monthly} />
            <ActivityActionTable activity={stats.activity} actionLabels={actionLabels}/>
            <ActivityMonthlyChart monthly={stats.activity.monthly} actionLabels={actionLabels}/>
        </div>
    );
};

export default StatsAdmin;
