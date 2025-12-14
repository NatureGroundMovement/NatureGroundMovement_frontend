import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import "./RoleAdmin.css";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import AddAdmin from "./AddAdmin";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";
import { faBars } from "@fortawesome/free-solid-svg-icons";


const RoleAdmin = ({ currentMenuLabel, isMobile, toggleSidebarOpen }) => {
    const { userUuid } = useAuth();
    const api = useAxios();
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [addMode, setAddMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                setIsLoading(true);
                const res = await api.get("/api/admin/admin-list");
                setAdmins(res.data.admins);
            } catch (err) {
                console.error("관리자 리스트 불러오기 실패:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    const removeAdmin = async (uuid) => {
        try {
            if (!window.confirm("정말 관리자 권한을 제거하시겠습니까?")) return;

            await api.post(
                "/api/admin/remove-admin",
                { uuid, userUuid },
            );

            alert("관리자 권한이 제거되었습니다.");

            // UI에서 제거
            setAdmins(prev => prev.filter(user => user.uuid !== uuid));

        } catch (err) {
            console.error("관리자 권한 제거 실패:", err);
            alert("삭제 실패");
        }
    };

    return (
        <div className="role-admin">
            <div className="admin-header">
                {isMobile &&
                <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
                }
                <h2>{currentMenuLabel}</h2>
            </div>
            
            <div className="admin-list">
                <h3>관리자 리스트</h3>
                <ul>
                {isLoading ? (
                    <Spinner />
                ) : (
                    admins.map((a) => (
                        <li
                            key={a.uuid}
                            onClick={() => navigate(`/profile/${a.uuid}`)}
                        >
                            <div className="user-info">
                                <div className="profile">
                                    {a?.photoUrl ? (
                                        <img src={a?.photoUrl} alt="picture" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className="icon" />
                                    )}
                                </div>
                                <p>{a.nickname}</p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeAdmin(a.uuid);
                                }}
                                className="delete-btn"
                            >
                                권한 제거
                            </button>
                        </li>
                    ))
                )}
                </ul>
            </div>
            
            <div className="add-admin">
                <h3>관리자 추가</h3>
                <button onClick={() => setAddMode(true)} className="add-btn">+ 관리자 추가하기</button>
                {addMode && (
                    <div className="overlay">
                        <AddAdmin setAddMode={setAddMode} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleAdmin;