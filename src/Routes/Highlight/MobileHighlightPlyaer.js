import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MobileHighlightPlayer.css";
import { useAxios } from "../../contexts/useAxios";
import { useAuth } from "../../contexts/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import MobileReactionBtn from "../../components/MobileReactionBtn";
import CommentSection from "../../components/CommentSection";
import MobileHighlightInfo from "./MobileHighlightInfo";
import { useParams } from "react-router-dom";

const BATCH_SIZE = 7;

const MobileHighlightPlayer = () => {
  const api = useAxios();
  const navigate = useNavigate();
  const { userUuid, userRole } = useAuth();
  const { postId } = useParams();

  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedStates, setLikedStates] = useState({});

  const [showComment, setShowComment] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const commentScrollRef = useRef(null);
  const infoScrollRef = useRef(null);

  // Comment Bottom Sheet
  const [commentHeight, setCommentHeight] = useState(window.innerHeight * 0.7);
  const [translateYComment, setTranslateYComment] = useState(0);
  const [isDraggingComment, setIsDraggingComment] = useState(false);
  const dragStartYComment = useRef(0);

  // Info Bottom Sheet
  const [infoHeight, setInfoHeight] = useState(window.innerHeight * 0.7);
  const [translateYInfo, setTranslateYInfo] = useState(0);
  const [isDraggingInfo, setIsDraggingInfo] = useState(false);
  const dragStartYInfo = useRef(0);

  const videoRefs = useRef([]);
  const fetching = useRef(false);

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const scrollLock = useRef(false);

  const handleCommentTouchStart = (e) => {
    const scrollTop = commentScrollRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) return;

    dragStartYComment.current = e.touches[0].clientY;
    setIsDraggingComment(true);
  };
  const handleCommentTouchMove = (e) => {
    const scrollTop = commentScrollRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      setIsDraggingComment(false);
      return;
    }

    e.stopPropagation();

    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartYComment.current;

    if (diff > 0) {
      setTranslateYComment(diff);
    }
  };
  const handleCommentTouchEnd = () => {
    setIsDraggingComment(false);

    if (translateYComment > 100) {
      setTranslateYComment(0);
      setShowComment(false);
      return;
    }

    setTranslateYComment(0);
    setCommentHeight(window.innerHeight * 0.7);
  };
  const handleInfoTouchStart = (e) => {
    const scrollTop = infoScrollRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) return;

    dragStartYInfo.current = e.touches[0].clientY;
    setIsDraggingInfo(true);
  };
  const handleInfoTouchMove = (e) => {
    const scrollTop = infoScrollRef.current?.scrollTop ?? 0;
    if (scrollTop > 0) {
      setIsDraggingInfo(false);
      return;
    }

    e.stopPropagation();

    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartYInfo.current;

    if (diff > 0) {
      setTranslateYInfo(diff);
    }
  };
  const handleInfoTouchEnd = () => {
    setIsDraggingInfo(false);

    if (translateYInfo > 100) {
      setTranslateYInfo(0);
      setShowInfo(false);
      return;
    }

    setTranslateYInfo(0);
    setInfoHeight(window.innerHeight * 0.7);
  };

  /** 랜덤 영상 가져오기 */
  const fetchVideos = async (excludeIds = []) => {
    if (fetching.current) return [];
    fetching.current = true;
    try {
      const res = await api.get(
        `/api/highlights/random?limit=${BATCH_SIZE}&exclude=${excludeIds.join(",")}`
      );
      return res.data;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      fetching.current = false;
    }
  };

  useEffect(() => {
    if (!postId || !userUuid) return;
    const increaseView = async () => {
      try {
        const res = await api.post("/api/posts/increase-view", {
          postType: "highlight",
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
    }, [postId, currentIndex, userUuid]);

  /** 초기 로딩 */
  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/api/highlights/random?limit=${BATCH_SIZE}`);
      setVideos(res.data);
    };
    load();
  }, []);

  /** IntersectionObserver */
  useEffect(() => {
    if (!videos.length) return;

    const options = {
      threshold: 0.8,
      rootMargin: "0px 0px -10% 0px",
    };

    const observers = [];

    videoRefs.current.forEach((el, idx) => {
      if (!el) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(async (entry) => {
          if (!entry.isIntersecting) return;

          // 현재 idx로 교체
          setCurrentIndex(idx);

          const postId = videos[idx].postId;

          // URL 업데이트
          window.history.replaceState(null, "", `/highlight/${postId}`);

          // 1) 좋아요 상태 업데이트
          try {
            const res = await api.get(`/api/highlights/${postId}`, {
              params: { userUuid }
            });

            const liked = res.data?.liked ?? false;
            setLikedStates((prev) => ({
              ...prev,
              [postId]: liked,
            }));
          } catch (err) {
            console.error("좋아요 상태 조회 실패", err);
          }

          // 2) 마지막 영상 도달 → 추가 로딩
          if (idx === videos.length - 1) {
            const exclude = videos.map((v) => v.postId);
            const more = await fetchVideos(exclude);
            if (more.length > 0) setVideos((prev) => [...prev, ...more]);
          }
        });
      }, options);

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [videos, userUuid]);

  /** 현재 영상 자동 재생 */
  useEffect(() => {
    if (!videos.length) return;

    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === currentIndex) video.play().catch(() => {});
      else video.pause();
    });
  }, [currentIndex, videos]);

  /** 스와이프 */
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = () => {
    if (scrollLock.current) return;

    const diff = touchStartY.current - touchEndY.current;

    if (diff > 80 && currentIndex < videos.length - 1) {
      scrollLock.current = true;
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => (scrollLock.current = false), 320);
    }
    if (diff < -80 && currentIndex > 0) {
      scrollLock.current = true;
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => (scrollLock.current = false), 320);
    }
  };

  return (
    <div
      className="mobile-highlight-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="mobile-swipe-wrapper"
        style={{
          transform: `translateY(-${currentIndex * 100}vh)`,
          transition: "transform 0.32s ease",
        }}
      >
        {videos.map((item, i) => (
          <div className="mobile-video-page" key={item.postId}>
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              className="mobile-video"
              src={item.videoUrl}
              muted
              playsInline
              loop
            />

            {/* 영상 위 오른쪽 Reaction */}
            <div className="mobile-reaction-panel">
              <MobileReactionBtn
                setShowComment={setShowComment}
                postId={item.postId}
                postType="highlight"
                userUuid={userUuid}

                /* 현재 영상 기준 author 여부 적용 */
                isAuthor={item.authorUuid === userUuid}

                /* 각 영상별 좋아요 상태 적용 */
                liked={likedStates[item.postId] ?? false}

                postAuthorUuid={item.authorUuid}

                setLiked={(val) =>
                    setLikedStates((prev) => ({
                    ...prev,
                    [item.postId]: val,
                    }))
                }
                likeCount={item.likeCount}
                commentCount={item.commentCount}
                thumbnailUrl={item.thumbnailUrl}
                videoUrls={item.videoUrl}
                userRole={userRole}
                setShowInfo={setShowInfo}
              />
            </div>

            {/* 영상 위 정보 */}
            <div className="mobile-info-overlay">
                <div className="highlight-author">
                <div
                  className="profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${item.userUuid}`);
                  }}
                >
                  {item.user?.photoUrl ? (
                    <img src={item.user.photoUrl} alt="profile" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="icon" />
                  )}
                </div>

                <div className="author-info">
                  <p className="nickname">{item.user?.nickname}</p>
                </div>
              </div>
              <p className="mobile-info-title">{item.title}</p>
            </div>

            {showComment && currentIndex === i && (
              <div
                className="comment-overlay"
                style={{
                  height: `${commentHeight}px`,
                  transform: `translateY(${translateYComment}px)`,
                  transition: isDraggingComment ? "none" : "transform 0.25s ease"
                }}
                onTouchStart={handleCommentTouchStart}
                onTouchMove={handleCommentTouchMove}
                onTouchEnd={handleCommentTouchEnd}
              >
                <div className="comment-drag-handle" />
                <div
                  className="comment-scroll-area"
                  ref={commentScrollRef}
                  style={{ overflowY: "auto", height: "100%" }}
                >
                  <CommentSection
                    postId={item.postId}
                    postType="highlight"
                    userUuid={userUuid}
                    postAuthorUuid={item?.authorUuid}
                    commentCount={item.commentCount}
                    userRole={userRole}
                  />
                </div>
              </div>
            )}

            {showInfo && currentIndex === i && (
              <div
                className="info-overlay"
                style={{
                  height: `${infoHeight}px`,
                  transform: `translateY(${translateYInfo}px)`,
                  transition: isDraggingInfo ? "none" : "transform 0.25s ease"
                }}
                onTouchStart={handleInfoTouchStart}
                onTouchMove={handleInfoTouchMove}
                onTouchEnd={handleInfoTouchEnd}
              >
                <div className="info-drag-handle" />
                <div
                  className="info-scroll-area"
                  ref={infoScrollRef}
                  style={{ overflowY: "auto", height: "100%" }}
                >
                  <MobileHighlightInfo
                    title={item.title}
                    content={item.content}
                    tags={item.tags}
                    date={item.createdAt}
                    userUuid={item?.authorUuid}
                    photoUrl={item.user.photoUrl}
                    nickname={item.user.nickname}

                    postId={item.postId}
                    postType="highlight"
                    isAuthor={item.authorUuid === userUuid}
                    postAuthorUuid={item?.authorUuid}
                    userRole={userRole}

                    likeCount={item.likeCount}
                    commentCount={item.commentCount}

                    thumbnailUrl={item?.thumbnailUrl}
                    videoUrls={item?.videoUrl}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileHighlightPlayer;
