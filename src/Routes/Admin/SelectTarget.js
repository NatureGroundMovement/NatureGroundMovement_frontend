import { useState, useEffect } from "react";
import "./SelectTarget.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { useAxios } from "../../contexts/useAxios";

const SelectTarget = ({ onClose, onSelect, targets }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const api = useAxios();

  useEffect(() => {
    if (Array.isArray(targets)) {
      setSelected(targets);
    }
  }, [targets]);

  const fetchSelectedUsers = async (uuids) => {
    if (!uuids.length) {
      setSelectedUsers([]);
      return;
    }

    try {
      const res = await api.post(
        `/api/admin/search-users/by-uuid`,
        { uuids },
      );
      setSelectedUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch selected users", err);
    }
  };

  useEffect(() => {
    fetchSelectedUsers(selected);
  }, [selected]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/admin/search-users?keyword=${search}`
        );
        setResults(res.data.users);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  /* -----------------------------------------------
   🔥 유저 선택/해제
  ------------------------------------------------ */
  const toggleSelect = (uuid) => {
    setSelected((prev) =>
      prev.includes(uuid)
        ? prev.filter((id) => id !== uuid)
        : [...prev, uuid]
    );
  };

  /* -----------------------------------------------
   🔥 표시할 목록 결정
  ------------------------------------------------ */
  const displayList = search.trim() ? results : selectedUsers;

  return (
      <div className="select-target">
        <div className="select-header">
            <h3>알람 대상 선택</h3>
        </div>

        <div className="select-body">
            <div className="search-row">
            <input
                type="text"
                placeholder="닉네임 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>

            

            <div className="result-list">
            {displayList.map((user) => (
                <div
                key={user.uuid}
                className={`user-item ${
                    selected.includes(user.uuid) ? "selected" : ""
                }`}
                onClick={() => toggleSelect(user.uuid)}
                >
                    <div className="user-info">
                        <div className="profile">
                            {user?.photoUrl ? (
                                <img src={user?.photoUrl} alt="picture" />
                            ) : (
                                <FontAwesomeIcon icon={faUser} className="icon" />
                            )}
                        </div>
                        <p>{user.nickname}</p>
                    </div>
                    <p>{user.email}</p>
                </div>
            ))}

            {displayList.length === 0 && !loading && (
                <p className="empty">선택된 유저 없음</p>
            )}
            </div>
        </div>

        <div className="select-footer">
            <button className="all-btn" onClick={() => onSelect("all")}>
                전체 발송
            </button>

            <div>
                <button onClick={() => onSelect(selected)}>적용</button>
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
      </div>
  );
};

export default SelectTarget;
