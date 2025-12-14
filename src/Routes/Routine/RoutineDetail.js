import { useNavigate, useParams } from "react-router-dom";
import "./RoutineDateail.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../contexts/AuthProvider";
import CommentSection from "../../components/CommentSection";
import ReactionBtn from "../../components/ReactionBtn";
import SaveRoutine from "./SaveRoutine";
import WorkoutTable from "../../components/WorkoutTable";
import { formatDate } from "../../components/formatDate";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";

const RoutineDateail = () => {
    const width = useWindowWidth();
    const isMobile = width < 1024;
    const { postId } = useParams();
    const { userUuid, userRole, authReady } = useAuth();
    const [routine, setRoutine] = useState(null);
    const [author, setAuthor] = useState(null);
    const [liked, setLiked] = useState(false);
    const [saveMode, setSaveMode] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [blockIds, setBlockIds] = useState([]); 
    const [selectedDay, setSelectedDay] = useState("월"); // 기본 월요일 선택

    const weekWorkouts = routine?.weekBlocks || {};
    const workouts = weekWorkouts[selectedDay] || [];
    const validWorkouts = Array.isArray(workouts)
        ? workouts.filter((w) => w?.exercise)
        : [];

    const days = ["월", "화", "수", "목", "금", "토", "일"];

    const medias = [
        ...(routine?.imageUrls || []).map(url => ({ url, type: "image" })),
        ...(routine?.videoUrls || []).map(url => ({ url, type: "video" })),
    ];

    const navigate = useNavigate();
    const api = useAxios();

    const handleTagClick = (keyword) => {
        navigate(`/search?type=routine&keyword=${keyword}`);
    };

    useEffect(() => {
        if (!userUuid) return;

        const increaseView = async () => {
            try {
                const res = await api.post("/api/posts/increase-view", {
                    postType: "routine",
                    postId,
                    userUuid,
                },
            );

                return res.data.post; // 업데이트된 게시물 반환
            } catch (err) {
                console.error("조회수 증가 실패:", err.response?.data || err.message);
                return null;
            }
        };

        increaseView();
    }, [postId, userUuid]);

    useEffect(() => {
        if (!userUuid) return;

        const fetchRoutine = async () => {
            setIsLoading(true);
            try {
            // 1️⃣ 게시글 가져오기 (userUuid 없어도 실행)
            const routineRes = await api.get(`/api/routines/${postId}`);
            setRoutine(routineRes.data.routine);
            setAuthor(routineRes.data.author);

            const { dayBlockId, weekBlockIds } = routineRes.data.routine;

            let combined = [];

            // DAY 루틴
            if (dayBlockId) {
            combined.push(dayBlockId);
            }

            // WEEK 루틴
            if (weekBlockIds && typeof weekBlockIds === "object") {
            Object.values(weekBlockIds).forEach(arr => {
                if (Array.isArray(arr) && arr.length > 0) {
                combined.push(...arr);
                }
            });
            }

            setBlockIds(combined);

            // 2️⃣ 좋아요 상태 가져오기 (userUuid 있고 token 있을 때만)
            if (userUuid) {
                try {
                const likeRes = await api.get(`/api/reactions/${postId}/likes`, {
                    params: { userUuid },
                });
                setLiked(likeRes.data.liked);
                } catch (likeError) {
                console.error("🚨 좋아요 상태 불러오기 실패:", likeError.response?.data || likeError);
                }
            }

            setIsLoading(false);
            } catch (error) {
            console.error("🚨 루틴 불러오기 실패:", error.response?.data || error);
            }
        };

        fetchRoutine();
    }, [userUuid, postId]);

    const isAuthor = userUuid === routine?.authorUuid;

    if (isLoading) return <div />;

    return (
        <div className="routinedetail-container">
            <div className="top-section">
                <img src={routine?.thumbnailUrl} alt="썸네일" className="thumbnail" />
                <div style={{ flex: "1" }}>
                    <div className="routinedetail-header">
                        <h2 className="title">{routine?.title}</h2>
                        {!isMobile &&
                            <button onClick={() => setSaveMode(true)}>루틴 저장하기</button>
                        }
                    </div>
                    <div>
                        <li className="profile-section">
                            <div className="profile" onClick={() => navigate(`/profile/${routine.authorUuid}`)}>
                                {author?.photoUrl ? (
                                    <img src={author?.photoUrl} alt="picture" />
                                ) : (
                                    <FontAwesomeIcon icon={faUser} className="icon" />
                                )}
                            </div>
                            <div className="author-info">
                            <p className="nickname">{author?.nickname}</p>
                            <p className="date">{formatDate(routine?.createdAt)}</p>
                            </div>
                        </li>
                        <div className="group">
                            <div>
                                <li className="rates">
                                    <strong>난이도</strong>
                                    {[1, 2, 3, 4, 5].map((level) => (
                                    <span
                                        key={level}
                                        style={{ color: level <= routine?.difficulty ? "#ffc107" : "#ccc" }}
                                    >
                                        ★
                                    </span>
                                    ))}
                                </li>
                                <li>
                                    <strong>루틴 타입</strong>{routine?.type === "day" ? "하루 루틴" : "주간 루틴"}
                                </li>
                            </div>
                            <div>
                                <li><strong>루틴 주기</strong> {routine?.frequency}</li>
                                {routine?.type === "day" ? (
                                // 🔹 하루 루틴: 숫자 하나만 표시
                                <li>
                                    <strong>소요 시간</strong> {routine?.totalTime}분
                                </li>
                                ) : (
                                // 🔹 주간 루틴: 요일별 객체를 map으로 표시
                                <li>
                                    <ul>
                                        <li>
                                            <strong>소요 시간</strong>{" "}
                                            {Object.entries(routine.totalTime)
                                            .map(([day, time]) => `${time}분`)
                                            .join(" / ")}
                                        </li>
                                    </ul>
                                </li>
                                )}
                            </div>

                            <li>
                                <strong>운동 부위</strong>
                                {routine?.bodyParts.map((bodyPart, i) => (
                                    <span key={i} className="part">
                                    {bodyPart}
                                    </span>
                                ))}
                            </li>

                            <li className="purposes">
                                <strong>운동 목적</strong>
                                {routine?.purpose.map((purpose, i) => (
                                    <span key={i} className="purpose">
                                    {purpose}
                                    </span>
                                ))}
                            </li>

                            <li className="tags">
                                <strong>태그</strong>
                                <div className="tag-wrapper">
                                    {routine?.tags.map((tag, i) => (
                                    <span key={i} className="tag" onClick={() => handleTagClick(tag)}>{tag}</span>
                                    ))}
                                </div>
                            </li>

                            {isMobile &&
                                <button onClick={() => setSaveMode(true)} className="mobile-save">루틴 저장하기</button>
                            }
                        </div> 
                    </div>
                </div>
            </div>

            <div className="table-container">
                {routine?.type === "day" ? (
                    <div className="daily-tables">
                        <WorkoutTable workouts={routine.dayBlock} />
                    </div>
                    ) : (
                    <div className="weekly-tables">
                        {/* 🔹 요일 선택 버튼 */}
                        <div className="day-selector">
                            {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`day-btn ${selectedDay === day ? "active" : ""}`}
                            >
                                {day}
                            </button>
                            ))}
                        </div>

                        {/* 🔹 선택된 요일의 소요 시간 표시 */}
                        

                        {/* 🔹 선택된 요일의 표 */}
                        <div className="day-table">
                            <WorkoutTable workouts={validWorkouts} />
                        </div>
                    </div>
                    )}
                </div>

            {(routine?.description || routine?.dietTip || routine?.note) &&
                <div className="detail-info">
                    {routine?.description && (
                        <li><span>설명</span> <p>{routine?.description}</p></li>
                    )}

                    {routine?.dietTip && (
                        <li><span>식단</span> <p>{routine?.dietTip}</p></li>
                    )}

                    {routine?.note && (
                        <li><span>작성자 메모</span> <p>{routine?.note}</p></li>
                    )}
                </div>
            }

            {medias.length > 0 && (
                <div className="media-container">
                    <h3>이미지 / 동영상</h3>
                    <div className="routine-medias">
                        {medias.map((m, idx) =>
                        m.type === "image" ? (
                            <img
                            key={idx}
                            src={m.url}
                            className="routine-media-image"
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
                                className="routine-media-video"
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

            <ReactionBtn
                postId={routine?.postId}
                postType="routine"
                userUuid={userUuid}
                isAuthor={isAuthor}
                setLiked={setLiked}
                liked={liked}
                appliedCount={routine?.appliedCount}
                blockIds={blockIds}
                thumbnailUrl={routine?.thumbnailUrl}
                imageUrls={routine?.imageUrls}
                videoUrls={routine?.videoUrls}
                postAuthorUuid={routine?.authorUuid}
                userRole={userRole}
            />

            <CommentSection 
                postId={routine.postId}
                postType="routine"
                userUuid={userUuid}
                postAuthorUuid={routine?.authorUuid}
                commentCount={routine?.commentCount}
                userRole={userRole}
            />

            {saveMode && (
                <div className="overlay">
                    <SaveRoutine 
                        postId={routine.postId}
                        setSaveMode={setSaveMode}
                        routineType={routine?.type}      // "day" 또는 "week"
                        defaultTitle={routine?.title}    // title이 초기값으로 들어가게 변경
                        routine={routine}               // 전체 루틴 객체도 넘겨서 저장 시 활용
                        dayBlockId={routine.dayBlockId}
                        weekBlockIds={routine.weekBlockIds}
                        postAuthorUuid={routine?.authorUuid}
                    />
                </div>
            )}

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

export default RoutineDateail;