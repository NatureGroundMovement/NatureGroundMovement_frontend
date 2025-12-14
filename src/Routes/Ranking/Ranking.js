import { useEffect, useState } from "react";
import axios from "axios";
import "./Ranking.css";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";

const metrics = [
  { key: "score", label: "🏅 전체 랭킹", },
  { key: "workout", label: "💪 운동 성실도" },
  { key: "routine", label: "📈 루틴 제작·공유" },
  { key: "highlight", label: "🔥 하이라이트 열정" },
  { key: "community", label: "🧍 커뮤니티 활약" }
];


const metricTopMentions = {
  score: "전체 활동이 가장 활발한 사람은?",
  workout: "가장 성실하게 운동하는 사람은?",
  routine: "가장 많은 루틴을 만들고 공유한 사람은?",
  highlight: "하이라이트를 가장 활발하게 올린 사람은?",
  community: "커뮤니티에서 가장 활발한 사람은?"
};

const metricMyMentions = {
  score: "내 운동 수준은",
  workout: "내 운동 성실도는",
  routine: "내 루틴 활동은",
  highlight: "내 하이라이트 활동은",
  community: "내 커뮤니티 활동은"
};


const Ranking = () => {
  const { userUuid } = useAuth();
  const api = useAxios();
  const [selectedMetric, setSelectedMetric] = useState("score");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;

  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const fetchRanking = async () => {
    if (!userUuid) return;

    try {
      setLoading(true);
      const res = await api.get("/api/ranking", {
        params: {
          month,
          metric: selectedMetric,
          userUuid
        },
      });

      setData(res.data);
    } catch (err) {
      console.error("랭킹 불러오기 오류:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [selectedMetric, userUuid]);

  const left = data?.top100?.slice(0, 50) || [];
  const right = data?.top100?.slice(50, 100) || [];
  const all = data?.top100 || [];

  return (
    <div className="ranking-container">

      {/* 지표 선택 탭 */}
      <div className="ranking-tabs">
        {metrics.map((m) => (
          <button
            key={m.key}
            className={`ranking-tab ${selectedMetric === m.key ? "active" : ""}`}
            onClick={() => setSelectedMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading && <Spinner />}

      {!loading && data && !isMobile && (
        <div className="ranking-content">
          <h2>{metricTopMentions[selectedMetric]}</h2>

          {/* 내 정보 */}
          <div className="ranking-my">
            <h3>{metricMyMentions[selectedMetric]}</h3>
            <p><b>상위</b> {data?.percent}%</p>
          </div>

          {/* Top 100 */}
          <div className="ranking-list">
            <h3>Top 100 랭커</h3>
            <div className="ranking-table">
              <table>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>유저</th>
                    <th>점수</th>
                  </tr>
                </thead>

                <tbody>
                  {left.map((r) => (
                    <tr key={r.userUuid} onClick={() => navigate(`/profile/${r.userUuid}`)}>
                      <td>{r.rank}</td>
                      <td className="ranking-user">
                        {r.nickname || "익명"}
                      </td>
                      <td>{r.metricScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>유저</th>
                    <th>값</th>
                  </tr>
                </thead>

                <tbody>
                  {right.map((r) => (
                    <tr key={r.userUuid} onClick={() => navigate(`/profile/${r.userUuid}`)}>
                      <td>{r.rank}</td>
                      <td className="ranking-user">
                        {r.nickname || "익명"}
                      </td>
                      <td>{r.metricScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {!loading && isMobile &&
        <div className="ranking-content">
          <h2>{metricTopMentions[selectedMetric]}</h2>

          {/* 내 정보 */}
          <div className="ranking-my">
            <h3>{metricMyMentions[selectedMetric]}</h3>
            <p><b>상위</b> {data?.percent}%</p>
          </div>

          {/* Top 100 */}
          <div className="ranking-list">
            <h3>Top 100 랭커</h3>
            <div className="ranking-table">
              <table>
                <thead>
                  <tr>
                    <th>순위</th>
                    <th>유저</th>
                    <th>점수</th>
                  </tr>
                </thead>

                <tbody>
                  {all?.map((a) => (
                    <tr key={a.userUuid} onClick={() => navigate(`/profile/${a.userUuid}`)}>
                      <td>{a.rank}</td>
                      <td className="ranking-user">
                        {a.nickname || "익명"}
                      </td>
                      <td>{a.metricScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }
    </div>
  );
};

export default Ranking;
