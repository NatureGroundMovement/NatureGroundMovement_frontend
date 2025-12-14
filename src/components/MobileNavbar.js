import { faBell, faHouse, faUser } from "@fortawesome/free-regular-svg-icons";
import { faBook, faCalendar, faCirclePlus, faMagnifyingGlass, faUsers, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../contexts/AuthProvider";
import { useProfile } from "../contexts/ProfileProvider";
import "../css/MobileNavbar.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const MobileNavbar = () => {
    const { isLoggedIn, userUuid } = useAuth();
    const { profile } = useProfile();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleToggle = () => {
        setOpen((prev) => !prev)
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="mobile-navbar">
            <div className="header">
                <h1 onClick={() => navigate("/")}>A-Routine</h1>
            </div>

            <div className="footer">
                <div onClick={() => navigate("/")}>
                    <FontAwesomeIcon icon={faHouse} />
                </div>
                <div onClick={() => navigate("/search")}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                </div>
                <div style={{ position: "relative" }}>
                    <FontAwesomeIcon icon={faCirclePlus} onClick={handleToggle}/>
                    {open &&
                        <div className="upload-dropdown" ref={dropdownRef}>
                            <ul>
                                <li onClick={() => {navigate("/diary/write");setOpen(false)}}><FontAwesomeIcon icon={faBook} /><span>일지</span></li>
                                <li onClick={() => {navigate("/routine/write");setOpen(false)}}><FontAwesomeIcon icon={faCalendar} /><span>루틴</span></li>
                                <li onClick={() => {navigate("/highlight/write");setOpen(false)}}><FontAwesomeIcon icon={faVideo} /><span>하이라이트</span></li>
                                <li onClick={() => {navigate("/community/write");setOpen(false)}}><FontAwesomeIcon icon={faUsers} /><span>커뮤니티</span></li>
                            </ul>
                        </div>
                    }
                </div>
                <div onClick={() => navigate("/notify")}>
                    <FontAwesomeIcon icon={faBell} />
                </div>
                <div onClick={() => navigate(isLoggedIn ? `/profile/${userUuid}` : "/login")}>
                    <div className="profile">
                        {profile?.photoUrl ? (
                            <img src={profile?.photoUrl} alt="picture" />
                        ) : (
                            <FontAwesomeIcon icon={faUser} className="icon" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileNavbar;