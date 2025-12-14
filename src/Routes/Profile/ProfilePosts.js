import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import "./ProfilePosts.css";
import "./ProfileCalendar.css";
import DiaryList from "../Diary/DiaryList";
import RoutineList from "../Routine/RoutineList";
import HighlightList from "../Highlight/HighlightList";
import PostList from "../Community/PostList";
import { useState, useMemo } from "react";
import Calendar from "react-calendar"
import ShowRoutine from "../MyRoutine/ShowRoutine";
import useWindowWidth from "../../components/useWindowWidth";

const formatDate = (d) => {
  const yyyy = d.getFullYear();
  const mm = ("0" + (d.getMonth() + 1)).slice(-2);
  const dd = ("0" + d.getDate()).slice(-2);
  return `${yyyy}-${mm}-${dd}`;
};

const sortOptions = [
    { label: "최신순", value: "latest" },
    { label: "인기순", value: "popular" },
    { label: "조회순", value: "views" },
];

const ProfilePosts = ({ 
    type, 
    handleTypeClick, 
    list, 
    postLoading, 
    setSort, 
    sort,
    routine,
    showSelectedDay,
    setShowSelectedDay,
    isPublic
    }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const width = useWindowWidth();
    const isMobile = width < 768;

    const filteredDiary = useMemo(() => {
        if (!selectedDate || type !== "diary") return list;

        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const d = String(selectedDate.getDate()).padStart(2, "0");
        const formatted = `${y}-${m}-${d}`;

        return list.filter((diary) => diary?.date?.startsWith(formatted));

    }, [selectedDate, list, type]);

    const allDiaryDates = useMemo(() => {
        return list.map(d => formatDate(new Date(d.createdAt))); // YYYY.MM.DD
    }, [list]);

    return (
        <div className="profile-posts">
            <div className="header">
                <div className="menu-tabs">
                    <button 
                        onClick={() => handleTypeClick("myroutine")}
                        className={`${type === "myroutine" ? "active" : ""}`}
                    >
                        마이루틴
                    </button>
                    <button 
                        onClick={() => handleTypeClick("diary")}
                        className={`${type === "diary" ? "active" : ""}`}
                    >
                        {isMobile ? "일지" : "운동일지"}
                    </button>
                    <button 
                        onClick={() => handleTypeClick("routine")}
                        className={`${type === "routine" ? "active" : ""}`}
                    >
                        {isMobile ? "루틴" : "운동루틴"}
                    </button>
                    <button 
                        onClick={() => handleTypeClick("highlight")}
                        className={`${type === "highlight" ? "active" : ""}`}
                    >
                        하이라이트
                    </button>
                    <button 
                        onClick={() => handleTypeClick("community")}
                        className={`${type === "community" ? "active" : ""}`}
                    >
                        커뮤니티
                    </button>
                </div>

                <div className="sort">
                    {type !== "diary" && type !== "myroutine" &&
                        <SingleSelectDropdown
                            options={sortOptions}
                            value={sort}
                            onChange={setSort}
                            label="정렬"
                        />
                    }
                </div>
            </div>

            <ProfilePostList 
                type={type} 
                list={list} 
                postLoading={postLoading} 
                selectedDate={selectedDate} 
                setSelectedDate={setSelectedDate} 
                filteredDiary={filteredDiary}
                allDiaryDates={allDiaryDates}
                routine={routine}
                showSelectedDay={showSelectedDay}
                setShowSelectedDay={setShowSelectedDay}
                isPublic={isPublic}
            />
        </div>
    );
};

const ProfilePostList = ({ type, list, postLoading, selectedDate, setSelectedDate, filteredDiary, allDiaryDates, routine, showSelectedDay, setShowSelectedDay, isPublic }) => {
  if (type === "myroutine") return <ShowRoutine selectedRoutine={routine} showSelectedDay={showSelectedDay} setShowSelectedDay={setShowSelectedDay}  />;
  if (type === "diary")
    return (
      <div className="my-diary">
        {isPublic ? (
        <>
            <div className="profile-calendar-wrap">
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    className="profile-calendar"
                    tileClassName={({ date, view }) => {
                        if (view === "month") {
                        const dateStr = formatDate(date); // YYYY.MM.DD

                        const hasDiary = allDiaryDates.includes(dateStr);

                        return hasDiary ? "has-diary" : null;
                        }
                    }}
                
                />
            </div>

            <DiaryList
            todayDiaries={filteredDiary}
            isLoading={false}
            isMyLoading={false}
            postLoading={postLoading}
            selectedDate={selectedDate}
            />
        </>
        ) : (
            <p className="no-public">일지가 비공개되어 있습니다</p>
        )
        }
      </div>
    );
  if (type === "routine") return <RoutineList routines={list} isLoading={false} postLoading={postLoading} />;
  if (type === "highlight") return <HighlightList highlights={list}postLoading={postLoading}  />;
  if (type === "community") return <PostList posts={list}postLoading={postLoading}  />;
  return null;
};

export default ProfilePosts