import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faEllipsisV, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import ReportButton from "./ReportButton";
import { useNavigate } from "react-router-dom";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import "../css/CommentSection.css";
import SingleSelectDropdown from "./SingleSelectDropdown";
import { useCallback } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { useAxios } from "../contexts/useAxios";

const CommentSection = ({ postId, postType, userUuid, commentCount, postAuthorUuid }) => {
  const { userRole } = useAuth();
  const api = useAxios();
  const [comments, setComments] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasMore, setHasMore] = useState(true); // 더 불러올 댓글이 있는지
  const limit = 20;
  const loaderRef = useRef(null);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [activeReplyOptions, setActiveReplyOptions] = useState(null);
  const [sortType, setSortType] = useState("popular"); // "latest" | "popular"
  const [isFetching, setIsFetching] = useState(false);

  const [visibleReplies, setVisibleReplies] = useState({});

  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveCommentOptions(false);
        setActiveReplyOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchComments = useCallback(async () => {
    if (!userUuid || !hasMore || isFetching) return;

    setIsFetching(true);
    try {
      const res = await api.get(`/api/comments/${postId}`, {
        params: { sort: sortType, skip: loadedCount, limit, userUuid },
      });

      const fetchedComments = res.data.comments || [];

      setComments(prev => [...prev, ...fetchedComments]);
      setLoadedCount(prev => prev + fetchedComments.length);
      if (fetchedComments.length < limit) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [
    postId,
    sortType,
    loadedCount,
    userUuid,
    hasMore,
    isFetching
  ]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchComments();
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [fetchComments]);


  useEffect(() => {
    setIsFetching(false);  
    setComments([]);
    setLoadedCount(0);
    setHasMore(true);
    setVisibleReplies({});
  }, [postId, sortType]); // postId가 바뀔 때마다

  const loadMoreReplies = async (parentId) => {
    const currentLoaded = visibleReplies[parentId]?.length || 0;

    const res = await api.get("/api/comments/replies", {
      params: {
        parentId,
        skip: currentLoaded,
        limit: 20,
        userUuid
      },
    });

    const moreReplies = res.data.replies;

    // visibleReplies 업데이트
    setVisibleReplies(prev => ({
      ...prev,
      [parentId]: [
        ...(prev[parentId] || []), // 초기 상태라면 빈 배열
        ...moreReplies,            // ⚠️ 변수명 수정
      ],
    }));

    // comments 상태에 loadedReplies 갱신
    setComments(prev => prev.map(c => 
      c.id === parentId ? { ...c, loadedReplies: (c.loadedReplies || 0) + moreReplies.length } : c
    ));
  };

  /** 댓글 등록 (댓글 + 답글) */
  const handleSubmitComment = async ({ content, parentId = null }) => {
    if (!content.trim()) return alert("댓글 내용을 입력하세요.");

    try {
      const res = await api.post(
        "/api/comments",
        {
            authorUuid: userUuid,
            postId,
            postType,
            content,
            parentId,
            postAuthorUuid
        },
        );

        // 새 댓글 반영
        if (parentId) {
          setComments(prev =>
            prev.map(c =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), res.data.comment] }
                : c
            )
          );
        } else {
          setComments(prev => [res.data.comment, ...prev]); // ← 최신순
        }

        setCommentText("");
        setReplyText("");
        setReplyTarget(null);
    } catch (error) {
        console.error("🚨 댓글 작성 실패:", error);
        alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  /** 댓글 수정 */
  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return alert("내용을 입력하세요.");

    try {
        const res = await api.put(
            `/api/comments/${commentId}`,
            {
                authorUuid: userUuid,
                content: editContent,
            },
        );

        // 수정된 내용 UI 반영
        setComments(prev =>
            prev.map(c =>
                c.id === commentId
                ? { ...c, content: res.data.comment.content }
                : {
                    ...c,
                    replies: c.replies?.map(r =>
                        r.id === commentId ? { ...r, content: res.data.comment.content } : r
                    ) || [],
                    }
            )
            );

            setEditingCommentId(null);
            setEditingReplyId(null);
        } catch (error) {
            console.error("🚨 댓글 수정 실패:", error);
            alert("댓글 수정 중 오류가 발생했습니다.");
        }
    };

  /** 댓글 삭제 */
  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

    try {
        const res = await api.delete(`/api/comments/${commentId}`, {
            data: { userUuid, postId, postType, userRole }, // ← 여기가 중요!
        });

        if (res.status === 200) {
        setComments((prevComments) => {
            if (isReply && parentId) {
            // 🔹 대댓글 삭제
            return prevComments.map((comment) =>
                comment.id === parentId
                ? {
                    ...comment,
                    replies: comment.replies?.filter((reply) => reply.id !== commentId),
                    }
                : comment
            );
            } else {
            // 🔹 일반 댓글 삭제
            return prevComments.filter((comment) => comment.id !== commentId);
            }
        });
        } else {
        console.warn("⚠️ 서버 응답 이상:", res);
        }
    } catch (err) {
        console.error("🚨 댓글 삭제 실패:", err);
        alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  /** 댓글 좋아요 */
  const toggleLike = async (commentId, isReply = false) => {
    try {
      const res = await api.post(
        `/api/reactions/toggle-like`,
        { postId: commentId, postType: "comment", userUuid },
      );

      const liked = res.data.liked;

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId)
            return { ...c, isLiked: liked, likesCount: c.likesCount + (liked ? 1 : -1) };
          if (isReply)
            return {
              ...c,
              replies: c.replies?.map((r) =>
                r.id === commentId
                  ? { ...r, isLiked: liked, likesCount: r.likesCount + (liked ? 1 : -1) }
                  : r
              ),
            };
          return c;
        })
      );
    } catch (err) {
      console.error("🚨 좋아요 실패:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="comment-section">
      <div className="header">
        <h3>댓글 {commentCount}개</h3>
        
        <SingleSelectDropdown
          label="정렬"
          value={sortType}
          onChange={(val) => setSortType(val)}
          options={[
            { value: "latest", label: "최신순" },
            { value: "popular", label: "인기순" },
          ]}
        />  
      </div>
      {/* 댓글 입력 */}
      <div className="comment-input">
        <textarea
          placeholder="댓글을 입력하세요"
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
            e.target.style.height = "auto"; // 높이 리셋
            e.target.style.height = `${e.target.scrollHeight}px`; // 내용에 맞게 조절
          }}
          rows={1}
        />
        <button onClick={() => handleSubmitComment({ content: commentText })}>작성</button>
      </div>

      {/* 댓글 목록 */}
      <div className="comment-detail-container">
        <div className="comments-section">
          {comments.length === 0 ? (
            <p className="no-comment">댓글이 없습니다</p>
          ) : (
            comments.map((c) => (
              <div className="comment" key={c.id}>
                {/* 댓글 프로필 */}
                <div className="comment-left">
                  <div className="profile" onClick={() => navigate(`/profile/${c.author.uuid}`)}>
                    {c.author?.photoUrl ? (
                      <img src={c.author?.photoUrl} alt="Profile" />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="icon" />
                    )}
                  </div>
                </div>

                {/* 댓글 오른쪽 */}
                <div className="comment-right">
                  {/* 닉네임 + 옵션 */}
                  <div className="comment-header">
                    <p className="comment-nickname">
                      {c.author?.nickname}
                    </p>
                    <div className="comment-options" style={{ position: "relative" }}>
                      <button
                        onClick={() =>
                          setActiveCommentOptions(
                            activeCommentOptions === c.id ? null : c.id
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      {activeCommentOptions === c.id && (
                        <div className="options-menu"  ref={dropdownRef}>
                          {c.authorUuid === userUuid ? (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditContent(c.content);
                                  setActiveCommentOptions(null);
                                }}
                                
                              >
                                댓글 편집
                              </button>
                              <button onClick={() => handleDeleteComment(c.id)}>
                                삭제
                              </button>
                            </>
                          ) : (
                            <>
                              <ReportButton targetId={c.id} targetType="comment" postId={postId}/>
                              {userRole === "admin" &&
                                <button onClick={() => handleDeleteComment(c.id)} style={{ textAlign: "center" }}>
                                  삭제
                                </button>
                              }
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 날짜 */}
                  <div className="comment-date">
                    {formatDate(c.createdAt)}
                  </div>

                  {/* 본문 */}
                  {editingCommentId === c.id ? (
                    <div className="comment-edit">
                      <textarea
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value)
                          e.target.style.height = "auto"; // 높이 리셋
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        rows={1}
                      />
                      <button onClick={() => handleEdit(c.id)}>저장</button>
                      <button onClick={() => setEditingCommentId(null)} className="cancel">취소</button>
                    </div>
                  ) : (
                    <p className="comment-content">{c.content}</p>
                  )}

                  {/* 좋아요/답글 */}
                  <div className="comment-meta">
                    <button
                      className="comment-like-btn"
                      onClick={() => toggleLike(c.id)}
                    >
                      <FontAwesomeIcon
                        icon={c.isLiked ? faHeart : regularHeart}
                        className="comment-like-icon"
                        style={{ color: c.isLiked ? "#4a86e8" : "black" }}
                      />{" "}
                      {c.likesCount || 0}
                    </button>
                    <button
                      className="comment-reply-btn"
                      onClick={() => setReplyTarget(c.id)}
                    >
                      답글
                    </button>
                  </div>

                  {/* 답글 입력 */}
                  {replyTarget === c.id && (
                    <div className="reply-input">
                      <textarea
                        type="text"
                        placeholder="답글을 입력하세요"
                        value={replyText}
                        onChange={(e) => {
                          setReplyText(e.target.value);
                          e.target.style.height = "auto"; // 높이 리셋
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        rows={1}
                      />
                      <button
                        onClick={() =>
                          handleSubmitComment({ content: replyText, parentId: c.id })
                        }
                      >
                        작성
                      </button>
                      <button onClick={() => setReplyTarget(null)} className="cancel">취소</button>
                    </div>
                  )}

                  {/* 답글 렌더링 */}
                  {(visibleReplies[c.id] || []).map((r) => (
                    <div className="reply" key={r.id}>
                      {/* 답글 프로필 */}
                      <div className="reply-left">
                        <div className="profile" onClick={() => navigate(`/profile/${r.author.uuid}`)}>
                          {r.author?.photoUrl ? (
                            <img src={r.author?.photoUrl} alt="Profile" />
                          ) : (
                            <FontAwesomeIcon icon={faUser} className="icon" />
                          )}
                        </div>
                      </div>

                      {/* 답글 오른쪽 */}
                      <div className="reply-right">
                        {/* 닉네임 + 옵션 */}
                        <div className="reply-header">
                          <p className="reply-nickname">{r.author?.nickname}</p>
                          <div className="reply-options" style={{ position: "relative" }}>
                            <button
                              onClick={() =>
                                setActiveReplyOptions(activeReplyOptions === r.id ? null : r.id)
                              }
                            >
                              <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                            {activeReplyOptions === r.id && (
                              <div className="options-menu" ref={dropdownRef}>
                                {r.authorUuid === userUuid ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingReplyId(r.id);
                                        setEditContent(r.content);
                                        setActiveReplyOptions(null);
                                      }}
                                    >
                                      답글 편집
                                    </button>
                                    <button onClick={() => handleDeleteComment(r.id, true, r.parentId)}>
                                      삭제
                                    </button>
                                  </>
                                ) : (
                                  <ReportButton targetId={r.id} targetType="comment" postId={postId}/>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 날짜 */}
                        <div className="reply-date">{formatDate(r.createdAt)}</div>

                        {/* 본문 */}
                        {editingReplyId === r.id ? (
                          <div className="reply-edit">
                            <textarea
                              value={editContent}
                              onChange={(e) => {
                                setEditContent(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = `${e.target.scrollHeight}px`;
                              }}
                              rows={1}
                            />
                            <button onClick={() => handleEdit(r.id)}>저장</button>
                            <button onClick={() => setEditingReplyId(null)} className="cancel">
                              취소
                            </button>
                          </div>
                        ) : (
                          <p className="reply-content">{r.content}</p>
                        )}

                        {/* 좋아요 */}
                        <div className="reply-meta">
                          <button className="reply-like-btn" onClick={() => toggleLike(r.id, true)}>
                            <FontAwesomeIcon
                              icon={r.isLiked ? faHeart : regularHeart}
                              className="reply-like-icon"
                              style={{ color: c.isLiked ? "#4a86e8" : "black" }}
                            />{" "}
                            {r.likesCount || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 답글 더보기 버튼 */}
                  {c.replyCount > (visibleReplies[c.id]?.length || 0) && (
                    <button className="reply-more-btn" onClick={() => loadMoreReplies(c.id)}>
                      답글 더보기
                    </button>
                  )}

                </div>
              </div>
            ))
          )}
          {hasMore && <div ref={loaderRef} style={{ height: "1px" }} />}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
