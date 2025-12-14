import "./Post.css";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CommentSection from "../../components/CommentSection";
import { useAuth } from "../../contexts/AuthProvider";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { formatDate } from "../../components/formatDate";
import ReactionBtn from "../../components/ReactionBtn";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";

const Post = () => {
  const { userUuid, userRole } = useAuth();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [liked, setLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const navigate = useNavigate();
  const api = useAxios();
  const width = useWindowWidth();
  const isMobile = width < 1024;

  const handleTagClick = (keyword) => {
    navigate(`/search?type=community&keyword=${keyword}`);
  };

  useEffect(() => {
        const increaseView = async () => {
            try {
                const res = await api.post("/api/posts/increase-view", {
                    postType: "community",
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
    }, [postId]);

  // 게시글 불러오기
  useEffect(() => {
    if (!userUuid) return;

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/api/community/${postId}`);
        setPost(res.data.post);
        setAuthor(res.data.author);

        // 좋아요 상태 확인
        const likeRes = await api.get(`/api/reactions/${postId}/likes`, {
          params: { userUuid },
        });
        setLiked(likeRes.data.liked);
      } catch (error) {
        console.error("게시글 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, userUuid]);

  if (isLoading) return <div className="post-container"><Spinner /></div>;

  const isAuthor = userUuid === author?.uuid;

  const medias = [
    ...(post.imageUrls || []).map(url => ({ url, type: "image" })),
    ...(post.videoUrls || []).map(url => ({ url, type: "video" })),
  ];

  return (
    <div className="post-container">
      {/* 본문 */}
      <div className="post-content">
        <div className="author-info">
          <div className="profile" onClick={() => navigate(`/profile/${author.uuid}`)}>
            {author?.photoUrl ? (
              <img src={author?.photoUrl} alt="picture" />
            ) : (
              <FontAwesomeIcon icon={faUser} className="icon" />
            )}
          </div>
          <div className="sub-info">
            <p>{author.nickname}</p>
            <p>{formatDate(post?.createdAt)}</p>
          </div>
        </div>

        <div className="post-info">
          <h2>{post?.title}</h2>
          <p>{post?.content}</p>

          {medias.length > 0 && (
            <div className="media-container">
              <div className="post-medias">
                {medias.map((m, idx) =>
                  m.type === "image" ? (
                    <img
                      key={idx}
                      src={m.url}
                      className="post-media-image"
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
                          className="post-media-video"
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

          {post?.tags?.length > 0 && (
            <li className="post-tags">
              <div className="tag-wrapper">
                {post?.tags.map((tag, i) => (
                  <span key={i} className="tag" onClick={() =>handleTagClick(tag)}>{tag}</span>
                ))}
              </div>
            </li>
          )}
        </div>
      </div>

      {/* 반응 영역 */}
      <ReactionBtn 
        postId={post.postId}
        postType="community"
        userUuid={userUuid}
        liked={liked}
        setLiked={setLiked}
        isAuthor={isAuthor}
        commentCount={post.commentCount}
        likeCount={post.likeCount}
        thumbnailUrl={post?.thumbnailUrl}
        imageUrls={post?.imageUrls}
        videoUrls={post?.videoUrls}
        postAuthorUuid={post?.authorUuid}
        userRole={userRole}
      />

      <CommentSection
        postId={post?.postId}
        postType="community"
        userUuid={userUuid}
        postAuthorUuid={post?.authorUuid}
        commentCount={post?.commentCount}
        userRole={userRole}
      />
      
      {/* ✅ 이미지 확대 모달 */}
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

export default Post;
