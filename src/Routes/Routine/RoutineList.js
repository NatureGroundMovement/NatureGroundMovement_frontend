import { useNavigate } from "react-router-dom";
import "./RoutineList.css";
import Spinner from "../../components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faEye, faHeart } from "@fortawesome/free-regular-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const RoutineList = ({ routines, isLoading, searchLoading, postLoading }) => {
  const navigate = useNavigate();

  if (isLoading || searchLoading || postLoading) return <Spinner />;

  if (routines?.length === 0) {
    return <p className="no-routine">게시된 루틴이 없습니다 😴</p>;
  }

  return (
    <ul className="routine-list">
      {routines?.map((r) => (
          <li key={r._id} onClick={() => navigate(`/routine/${r.postId}`)}>
            <div className="thumbnail">
              <img src={r.thumbnailUrl} alt="썸네일" />
            </div>

            <div className="side-info">
            <div className="routine-info">
              <h3 className="routine-title">{r.title}</h3>

              {/* 난이도 표시 */}
              <div className="rates">
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    className="star"
                    style={{ color: level <= r.difficulty ? "#ffc107" : "#ccc" }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="parts">
                {r?.bodyParts?.slice(0, 5).map((part, i) => (
                  <span key={i} className="part">
                    {part}
                  </span>
                ))}
              </p>
            </div>

            <p className="reactions">
              <span><FontAwesomeIcon icon={faEye}/> {r.viewCount}</span>
              <span><FontAwesomeIcon icon={faHeart}/> {r.likeCount}</span>
              <span><FontAwesomeIcon icon={faComment}/> {r.commentCount}</span>
              <span><FontAwesomeIcon icon={faDownload}/> {r.appliedCount}</span>
            </p>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default RoutineList;
