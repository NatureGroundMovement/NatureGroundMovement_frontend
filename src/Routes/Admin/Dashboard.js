import AdminMenu from "./AdminMenu";
import "./Dashboard.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ReportAdmin from "./ReportAdmin";
import { useAuth } from "../../contexts/AuthProvider";
import RoleAdmin from "./RoleAdmin";
import AccountAdmin from "./AccountAdmin";
import NotifyAdmin from "./NotifyAdmin";
import StatsAdmin from "./StatsAdmin";
import useWindowWidth from "../../components/useWindowWidth";

const menuCategory = [
  { value: "report", label: "신고 관리" },
  { value: "account", label: "계정 관리" },
  { value: "role", label: "역할 관리" },
  { value: "notify", label: "알람 관리" },
  { value: "stats", label: "통계 관리" },
];

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const { userRole, userUuid } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const menu = searchParams.get("menu");
    const width = useWindowWidth();
    const isMobile = width < 1024;

    const currentMenuLabel =
      menuCategory.find((m) => m.value === menu)?.label;

    const toggleSidebarOpen = () => {
      setIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        if (userRole !== "admin") return;
    }, [userUuid])

    useEffect(() => {
      if (!menu) {
        navigate("/dashboard?menu=report", { replace: true });
      }
    }, [menu, navigate]);

    const renderPage = () => {
      if (menu === "report") {
          return <ReportAdmin currentMenuLabel={currentMenuLabel} isMobile={isMobile} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
      if (menu === "account") {
          return <AccountAdmin currentMenuLabel={currentMenuLabel} isMobile={isMobile} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
      if (menu === "role") {
          return <RoleAdmin currentMenuLabel={currentMenuLabel} isMobile={isMobile} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
      if (menu === "notify") {
          return <NotifyAdmin currentMenuLabel={currentMenuLabel} isMobile={isMobile} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
      if (menu === "stats") {
          return <StatsAdmin currentMenuLabel={currentMenuLabel} isMobile={isMobile} toggleSidebarOpen={toggleSidebarOpen}/>;
      }
    };
    return (
        <div className="dashboard-container">
          {isMobile && (
            <div
              className={`mobile-overlay ${isSidebarOpen ? "show" : ""}`}
              onClick={toggleSidebarOpen}
            >
              {/* 슬라이드 패널 */}
              <div className={`mobile-sidebar ${isSidebarOpen ? "open" : ""}`}>
                <h3>관리자 페이지</h3>
                <AdminMenu toggleSidebarOpen={toggleSidebarOpen} isSidebarOpen={isSidebarOpen} />
              </div>
            </div>
          )}

          {!isMobile &&
          <div className="dashboard-admin-menu">
            <AdminMenu />
          </div>
          }

          <div className="dashboard-renderPage">
            {renderPage()}
          </div>
        </div>
    );
};

export default Dashboard;