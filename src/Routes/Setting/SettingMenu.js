import "./SettingMenu.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import useWindowWidth from "../../components/useWindowWidth";

const menuCategory = [
  { value: "account", label: "계정 관리" },
  { value: "post", label: "게시물 관리" },
];

const SettingMenu = ({ toggleSidebarOpen, isSidebarOpen }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentMenu = searchParams.get("menu");
    const width = useWindowWidth();
    const isMobile = width < 1024;

    if (!isMobile) return (
        <div className="setting-menu">
            <ul>
                {menuCategory.map((m) => (
                <li
                    key={m.value}
                    className={currentMenu== m.value ? "active" : ""}
                    onClick={() => navigate(`/setting?menu=${m.value}`)}
                >
                    {m.label}
                </li>
                ))}
            </ul>
        </div>
    );

    if (isMobile && isSidebarOpen) return (
        <div className="mobile-setting-menu">
            <ul>
                {menuCategory.map((m) => (
                <li
                    key={m.value}
                    className={currentMenu== m.value ? "active" : ""}
                    onClick={() => navigate(`/setting?menu=${m.value}`)}
                >
                    {m.label}
                </li>
                ))}
            </ul>
        </div>
    )
};

export default SettingMenu;