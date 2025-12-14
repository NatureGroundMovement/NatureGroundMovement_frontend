import { useNavigate } from "react-router-dom";
import { formatDate } from "../../components/formatDate";
import "./PostList.css";
import Spinner from "../../components/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faEye, faHeart } from "@fortawesome/free-regular-svg-icons";

const PostList = ({ posts, loading, searchLoading, postLoading }) => {
  const navigate = useNavigate();

  if (loading || searchLoading || postLoading) return <Spinner />;

  return (
      <ul className="post-list">
        {posts?.length > 0 ? (
          posts.map((p) => 
          <li key={p.postId} onClick={() => navigate(`/community/${p.postId}`)}>
            <div>
                <h3 className="post-title">{p.title}</h3>
                <div className="post-tags">
                    {p?.tags?.slice(0, 4).map((tag, i) => (
                    <span key={i} className="tag">
                        {tag}
                    </span>
                    ))}
                </div>
            </div>
            <div>
                <div className="post-reactions">
                    <span><FontAwesomeIcon icon={faEye}/> {p.viewCount}</span> 
                    <span><FontAwesomeIcon icon={faHeart}/> {p.likeCount}</span> 
                    <span><FontAwesomeIcon icon={faComment}/> {p.commentCount}</span>
                </div>
                <p className="post-date">{formatDate(p.createdAt)}</p>
            </div>
          </li>
        )
        ) : (
          <p className="no-post">게시된 글이 없습니다 😴</p>
        )}
      </ul>
  );
};

export default PostList;
