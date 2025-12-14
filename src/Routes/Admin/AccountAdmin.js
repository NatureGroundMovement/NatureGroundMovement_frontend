import { useEffect, useState } from "react";
import "./AccountAdmin.css";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const AccountAdmin = ({ currentMenuLabel, isMobile, toggleSidebarOpen }) => {
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const api = useAxios();

    // 🔹 사용자 검색
    useEffect(() => {
        if (!keyword.trim()) {
            setUsers([]);
            return;
        }

        const delay = setTimeout(async () => {
            try {
                setIsLoading(true);
                setUsers([]);
                const res = await api.get(
                    `/api/admin/search-users?keyword=${keyword}`,
                );
                setUsers(res.data.users);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(delay);
    }, [keyword]);

    // 🔹 계정 정지/해제 토글
    const toggleBan = async (e, uuid) => {
        e.stopPropagation();

        try {
            await api.post(
                "/api/admin/toggle-ban",
                { uuid },
            );

            // UI 업데이트
            setUsers((prev) =>
                prev.map((u) =>
                    u.uuid === uuid
                        ? { ...u, status: u.status === "banned" ? "active" : "banned" }
                        : u
                )
            );
        } catch (err) {
            console.error("정지 토글 실패:", err);
        }
    };

    return (
        <div className="account-admin">
            <div className="admin-header">
                {isMobile &&
                <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
                }
                <h2>{currentMenuLabel}</h2>
            </div>
            {/* 🔍 검색 UI */}
            <input
                type="text"
                placeholder="닉네임 검색..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="search-input"
            />

            <table className="account-table">
                <thead>
                    <tr>
                        <th>닉네임</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>관리</th>
                    </tr>
                </thead>
                <tbody>
                        {users.map((user) => (
                            <tr key={user.uuid} onClick={() => navigate(`/profile/${user.uuid}`)}>
                                <td>{user.nickname}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span
                                        className={
                                            user.status === "banned"
                                                ? "status-banned"
                                                : "status-active"
                                        }
                                    >
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={
                                            user.status === "banned"
                                                ? "btn-unban"
                                                : "btn-ban"
                                        }
                                        onClick={(e) => toggleBan(e, user.uuid)}
                                    >
                                        {user.status === "banned"
                                            ? "해제"
                                            : "정지"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            {(users.length === 0 && !isLoading) && <p className="no-user">유저 없음</p>}
            {isLoading && <Spinner />}
        </div>
    );
};

export default AccountAdmin;
