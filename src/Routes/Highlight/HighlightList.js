import { useNavigate } from "react-router-dom";
import "./HighlightList.css";
import Spinner from "../../components/Spinner";
import { faComment, faHeart, faEye } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const HighlightList = ({ highlights, loading, searchLoading, postLoading }) => {
  const navigate = useNavigate();

  if (loading || searchLoading || postLoading) return <Spinner />;

  if (highlights?.length === 0) {
    return <p className="no-highlight">게시된 하이라이트가 없습니다 😴</p>;
  }

  return (
    <div className="highlight-list">
      {highlights?.map((item) => (
        <div
          key={item.postId}
          className="highlight-card"
          onClick={() =>
            navigate(`/highlight/${item.postId}`, { state: { highlights } })
          }
        >
          <div className="thumbnail-wrapper">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="thumbnail"
            />
            <video
              src={item.videoUrl}
              muted
              playsInline
              preload="metadata"
              className="preview-video"
              onLoadedMetadata={(e) => {
                e.currentTarget.currentTime = 0;
              }}
              onMouseEnter={(e) => {
                const video = e.currentTarget;
                setTimeout(() => video.play().catch(() => {}), 200);
                video.previewTimeout = setTimeout(() => {
                  video.pause();
                  video.currentTime = 0;
                }, 2000);
              }}
              onMouseLeave={(e) => {
                const video = e.currentTarget;
                clearTimeout(video.previewTimeout);
                video.pause();
                video.currentTime = 0;
              }}
            />
          </div>

          <div className="highlight-info">
            <h3 className="highlight-title">{item.title}</h3>
            <p className="highlight-stats">
              <span><FontAwesomeIcon icon={faEye}/> {item.viewCount || 0} </span>
              <span><FontAwesomeIcon icon={faHeart}/> {item.likeCount || 0} </span>
              <span><FontAwesomeIcon icon={faComment}/> {item.commentCount || 0}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HighlightList;