import { useNavigate, useSearchParams  } from "react-router-dom";
import useWindowWidth from "../../components/useWindowWidth";

import "./Topic.css";

const categories = [
  { value: "notify", label: "공지" },
  { value: "free", label: "자유게시판" },
  { value: "workout", label: "헬스" },
  { value: "calisthenics", label: "맨몸운동" },
  { value: "diet", label: "다이어트" },
  { value: "stretching", label: "스트레칭" },
  { value: "nutrition", label: "식단" },
  { value: "rehab", label: "재활" },
];

const Topic = ({ toggleSidebarOpen, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const width = useWindowWidth();
  const isMobile = width < 768;

  const handleNavigate = (path) => {
    navigate(path);
    toggleSidebarOpen();
  };

  if (!isMobile) return (
    <div className="topic-container">
      <button onClick={() => navigate("/community/write")}>글 작성하기</button>

      <ul>
        {categories.map((cat) => (
          <li
            key={cat.value}
            className={currentCategory === cat.value ? "active" : ""}
            onClick={() => navigate(`/community?category=${cat.value}`)}
          >
            {cat.label}
          </li>
        ))}
      </ul>
    </div>
  );

  if (isMobile && isSidebarOpen) return (
      <div className="mobile-topic-container">
        <button onClick={() => handleNavigate("/community/write")}>글 작성하기</button>

        <ul>
          {categories.map((cat) => (
            <li
              key={cat.value}
              className={currentCategory === cat.value ? "active" : ""}
              onClick={() => navigate(`/community?category=${cat.value}`)}
            >
              {cat.label}
            </li>
          ))}
        </ul>
      </div>
  )
};

export default Topic;