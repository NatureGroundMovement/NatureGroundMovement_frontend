import "./HomeRanking.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import useWindowWidth from "../../components/useWindowWidth";

const getPodiumOrder = (top3) => {
    if (!top3 || top3.length === 0) return [];

    if (top3.length === 1) {
        // 1명 → 가운데만
        return [null, top3[0], null];
    }

    if (top3.length === 2) {
        // 1·2위만 → 1위 가운데, 2위 오른쪽
        // 또는 1 왼쪽 / 2 오른쪽 원한다면 수정 가능
        return [top3[1], top3[0], null];
    }

    // 3명 → 2, 1, 3
    return [top3[1], top3[0], top3[2]];
};

const HomeRanking = ({ ranking, isRankingFetching }) => {
    const navigate = useNavigate();
    const width = useWindowWidth();
    const isMobile = width < 768;

    if (isRankingFetching) return <Spinner />;

    if (!ranking || ranking.length === 0)
        return <div className="home-ranking"><p className="no-data">이번달 랭킹 데이터가 없습니다.</p></div>;

    const top3 = ranking.slice(0, 3);
    const others = ranking.slice(3);

    // 🔥 top3 계산된 다음에 podiumOrder 계산해야 함
    const podiumOrder = getPodiumOrder(top3);

    return (
        <div className="home-ranking">
            <h3>이번 달 운동 랭킹</h3>

            <div className="podium">
                {/* Left (2위 자리) */}
                {podiumOrder[0] && (
                    <div className="podium-item silver">
                        <div className="rank-badge">2</div>
                        <div className="profile" onClick={() => navigate(`/profile/${podiumOrder[0].userUuid}`)}>
                            {podiumOrder[0].photoUrl 
                                ? <img src={podiumOrder[0].photoUrl} alt="picture" />
                                : <FontAwesomeIcon icon={faUser} className="icon" />}
                        </div>
                        <div className="name">{podiumOrder[0].nickname}</div>
                        <div className="score">{podiumOrder[0].score}점</div>
                    </div>
                )}

                {/* Center (1위 자리) */}
                {podiumOrder[1] && (
                    <div className="podium-item gold">
                        <div className="rank-badge">1</div>
                        <div className="profile" onClick={() => navigate(`/profile/${podiumOrder[1].userUuid}`)}>
                            {podiumOrder[1].photoUrl 
                                ? <img src={podiumOrder[1].photoUrl} alt="picture" />
                                : <FontAwesomeIcon icon={faUser} className="icon" />}
                        </div>
                        <div className="name">{podiumOrder[1].nickname}</div>
                        <div className="score">{podiumOrder[1].score}점</div>
                    </div>
                )}

                {/* Right (3위 자리) */}
                {podiumOrder[2] && (
                    <div className="podium-item bronze">
                        <div className="rank-badge">3</div>
                        <div className="profile" onClick={() => navigate(`/profile/${podiumOrder[2].userUuid}`)}>
                            {podiumOrder[2].photoUrl 
                                ? <img src={podiumOrder[2].photoUrl} alt="picture" />
                                : <FontAwesomeIcon icon={faUser} className="icon" />}
                        </div>
                        <div className="name">{podiumOrder[2].nickname}</div>
                        <div className="score">{podiumOrder[2].score}점</div>
                    </div>
                )}
            </div>

            {/* 4~10위 */}
            {!isMobile &&
            <div className="rank-list">
                {others.map((user, idx) => (
                    <div key={user.userUuid} className="rank-row" onClick={() => navigate(`/profile/${user.userUuid}`)}>
                        <div className="rank-number">{idx + 4}</div>
                        <div className="profile">
                            {user.photoUrl
                                ? <img src={user.photoUrl} alt="picture" />
                                : <FontAwesomeIcon icon={faUser} className="icon" />}
                        </div>
                        <div className="rank-name">{user.nickname}</div>
                        <div className="rank-score">{user.score}점</div>
                    </div>
                ))}
            </div>
            }
        </div>
    );
};


export default HomeRanking;
