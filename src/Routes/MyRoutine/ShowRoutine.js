import React from "react";
import "./ShowRoutine.css";

const ShowRoutine = ({ 
        selectedRoutine,
        showSelectedDay,
        setShowSelectedDay
    }) => {
    return (
        <div className="show-routine">
            <div className="part-table">
                <label>요일별 부위</label>
                    <table>
                    <thead>
                        <tr>
                        <th>월요일</th>
                        <th>화요일</th>
                        <th>수요일</th>
                        <th>목요일</th>
                        <th>금요일</th>
                        <th>토요일</th>
                        <th>일요일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                            <td key={day}>
                            {selectedRoutine?.schedule?.[day]?.length
                                ? selectedRoutine.schedule[day].join(", ")
                                : "-"}
                            </td>
                        ))}
                        </tr>
                    </tbody>
                    </table>
            </div>

            <div className="exercise-list">
                <label>운동 목록</label>

                {/* 요일 선택 */}
                <div className="day-selector">
                {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                    <button
                    key={day}
                    className={`day-btn ${showSelectedDay === day ? "active" : ""}`}
                    onClick={() => setShowSelectedDay(day)}
                    >
                    {day}
                    </button>
                ))}
                </div>

            {/* ✅ 선택된 요일의 블록들 표시 */}
            <div className="routine-day-content">
                {selectedRoutine?.blocks?.[showSelectedDay]?.length > 0 ? (
                <table className="routine-table">
                    <thead>
                    <tr>
                        <th>운동 이름</th>
                        <th>중량(kg)</th>
                        <th>횟수</th>
                        <th>세트</th>
                        <th>휴식(초)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {selectedRoutine.blocks[showSelectedDay].map((block) => (
                        <React.Fragment key={block.instanceId}>
                        {/* ✅ 블럭 이름 한 줄로 표시 */}
                            <td colSpan="5" className="block-title-cell" style={{ textAlign: "start" }}>
                            {block.title || "제목 없는 블럭"}
                            </td>

                        {/* ✅ 블럭 내 운동 목록 */}
                        {block.exercises?.map((ex, idx) => (
                            <tr key={idx}>
                            <td>{ex.exercise}</td>
                            <td>{ex.weight}</td>
                            <td>{ex.reps}</td>
                            <td>{ex.sets}</td>
                            <td>{ex.rest}</td>
                            </tr>
                        ))}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
                ) : (
                <p className="no-data">운동이 없습니다.</p>
                )}
            </div>

            {selectedRoutine?.note &&
            <div className="routine-note">
                <label>메모</label>

                <p>
                {selectedRoutine.note}
                </p>
            </div>
            }
        </div>
    </div>
    );
};

export default ShowRoutine;