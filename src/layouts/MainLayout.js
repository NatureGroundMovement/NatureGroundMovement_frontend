import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import useWindowWidth from "../components/useWindowWidth";

const MainLayout = () => {
  const width = useWindowWidth();
  const isMobile = width < 1024; // 1024px 기준

  return (
    <>
      {isMobile ? <MobileNavbar /> : <Navbar />}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
