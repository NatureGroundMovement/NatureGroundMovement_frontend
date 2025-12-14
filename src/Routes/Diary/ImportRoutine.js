import "./ImportRoutine.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";

const ImportRoutine = ({ setImportMode, userUuid, setWorkoutsInputs }) => {
  const [todayWorkouts, setTodayWorkouts] = useState([]); // [{ routineId, title, exercises: [] }]
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useAxios();

  const getToday = () => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[new Date().getDay()];
  };

  useEffect(() => {
    if (!userUuid) return;
    const today = getToday();

    const fetchRoutinesAndBlocks = async () => {
      setLoading(true);
      try {
        // ✅ 1. 루틴 목록 가져오기
        const res = await api.post(
          "/api/myroutine",
          { userUuid },
        );

        const fetchedRoutines = res.data.routines || [];

        // ✅ 2. 각 루틴의 오늘 요일 블록에 해당하는 운동들 병렬로 불러오기
        const allRoutineWorkouts = await Promise.all(
          fetchedRoutines.map(async (routine) => {
            const todayBlocks = routine.blocks?.[today] || [];
            const exercises = [];

            await Promise.all(
              todayBlocks.map(async (blockId) => {
                try {
                  const res = await api.post(
                    "/api/diaries/byId",
                    { blockId },
                  );
                    const block = res.data.block;
                  if (block?.exercises?.length > 0) {
                    exercises.push(...block.exercises);
                  }
                } catch (err) {
                  console.warn("🚨 블록 불러오기 실패:", err);
                }
              })
            );

            return {
              routineId: routine.routineId,
              title: routine.title,
              exercises,
            };
          })
        );

        setTodayWorkouts(allRoutineWorkouts);
        setLoading(false);
      } catch (error) {
        console.error("🚨 루틴 불러오기 실패:", error);
      }
    };

    fetchRoutinesAndBlocks();
  }, [userUuid]);

  // ✅ 선택 완료 버튼
  const handleSelectRoutine = () => {
    if (!selectedRoutine) return alert("루틴을 선택해주세요!");
    const chosen = todayWorkouts.find((r) => r.routineId === selectedRoutine);
    if (!chosen || chosen.exercises.length === 0) return alert("운동이 없습니다.");
    setWorkoutsInputs(chosen.exercises);
    setImportMode(false);
  };

  return (
    <div className="importroutine-container">
      <div className="importroutine-header">
        <h3>{getToday()}요일 루틴</h3>
        <FontAwesomeIcon
          icon={faX}
          className="close-icon"
          onClick={() => setImportMode(false)}
        />
      </div>
        
        <div className="importroutine-list">
          {!loading ? (
            todayWorkouts.length > 0 ? (
              todayWorkouts.map((routine) => (
                <div
                  key={routine.routineId}
                  className={`importroutine-item ${
                    selectedRoutine === routine.routineId ? "selected" : ""
                  }`}
                  onClick={() => setSelectedRoutine(routine.routineId)}
                >
                  <h4>{routine.title}</h4>
                  {routine.exercises.length > 0 ? (
                    <table className="exercise-table">
                      <thead>
                        <tr>
                          <th>운동명</th>
                          <th>무게(kg)</th>
                          <th>세트</th>
                          <th>반복</th>
                          <th>휴식(초)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routine.exercises.map((ex, i) => (
                          <tr key={i}>
                            <td>{ex.exercise}</td>
                            <td>{ex.weight}</td>
                            <td>{ex.sets}</td>
                            <td>{ex.reps}</td>
                            <td>{ex.rest}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="empty-text">오늘은 운동이 없습니다.</p>
                  )}
                </div>
              ))
            ) : (
              <p className="empty-text">불러올 루틴이 없습니다.</p>
            )
          ) : (
            <div style={{ width: "100%" }}>
              <Spinner />
            </div>
          )}
        </div>


        <div className="importroutine-footer">
            <button
            className={selectedRoutine ? "select-btn" : "select-btn disabled"}
            onClick={handleSelectRoutine}
            disabled={!selectedRoutine}
            >
            선택 완료
            </button>
        </div>
    </div>
  );
};

export default ImportRoutine;
