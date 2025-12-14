import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import "./SaveRoutine.css";
import { useAuth } from "../../contexts/AuthProvider";
import { useAxios } from "../../contexts/useAxios";

const SaveRoutine = ({ setSaveMode, routineType, defaultTitle = "", dayBlockId, weekBlockIds, postId, postAuthorUuid }) => {
  const { userUuid } = useAuth();
  const api = useAxios();
  const [step, setStep] = useState(1); // 1: 옵션 선택, 2: 제목/저장
  const [title, setTitle] = useState(defaultTitle);
  const [selectedDay, setSelectedDay] = useState("");
  const [isAll, setIsAll] = useState(false);
  const [myRoutines, setMyRoutines] = useState([]); // 내 루틴 3개
  const [selectedSlot, setSelectedSlot] = useState(null); // 전체 저장 시 선택한 루틴 슬롯

  const days = ["월", "화", "수", "목", "금", "토", "일"];

  // ✅ 전체 저장일 때 내 루틴 3개 불러오기
  useEffect(() => {
    if (isAll && userUuid) {
      const fetchMyRoutines = async () => {
        try {
          const res = await api.post(
            "/api/myroutine",
            { userUuid },
          );
          setMyRoutines(res.data.routines || []);
        } catch (err) {
          console.error("❌ 루틴 목록 불러오기 실패:", err);
        }
      };
      fetchMyRoutines();
    }
  }, [isAll, userUuid]);

  // ✅ 옵션 선택
  const handleOptionSelect = (type, day) => {
    if (type === "all") {
      setIsAll(true);
      setSelectedDay("");
    } else {
      setIsAll(false);
      setSelectedDay(day);
    }
    setStep(2);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      // ✅ 1️⃣ 하루 루틴 저장
      if (routineType === "day") {
        await api.post(
          "/api/blocks/saveblock",
          {
            title,
            postId,
            userUuid,
            creatorUuid: postAuthorUuid,
            isSave: true,
            dayBlockId,
          },
        );

        alert("하루 루틴이 블록으로 저장되었습니다!");
        setSaveMode(false);
        return;
      }

      // ✅ 주간 루틴 - 특정 요일만 저장
      if (!isAll && selectedDay) {
        let dayBlockIdForSave = weekBlockIds[selectedDay]; // 선택된 요일의 블록 배열
        
        if (Array.isArray(dayBlockIdForSave)) {
          dayBlockIdForSave = dayBlockIdForSave[0];
        }
        await api.post(
          "/api/blocks/saveblock",
          {
            title,
            postId,
            userUuid,
            creatorUuid: postAuthorUuid,
            isSave: true,
            dayBlockId: dayBlockIdForSave, // 선택된 요일만 담기
          },
        );

        alert(`${selectedDay} 루틴이 블록으로 저장되었습니다!`);
        setSaveMode(false);
        return;
      }

      // ✅ 3️⃣ 주간 루틴 전체 저장
      if (isAll) {
        if (selectedSlot === null) {
          alert("저장할 루틴 슬롯을 선택해주세요.");
          return;
        }

        const targetRoutine = myRoutines[selectedSlot];
        if (!targetRoutine) {
          alert("유효한 루틴이 없습니다.");
          return;
        }

        // routine 객체 안에 dayBlockId / weekBlockIds 모두 포함되어 있다고 가정
        await api.put(
          `/api/myroutine/${targetRoutine.routineId}/overwrite`,
          {
            weekBlockIds, // dayBlockId / weekBlockIds
            postId,
            title,
            userUuid,
          },
        );

        alert(`"${title}" 루틴이 덮어쓰기 저장되었습니다.`);
        setSaveMode(false);
        return;
      }
      
    } catch (error) {
      console.error("🚨 루틴 저장 실패:", error);
      alert("루틴 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="saveroutine-container">
      <div className="saveroutine-header">
        <h3>루틴 저장하기</h3>
        <FontAwesomeIcon
          icon={faX}
          onClick={() => setSaveMode(false)}
          className="close-icon"
        />
      </div>

      <div className="saveroutine-body">
        {/* Step 1️⃣: 옵션 선택 */}
        {routineType === "week" && step === 1 && (
          <div className="save-option-step">
            <p>저장 방식을 선택하세요</p>
            <div className="option-buttons">
              <button className="all-btn" onClick={() => handleOptionSelect("all")}>
                전체 저장
              </button>
              <span>or</span>
              <div className="day-buttons">
                {days.map((day) => (
                  <button key={day} onClick={() => handleOptionSelect("day", day)}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2️⃣: 제목 및 선택 UI */}
        {((routineType === "week" && step === 2) || routineType === "day") && (
          <div className="save-input-step">
            {isAll && myRoutines.length > 0 && (
              <div className="routine-slot-selector">
                <p>저장할 루틴 선택</p>
                <div className="routine-slots">
                  {myRoutines.map((r, i) => (
                    <button
                      key={r._id || i}
                      className={selectedSlot === i ? "selected" : ""}
                      onClick={() => setSelectedSlot(i)}
                    >
                      {r.title || `루틴 ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="title-input">
              <label>루틴 제목 :</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="루틴 제목을 입력하세요"
              />
            </div>
          </div>
        )}
      </div>

      <div className="saveroutine-footer">
        {/* ✅ 항상 저장 버튼 표시 */}
        {step === 2 || routineType === "day" ? (
            <button onClick={handleSave}>저장</button>
        ) : (
            <button onClick={() => setSaveMode(false)}>취소</button>
        )}
      </div>
    </div>
  );
};

export default SaveRoutine;
