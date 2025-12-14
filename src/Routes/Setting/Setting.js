import "./Setting.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SettingMenu from "./SettingMenu";
import PostSetting from "./PostSetting";
import AccountSetting from "./AccountSetting";
import useWindowWidth from "../../components/useWindowWidth";

const menuCategory = [
  { value: "account", label: "계정 관리" },
  { value: "post", label: "게시물 관리" },
];

const Setting = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const width = useWindowWidth();
    const isMobile = width < 1024;
    const menu = searchParams.get("menu");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebarOpen = () => {
      setIsSidebarOpen((prev) => !prev);
    };

    const currentMenuLabel =
      menuCategory.find((m) => m.value === menu)?.label;

    useEffect(() => {
      if (!menu) {
        navigate("/setting?menu=account", { replace: true });
      }
    }, [menu, navigate]);

    const renderPage = () => {
      if (menu === "account") {
          return <AccountSetting currentMenuLabel={currentMenuLabel} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
      if (menu === "post") {
          return <PostSetting currentMenuLabel={currentMenuLabel} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
    };

    return (
        <div className="setting-container">
          {isMobile && (
            <div
              className={`mobile-overlay ${isSidebarOpen ? "show" : ""}`}
              onClick={toggleSidebarOpen}
            >
              {/* 슬라이드 패널 */}
              <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
                <h3>설정</h3>
                <SettingMenu toggleSidebarOpen={toggleSidebarOpen} isSidebarOpen={isSidebarOpen} />
              </div>
            </div>
          )}

          {!isMobile &&
          <div className="setting-container-menu">
            <SettingMenu />
          </div>
          }

          <div>
            {renderPage()}
          </div>
        </div>
    );
};

export default Setting;