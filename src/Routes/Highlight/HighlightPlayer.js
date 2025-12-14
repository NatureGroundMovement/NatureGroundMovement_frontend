import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./HighlightPlayer.css";
import CommentSection from "../../components/CommentSection";
import ReactionBtn from "../../components/ReactionBtn";
import { useAuth } from "../../contexts/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { formatDate } from "../../components/formatDate";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";

const BATCH_SIZE = 7;

const HighlightPlayer = () => {
  const { userUuid, userRole } = useAuth();
  const { postId } = useParams();
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedStates, setLikedStates] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({}); 
  const videoRefs = useRef([]);
  const fetching = useRef(false);
  const navigate = useNavigate();
  const api = useAxios();

  const width = useWindowWidth();
  const isMobile = width < 1024;

  const handleTagClick = (keyword) => {
    navigate(`/search?type=highlight&keyword=${keyword}`);
  };

  // ✅ 랜덤 영상 불러오기
  const fetchVideos = async (excludeIds = []) => {
    if (fetching.current) return [];
    fetching.current = true;
    try {
      const res = await api.get(
        `/api/highlights/random?limit=${BATCH_SIZE}&exclude=${excludeIds.join(",")}`);
      return res.data;
    } catch (err) {
      console.error("🚨 영상 로드 실패:", err);
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

  // ✅ 초기 영상 + 랜덤 추가
  useEffect(() => {
    const loadInitial = async () => {
      try {
        // 1️⃣ 메인 영상 데이터 + liked 포함
        const mainRes = await api.get(`/api/highlights/${postId}`, {
          params: { userUuid }
        });

        const mainVideo = mainRes.data;

        // 2️⃣ 추가 영상
        const extraVideos = await fetchVideos([postId]);
        const list = [mainVideo, ...extraVideos];
        setVideos(list);

        // 3️⃣ 좋아요 상태 초기화
        const likedMap = {};
        list.forEach((v) => {
          likedMap[v.postId] = v.liked ?? false;
        });

        setLikedStates(likedMap);

        setCurrentIndex(0);
      } catch (err) {
        console.error("🚨 초기 영상 로드 실패:", err);
      }
    };

    loadInitial();
  }, [postId, userUuid]);

  // ✅ Intersection Observer (URL + 자동 재생)
  useEffect(() => {
    if (!videos.length) return;

    const options = { threshold: 0.75 };
    const observers = [];

    videoRefs.current.forEach((video, i) => {
      if (!video) return;

      const observer = new IntersectionObserver(async (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            setCurrentIndex(i);

            const videoPostId = videos[i]?.postId;
            const newPath = `/highlight/${videoPostId}`;

            // 🔥 여기서 URL 갱신은 항상 실행되게 둬도 됨
            window.history.replaceState(null, "", newPath);

            if (i === videos.length - 1) {
              const excludeIds = videos.map((v) => v.postId);
              const newVideos = await fetchVideos(excludeIds);
              if (newVideos.length)
                setVideos((prev) => [...prev, ...newVideos]);
            }
          }
        });
      }, options);

      observer.observe(video);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());

  }, [videos]);

  // ✅ 현재 영상만 자동 재생
  useEffect(() => {
    if (!videos.length) return;

    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo) return;

    // 현재 영상 재생, 나머지는 정지
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === currentIndex) {
        video
          .play()
          .catch(() => console.log("🎬 자동재생 제한: 사용자 클릭 필요"));
      } else {
        video.pause();
      }
    });
  }, [videos, currentIndex]);

  // ✅ 첫 영상 로드 완료 시 자동 재생
  const handleLoadedData = (i) => {
    if (i === 0 && currentIndex === 0) {
      const firstVideo = videoRefs.current[0];
      if (firstVideo) {
        firstVideo
          .play()
          .catch(() => console.log("🔇 브라우저 자동재생 제한"));
      }
    }
  };

  // ✅ 클릭 시 재생/일시정지
  const handleVideoClick = (i) => {
    const video = videoRefs.current[i];
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setCurrentIndex(i);
    } else {
      video.pause();
    }
  };

  if (!isMobile) return (
    <div className="highlight-player">
      {/* ✅ 왼쪽: 영상 정보 (고정) */}
      <div className="highlight-info">
        {videos[currentIndex] && (() => {
          const currentVideo = videos[currentIndex];
          const isAuthor = currentVideo.authorUuid === userUuid;
          const liked = likedStates[currentVideo.postId] ?? false;

          return (
            <>
              <div className="highlight-author">
                <div
                  className="profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${currentVideo.userUuid}`);
                  }}
                >
                  {currentVideo.user?.photoUrl ? (
                    <img src={currentVideo.user.photoUrl} alt="profile" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="icon" />
                  )}
                </div>

                <div className="author-info">
                  <p className="nickname">{currentVideo.user?.nickname}</p>
                  <p className="date">{formatDate(currentVideo.createdAt)}</p>
                </div>
              </div>
              
              <h3>{currentVideo.title}</h3>

              <div className="highlight-content">
                {expandedPosts[currentVideo.postId] || currentVideo.content.length <= 30
                  ? currentVideo.content
                  : `${currentVideo.content.slice(0, 30)}...`}

                {currentVideo.tags.length > 0 &&
                  (currentVideo.content.length <= 30 || expandedPosts[currentVideo.postId]) && (
                    <div className="highlight-tags">
                      {currentVideo.tags.map((tag, i) => (
                        <span key={i} className="tag" onClick={() =>handleTagClick(tag)}>
                          {tag}
                        </span>
                      ))}
                  </div>
                )}

                {currentVideo.content.length > 30 && (
                  <button
                    className={expandedPosts[currentVideo.postId] ? "see-no-more-btn" : "see-more-btn"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPosts((prev) => ({
                        ...prev,
                        [currentVideo.postId]: !prev[currentVideo.postId],
                      }));
                    }}
                  >
                    {expandedPosts[currentVideo.postId] ? "간략히" : "더보기"}
                  </button>
                )}
              </div>

              <ReactionBtn
                postId={currentVideo.postId}
                postType="highlight"
                userUuid={userUuid}
                isAuthor={isAuthor}
                liked={liked}
                postAuthorUuid={videos[currentIndex]?.authorUuid}
                setLiked={(val) =>
                  setLikedStates((prev) => ({
                    ...prev,
                    [currentVideo.postId]: val,
                  }))
                }
                commentCount={currentVideo.commentCount}
                thumbnailUrl={currentVideo?.thumbnailUrl}
                videoUrls={currentVideo?.videoUrl}
                userRole={userRole}
              />
            </>
          );
        })()}
      </div>
      
      {/* ✅ 가운데: 영상 스크롤 영역 */}
      <div className="video-section">
        {videos.map((item, i) => (
          <div key={item.postId} className="video-wrapper">
            <video
              ref={(el) => (videoRefs.current[i] = el)}
              src={item.videoUrl}
              muted
              playsInline
              loop
              preload="metadata"
              className="react-player"
              onClick={() => handleVideoClick(i)}
              onLoadedData={() => handleLoadedData(i)}
            />
          </div>
        ))}
      </div>

      {/* ✅ 오른쪽: 댓글 (고정) */}
      <div className="comment-container">
        {videos[currentIndex] && (
          <CommentSection
            postId={videos[currentIndex].postId}
            postType="highlight"
            userUuid={userUuid}
            postAuthorUuid={videos[currentIndex]?.authorUuid}
            commentCount={videos[currentIndex].commentCount}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

export default HighlightPlayer;
