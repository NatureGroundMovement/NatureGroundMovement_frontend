import "./DiaryList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { faEye, faHeart, faComment,  faUser } from "@fortawesome/free-regular-svg-icons";
import { faThumbsUp, faHandLizard, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import useWindowWidth from "../../components/useWindowWidth";

const formatDate = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return (
    <>
      <span>{yyyy}년</span>
      <span>{mm}월</span>
      <span>{dd}일</span>
    </>
  );
};

const getConditionEmoji = (condition) => {
    if (!condition) return "";

    switch (condition) {
        case "좋음":
            return <FontAwesomeIcon icon={faThumbsUp} style={{ color: "#4a86e8" }}/>;
        case "보통":
            return <FontAwesomeIcon icon={faHandLizard} flip="horizontal" style={{ color: "rgb(255, 193, 7)" }}/>;
        case "나쁨":
            return <FontAwesomeIcon icon={faThumbsDown} style={{ color: "#D32F2F" }}/>;
        default:
            return "";
    }
};

const DiaryList = ({ todayDiaries, isLoading, isMyLoading, searchLoading, postLoading }) => {
    const navigate = useNavigate();

    const width = useWindowWidth();
    const isMobile = width < 1024;

    if (isLoading || isMyLoading || searchLoading || postLoading) return <Spinner />;

    if (todayDiaries?.length === 0) {
        return <p className="no-diary">게시된 일지가 없습니다 😴</p>;
    }

    if (!isMobile) return (
        <div className="diary-list">
            {todayDiaries?.map((diary) => (
                <div key={diary.postId} className="diary-card" onClick={() => navigate(`/diary/${diary.postId}`)}>
                    <div className="diary-header">
                        <div className="today-info">
                            <div>
                                {formatDate(diary.date)}
                            </div>
                            <div>
                                컨디션: <span>{getConditionEmoji(diary.condition)}</span>
                            </div>
                        </div>
                        <div className="diary-author">
                            <div className="profile" onClick={(e) => {e.stopPropagation(); navigate(`/profile/${diary.authorUuid}`)}}>
                                {diary.photoUrl ? (
                                    <img src={diary.photoUrl} alt="picture" />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} className="icon" />
                                )}
                            </div>
                            <p className="nickname">{diary.nickname}</p>
                        </div>
                    </div>
                    <div className="diary-info">
                        <div className="thumbnail">
                            <img
                                src={diary.thumbnailUrl || "/default-thumbnail.png"}
                                alt={diary.title}
                                className="diary-thumbnail"
                            />
                        </div>
                        <div className="diary-detail">
                            <h3 className="diary-title">{diary.title}</h3>
                            <p>
                                <strong>부위 :</strong>{" "}
                                {diary?.exercisePart?.slice(0, 5).map((exercisePart, i) => (
                                    <span key={i} className="part">
                                        {exercisePart}
                                    </span>
                                ))}
                            </p>
                            <div className="diary-stats">
                                <span><FontAwesomeIcon icon={faEye}/> {diary.viewCount}</span>
                                <span><FontAwesomeIcon icon={faHeart}/> {diary.likeCount}</span>
                                <span><FontAwesomeIcon icon={faComment}/> {diary.commentCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
        </div>
    );

    if (isMobile) return (
        <div className="diary-list">
            {todayDiaries?.map((diary) => (
                <div key={diary.postId} className="diary-mobile-card" onClick={() => navigate(`/diary/${diary.postId}`)}>
                    <div className="thumbnail">
                        <img
                            src={diary.thumbnailUrl || "/default-thumbnail.png"}
                            alt={diary.title}
                            className="diary-thumbnail"
                        />
                    </div>
                    <div className="diary-mobile-info">
                        <div className="diary-mobile-header">
                            <div className="today-info">
                                <div>
                                    {formatDate(diary.date)}
                                </div>
                                <div>
                                    컨디션: <span>{getConditionEmoji(diary.condition)}</span>
                                </div>
                            </div>
                            <div className="diary-author">
                                <div className="profile" onClick={(e) => {e.stopPropagation(); navigate(`/profile/${diary.authorUuid}`)}}>
                                    {diary.photoUrl ? (
                                        <img src={diary.photoUrl} alt="picture" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className="icon" />
                                    )}
                                </div>
                                <p className="nickname">{diary.nickname}</p>
                            </div>
                        </div>
                        <div className="diary-detail">
                            <h3 className="diary-title">{diary.title}</h3>
                            <p>
                                {diary?.exercisePart?.slice(0, 5).map((exercisePart, i) => (
                                    <span key={i} className="part">
                                        {exercisePart}
                                    </span>
                                ))}
                            </p>
                            <div className="diary-stats">
                                <span><FontAwesomeIcon icon={faEye}/> {diary.viewCount}</span>
                                <span><FontAwesomeIcon icon={faHeart}/> {diary.likeCount}</span>
                                <span><FontAwesomeIcon icon={faComment}/> {diary.commentCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ))}
        </div>
    )
};

export default DiaryList;