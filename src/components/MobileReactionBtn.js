import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { faHeart as solidHeart, faShareNodes, faPen, faTrash, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import ReportButton from "./ReportButton";
import "../css/MobileReactionBtn.css";
import { useNavigate } from "react-router-dom";
import { storageService } from "../services/firebase";
import { deleteObject, ref } from "firebase/storage";
import { useAxios } from "../contexts/useAxios";

const typeMap = {
  diary: "diary",
  routine: "routine",
  community: "community",
  highlight: "highlight",
};

const extractFilePath = (url) => {
  const start = url.indexOf("/o/") + 3;
  const end = url.indexOf("?");
  return decodeURIComponent(url.substring(start, end));
};

const deleteFilesFromStorage = async (urls = []) => {

  for (const url of urls) {
    try {
      const filePath = extractFilePath(url);
      const fileRef = ref(storageService, filePath);

      await deleteObject(fileRef);
    } catch (err) {
      console.error("⚠️ 파일 삭제 실패:", err);
    }
  }
};

const MobileReactionBtn = ({
  postId,
  postType,
  userUuid,
  liked,
  setLiked,
  isAuthor,
  commentCount,
  likeCount,
  appliedCount,
  blockIds,
  thumbnailUrl,
  imageUrls,
  videoUrls,
  postAuthorUuid,
  userRole,
  setShowComment,
  setShowInfo
}) => {
  const navigate = useNavigate();
  const api = useAxios();

  const handleLike = async () => {
    if (!userUuid) return alert("로그인이 필요합니다.");

    // 즉시 UI 반영
    const newLiked = !liked;
    setLiked(newLiked);

    try {
      // ✅ 좋아요 토글 + 게시글 카운트 한번에 처리
      const res = await api.post(
      `/api/reactions/toggle-like`,
      { postId, userUuid, postType, postAuthorUuid },
      );

      // 서버 결과로 UI 안정성 확보
      setLiked(res.data.liked);
    } catch (error) {
      console.error("좋아요 처리 오류:", error);

      // 실패 시 롤백
      setLiked(!newLiked);
      }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 이 게시물을 삭제하시겠습니까?")) return;

    try {
      const urlsToDelete = [
        thumbnailUrl,
        imageUrls,
        videoUrls,
      ].filter(Boolean);

      await deleteFilesFromStorage(urlsToDelete);

      await api.delete(`/api/posts/${postId}/${postType}`, {
        data: { userUuid, commentCount, likeCount, appliedCount, blockIds, userRole, postAuthorUuid },
      });

      alert("게시글이 삭제되었습니다.");
      navigate(-1); // 삭제 후 이동
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    navigate(`/${typeMap[postType]}/edit/${postId}`)
  }

  const handleShare = async () => {
    try {
      const link = `${window.location.origin}/${typeMap[postType]}/${postId}`;
      await navigator.clipboard.writeText(link);
      alert("링크가 복사되었습니다!");
    } catch (error) {
      console.error("공유 처리 오류:", error);
      alert("공유 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className={isAuthor ? "mobile-reactionbtn-container author" : "mobile-reactionbtn-container"}>
      {/* 좋아요 버튼 */}
      <div>
        <button onClick={handleLike} className={liked ? "liked" : ""}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon
            icon={liked ? solidHeart : regularHeart}
            style={liked ? { color: "#4a86e8" } : {}}
            className="icon"
          />
        </button>
        {likeCount || 0}
      </div>

      <div>
        <button onClick={() => setShowComment(true)}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}  
        >
          <FontAwesomeIcon icon={faComment} />
        </button>
        {commentCount || 0}
      </div>

      {/* 공유하기 버튼 */}
      <div>
        <button onClick={handleShare}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <FontAwesomeIcon icon={faShareNodes} className="icon"/>
        </button>
        공유
      </div>

      <div>
        <button onClick={() => setShowInfo(true)}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}  
        >
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </button>
      </div>
    </div>
  );
};

export default MobileReactionBtn;
