import "./AdminMenu.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import useWindowWidth from "../../components/useWindowWidth";

const menuCategory = [
  { value: "report", label: "신고 관리" },
  { value: "account", label: "계정 관리" },
  { value: "role", label: "역할 관리" },
  { value: "notify", label: "알람 관리" },
  { value: "stats", label: "통계 관리" },
];

const AdminMenu = ({ toggleSidebarOpen, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentMenu = searchParams.get("menu");
    const width = useWindowWidth();
    const isMobile = width < 768;

    if (!isMobile) return (
        <div className="admin-menu">
            <ul>
                {menuCategory.map((m) => (
                <li
                    key={m.value}
                    className={currentMenu== m.value ? "active" : ""}
                    onClick={() => navigate(`/dashboard?menu=${m.value}`)}
                >
                    {m.label}
                </li>
                ))}
            </ul>
        </div>
    );

    if (isMobile && isSidebarOpen) return (
        <div className="mobile-admin-menu">
            <ul>
                {menuCategory.map((m) => (
                <li
                    key={m.value}
                    className={currentMenu== m.value ? "active" : ""}
                    onClick={() => navigate(`/dashboard?menu=${m.value}`)}
                >
                    {m.label}
                </li>
                ))}
            </ul>
        </div>
    )
};

export default AdminMenu;