import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import "../css/ProfileList.css";
import Spinner from "../components/Spinner";

const ProfileList = ({ profiles, loading, searchLoading }) => {
    const navigate = useNavigate();

    if (loading || searchLoading) return <Spinner />;

    return (
        <ul className="profile-list">
        {profiles.length > 0 ? (
          profiles.map((p) => 
          <li key={p.uuid} onClick={() => navigate(`/profile/${p.uuid}`)}>
            <div>
              <div className="profile">
                  {p?.photoUrl ? (
                      <img src={p?.photoUrl} alt="picture" />
                  ) : (
                      <FontAwesomeIcon icon={faUser} className="icon" />
                  )}
              </div>
              <p>{p.nickname}</p>
            </div>
            <p>팔로워: {p.follower || 0}명</p>
          </li>
        )
        ) : (
          <p className="no-post">프로필이 없습니다 😴</p>
        )}
      </ul>
    );
};

export default ProfileList;