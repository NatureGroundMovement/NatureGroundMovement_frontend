import "./AddAdmin.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";

const AddAdmin = ({ setAddMode }) => {
    const { userUuid } = useAuth();
    const api = useAxios();

    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔥 디바운스 검색
    useEffect(() => {
        if (!keyword.trim()) {
            setResults([]);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                setResults([]);
                setLoading(true);
                const res = await api.get(
                    `/api/admin/search-users?keyword=${keyword}`
                );
                setResults(res.data.users);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [keyword]);

    const toggleSelect = (user) => {
        const exists = selectedUsers.find((u) => u.userUuid === user.userUuid);

        if (exists) {
            // 선택 취소
            setSelectedUsers((prev) =>
                prev.filter((u) => u.userUuid !== user.userUuid)
            );
        } else {
            // 추가
            setSelectedUsers((prev) => [...prev, user]);
        }
    };

    // 🔥 관리자 권한 부여
    const addAdmins = async () => {
        if (selectedUsers.length === 0) return alert("선택된 유저가 없음");

        try {
            await api.post(
                "/api/admin/add-admin",
                {
                    uuid: selectedUsers.map((u) => u.uuid), userUuid
                },
            );

            alert("관리자 권한 부여 완료!");
            setAddMode(false);
        } catch (err) {
            console.error("관리자 추가 실패:", err);
        }
    };

    return (
        <div className="admin-add-container">
            <div className="admin-header">
                <h3>관리자 추가하기</h3>
                <button onClick={() => setAddMode(false)}>
                    <FontAwesomeIcon icon={faX} />
                </button>
            </div>

            <div className="admin-body">
                <input
                    className="search-input"
                    placeholder="닉네임 검색..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />

                {loading && <Spinner size="40"/>}

                <div className="search-results">
                    {results.map((user) => {
                        const isSelected = selectedUsers.some(
                            (u) => u.uuid === user.uuid
                        );

                        return (
                            <div
                                key={user.uuid}
                                className={`user-item ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleSelect(user)}
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
                                <p>{user.role}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="admin-footer">
                <button className="submit-btn" onClick={addAdmins}>
                    추가
                </button>
            </div>
        </div>
    );
};

export default AddAdmin;
