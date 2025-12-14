import "./DiaryDetail.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { formatDate } from "../../components/formatDate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import WorkoutTable from "../../components/WorkoutTable";
import CommentSection from "../../components/CommentSection";
import ReactionBtn from "../../components/ReactionBtn";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";


const renderGauge = (value) => {
  const percentage = (value / 10) * 100;
  return (
    <div className="gauge-bar">
      <div className="gauge-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
};

const DiaryDetail = () => {
    const { postId } = useParams(); // ✅ URL에서 postId 추출
    const api = useAxios();
    const { userUuid, userRole } = useAuth();
    const [diary, setDiary] = useState(null);
    const [liked, setLiked] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const width = useWindowWidth();
    const isMobile = width < 1024;
    const navigate = useNavigate();

    useEffect(() => {
        const increaseView = async () => {
            try {
                const res = await api.post("/api/posts/increase-view", {
                    postType: "diary",
                    postId,
                    userUuid,
                });

                return res.data.post; // 업데이트된 게시물 반환
            } catch (err) {
                console.error("조회수 증가 실패:", err.response?.data || err.message);
                return null;
            }
        };

        increaseView();
    }, [postId]);

    useEffect(() => {
        if (!userUuid) return;

        const fetchDiary = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/api/diaries/${postId}`);
            setDiary(res.data);
            
            const likeRes = await api.get(`/api/reactions/${postId}/likes`, {
                params: { userUuid },
            });
            setLiked(likeRes.data.liked);
            setIsLoading(false);
        } catch (error) {
            console.error("🚨 일지 불러오기 실패:", error);
        }
        };

        fetchDiary();
    }, [postId, userUuid]);

    const handleTagClick = (keyword) => {
        navigate(`/search?type=diary&keyword=${keyword}`);
    };

    const isAuthor = userUuid === diary?.authorUuid;

    if (isLoading) return <div></div>;

    const medias = [
        ...(diary.imageUrls || []).map(url => ({ url, type: "image" })),
        ...(diary.videoUrls || []).map(url => ({ url, type: "video" })),
    ];

    return (
        <div className="diarydetail-container">
            <div className="diarydetail-header">
                <h1>{diary?.title}</h1>
            </div>

            <div className="diarydetail-author">
                <div className="profile" onClick={(e) => {e.stopPropagation(); navigate(`/profile/${diary?.userUuid}`)}}>
                    {diary?.photoUrl ? (
                        <img src={diary?.photoUrl} alt="picture" />
                    ) : (
                        <FontAwesomeIcon icon={faUser} className="icon" />
                    )}
                </div>
                <div className="author-inifo">
                    <p className="nickname">{diary?.nickname}</p>
                    <p className="date">{formatDate(diary?.date)} ({diary?.dayOfWeek.slice(0, 1)})</p>
                </div>
            </div>

            <div className="diary-info">
                <div className="info-row">
                    <div><b>🕒 시간</b><span>{diary?.startTime} ~ {diary?.endTime}</span></div>
                    <div><b>📍 장소</b><span>{diary?.location}</span></div>
                </div>
                <div className="info-row sec">
                    <div><b>⚖️ 체중</b><span>{diary?.weight}kg</span></div>
                    <div><b>😴 수면</b><span>{diary?.sleepHours}시간</span></div>
                    <div><b>💪 컨디션</b><span>{diary?.condition}</span></div>
                </div>
            </div>


            <div className="diary-section">
                <h3>운동 요약</h3>

                <div className="workout-summary">
                    <div className="summary-item">
                        <b>운동 부위</b>
                        <span>
                            {Array.isArray(diary?.exercisePart) && diary.exercisePart.length > 0
                            ? diary.exercisePart.join(" / ")
                            : "—"}
                        </span>
                    </div>

                    <div className="summary-item">
                    <b>통증 부위</b>
                    <span>{diary?.painAreas?.length ? diary.painAreas.join(" / ") : "없음"}</span>
                    </div>

                    <div className="rating-group">
                    <div className="rating-item">
                        <b>집중도</b>
                        {renderGauge(diary?.focusLevel || 0)}
                    </div>
                    <div className="rating-item">
                        <b>만족도</b>
                        {renderGauge(diary?.satisfaction || 0)}
                    </div>
                    </div>
                </div>

                <WorkoutTable workouts={diary?.workouts} />

                <div className="note-section">
                    <div className="note">
                        <h4>운동 메모</h4>
                        <p>{diary?.notes}</p>
                    </div>
                    <div className="note">
                        <h4>자세/폼 메모</h4>
                        <p>{diary?.formNotes}</p>
                    </div>
                    <div className="note">
                        <h4>다음 목표</h4>
                        <p>{diary?.nextGoal}</p>
                    </div>
                </div>
            </div>

            {medias.length > 0 && (
                <div className="media-container">
                    <h3>이미지 / 동영상</h3>
                    <div className="diary-medias">
                        {medias.map((m, idx) =>
                        m.type === "image" ? (
                            <img
                            key={idx}
                            src={m.url}
                            className="diary-media-image"
                            onClick={() => setSelectedMedia(m)}
                            />
                        ) : (
                            <div
                                className="video-wrapper"
                                onClick={() => {
                                setSelectedMedia(m);
                                }}
                            >
                                <video
                                src={m.url}
                                className="diary-media-video"
                                controls={false}
                                controlsList="nodownload"
                                />

                                <div className="video-click-overlay" />
                            </div>
                        )
                        )}
                    </div>
                </div>
            )}

            {/* 🍽 식단 */}
            {diary?.meals?.length > 0 && (
                <div className="diet-section">
                    <h3>식단</h3>
                    <div className="meal-list">
                        {diary.meals.map((m, idx) => (
                            <div key={idx} className="summary-item">
                                <b className="meal-index">식사 {idx + 1}</b>
                                <span className="meal-text">{m}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 🏷 태그 */}
            {diary?.tags?.length > 0 && (
                <div className="diary-tags">
                {diary?.tags.map((tag, idx) => (
                    <span key={idx} className="tag" onClick={() => handleTagClick(tag)}>{tag}</span>
                ))}
                </div>
            )}

            <ReactionBtn
                postId={diary?.postId}
                postType="diary"
                userUuid={userUuid}
                setLiked={setLiked}
                liked={liked}
                isAuthor={isAuthor}
                thumbnailUrl={diary?.thumbnailUrl}
                imageUrls={diary?.imageUrls}
                videoUrls={diary?.videoUrls}
                postAuthorUuid={diary?.authorUuid}
                userRole={userRole}
            />

            <CommentSection 
                postId={diary?.postId}
                postType="diary"
                userUuid={userUuid}
                postAuthorUuid={diary?.authorUuid}
                commentCount={diary?.commentCount}
                userRole={userRole}
            />

            {selectedMedia && (
            <div className="image-modal" onClick={() => setSelectedMedia(null)}>
                <div
                    className="image-modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    {selectedMedia.type === "image" ? (
                    <img src={selectedMedia.url} alt="enlarged" />
                    ) : (
                    <video
                        src={selectedMedia.url}
                        controls
                        autoPlay
                        playsInline
                        controlsList="nodownload"
                    />
                    )}
                </div>
            </div>
            )}
        </div>
    );
};

export default DiaryDetail;