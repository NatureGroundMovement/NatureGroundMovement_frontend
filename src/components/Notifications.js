import { formatDate } from "./formatDate";
import "../css/Notifications.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import Spinner from "./Spinner";
import { useAxios } from "../contexts/useAxios";
import useWindowWidth from "../components/useWindowWidth";

const getMessageByType = (item) => {
  const { targetType, senderName, postTitle, message } = item;

  const strongName = <strong>{senderName}</strong>;
  const strongTitle = <strong>[{postTitle}]</strong>
  const strongFont = <strong>[공지]</strong>

  switch (targetType) {
    case "routine":
      return <>루틴<br />{strongTitle}</>;

    case "community":
      return <>커뮤니티<br /> {strongTitle}</>;

    case "diary":
      return <>일지<br /> {strongTitle}</>;

    case "highlight":
      return <>하이라이트<br />{strongTitle}</>;

    case "comment":
      return <>{strongName}님이 {strongTitle}에 댓글을 남겼습니다.</>;

    case "follow":
      return <>{strongName}님이 당신을 팔로우하기 시작했습니다.</>;

    case "like":
      return <>{strongName}님이 {strongTitle}에 좋아요를 눌렀습니다.</>;

    case "save":
      return <>{strongName}님이 {strongTitle}을 저장했습니다.</>;

    case "system":
      return <>{strongFont} {message}</>;

    default:
      return <>새로운 알림이 있습니다.</>;
  }
};

const getLinkByType = (item) => {
  const { targetType, targetId, fromUuid, postType } = item;

  switch (targetType) {
    case "routine":
      return `/routine/${targetId}`;

    case "community":
      return `/community/${targetId}`;

    case "diary":
      return `/diary/${targetId}`;

    case "highlight":
      return `/highlight/${targetId}`;

    case "comment":
      return `/${postType}/${targetId}`;

    case "like":
      return `/${postType}/${targetId}`;

    case "follow":
      return `/profile/${fromUuid}`;

    case "save":
      return `/routine/${targetId}`;

    case "system":
      return `/community/${targetId}`;
  };
};

const Notifications = ({ notification, setOpenBell, setNotification, notifyLoading }) => {
    const navigate = useNavigate();
    const api = useAxios();
    const [openMenuId, setOpenMenuId] = useState(null);
    const width = useWindowWidth();
    const isMobile = width < 768;
    const notifyRef = useRef();

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (notifyRef.current && !notifyRef.current.contains(event.target)) {
          setOpenMenuId(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("알림을 삭제할까요?")) return;

        try {
            await api.delete(`/api/notify/delete?id=${id}`);

            // UI에서 제거
            setNotification((prev) => prev.filter((n) => n.id !== id));
            setOpenMenuId(null);
        } catch (err) {
            console.error(err);
            alert("삭제 실패");
        }
    };

    const handleNavigate = (item) => {
      const link = getLinkByType(item);
      if (link) navigate(link);
      if (!isMobile) {
        setOpenBell(false);
      }
    }

    return (
        <div className="notify-dropdown">
            <div className="notify-header">
                <h4>알람</h4>
            </div>

            {notifyLoading ? (
              <Spinner size="40"/>
            ) : (
            <ul className="notify-list">
              {notification.length === 0 ? (
                    <li className="notify-empty">새 알림이 없습니다.</li>
                ) : (
                notification.map((item) => (
                    <li
                      key={item.id}
                      className="notify-item"
                      onClick={() => {
                          handleNavigate(item)
                      }}
                    >
                    {item.targetType !== "system" &&
                    <div className="profile">
                        {item?.senderPhoto ? (
                        <img src={item?.senderPhoto} alt="picture" />
                        ) : (
                        <FontAwesomeIcon icon={faUser} className="icon" />
                        )}
                    </div>
                    }

                    <div style={{ flex: "1" }}>
                        <div className="notify-text">{getMessageByType(item)}</div>
                        <span className="notify-date">{formatDate(item.createdAt)}</span>
                    </div>

                    {/* 옵션 버튼 */}
                    <button
                        className="more-btn"
                        onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === item.id ? null : item.id);
                        }}
                    >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </button>

                    {/* 🔥 옵션 메뉴 */}
                    {openMenuId === item.id && (
                        <button
                            className="delete-btn"
                            ref={notifyRef}
                            onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                            }}
                        >
                            알람 삭제
                        </button>
                    )}
                    </li>
                ))
                )}
            </ul>
          )}
        </div>
    );
};

export default Notifications