import "./MobileHighlightInfo.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../components/formatDate";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import ReportButton from "../../components/ReportButton";
import { deleteObject, ref } from "firebase/storage";
import { storageService } from "../../services/firebase";
import { useAxios } from "../../contexts/useAxios";

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

const MobileHighlightInfo = ({
    title,
    content,
    tags,
    date,
    userUuid,
    photoUrl,
    nickname,
    postId,
    postType,
    isAuthor,
    postAuthorUuid,
    userRole,
    likeCount,
    commentCount,
    thumbnailUrl,
    videoUrls
}) => {
    const navigate = useNavigate();
    const api = useAxios();

    const handleTagClick = (keyword) => {
        navigate(`/search?type=highlight&keyword=${keyword}`);
    };

    const handleDelete = async () => {
        if (!window.confirm("정말 이 게시물을 삭제하시겠습니까?")) return;

        try {
        const urlsToDelete = [
            thumbnailUrl,
            videoUrls,
        ].filter(Boolean);

        await deleteFilesFromStorage(urlsToDelete);

        await api.delete(`/api/posts/${postId}/${postType}`, {
            data: { userUuid, commentCount, likeCount, userRole, postAuthorUuid },
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

    return (
        <div className="mobile-highlight-info">
            <h3 className="title">{title}</h3>
            <div className="highlight-author">
                <div
                  className="profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${postAuthorUuid}`);
                  }}
                >
                  {photoUrl ? (
                    <img src={photoUrl} alt="profile" />
                  ) : (
                    <FontAwesomeIcon icon={faUser} className="icon" />
                  )}
                </div>

                <div className="author-info">
                  <p className="nickname">{nickname}</p>
                  <p className="date">{formatDate(date)}</p>
                </div>
              </div>
              {content &&
                <p className="content">{content}</p>
              }
              {tags &&
              <div className="highlight-tags">
                {tags.map((tag, i) => (
                <span key={i} className="tag" onClick={() =>handleTagClick(tag)}>
                    {tag}
                </span>
                ))}
              </div>
              }

              {isAuthor ? (
                    <div className="btn-container">
                        <button onClick={handleEdit} className="edit-btn">
                            <FontAwesomeIcon icon={faPen} /> 수정
                        </button>
                        <button onClick={handleDelete} className="delete-btn">
                            <FontAwesomeIcon icon={faTrash} /> 삭제
                        </button>
                    </div>
                ) : (
                    <div className="btn-container">
                        <ReportButton targetId={postId} targetType={postType} />
                        {userRole === "admin" &&
                            <button onClick={handleDelete} className="delete-btn">
                            <FontAwesomeIcon icon={faTrash} /> 삭제
                            </button>
                        }
                    </div>
                )}
        </div>
    );
};

export default MobileHighlightInfo;