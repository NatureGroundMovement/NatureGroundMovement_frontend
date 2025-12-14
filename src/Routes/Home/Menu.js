import { Link } from "react-router-dom";
import "./Menu.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faVideo, faCalendar, faTrophy, faUsers } from "@fortawesome/free-solid-svg-icons";

const Menu = () => {
    return (
        <div className="menu-container">
            <Link to="/diary" className="menu-block">
                <FontAwesomeIcon icon={faBook} className="icon"/>
                <span>운동 일지</span>
            </Link>
            <Link to="/routine" className="menu-block">
                <FontAwesomeIcon icon={faCalendar} className="icon"/>
                <span>운동 루틴</span>
            </Link>
            <Link to="/highlight" className="menu-block">
                <FontAwesomeIcon icon={faVideo} className="icon"/>
                <span>하이라이트</span>
            </Link>
            <Link to="/community" className="menu-block">
                <FontAwesomeIcon icon={faUsers} className="icon"/>
                <span>커뮤니티</span>
            </Link>
            <Link to="/ranking" className="menu-block">
                <FontAwesomeIcon icon={faTrophy} className="icon"/>
                <span>랭킹</span>
            </Link>
        </div>
    );
};

export default Menu;