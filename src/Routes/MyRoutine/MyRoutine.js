import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./MyRoutine.css";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { useAuth } from "../../contexts/AuthProvider";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import EditMyRoutine from "./EditMyRoutine";
import ShowRoutine from "./ShowRoutine";
import Spinner from "../../components/Spinner";
import { useAxios } from "../../contexts/useAxios";

const MyRoutine = () => {
  const { userUuid } = useAuth();
  const [routines, setRoutines] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [editRoutine, setEditRoutine] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [blocks, setBlocks] = useState([]);
  const [filter, setFilter] = useState("all");
  const filterOptions = [
      { value: "all", label: "모두" },
      { value: "my", label: "내 블럭" },
      { value: "others", label: "저장한 블럭" },
  ];
  const [selectedDay, setSelectedDay] = useState("월");
  const [showSelectedDay, setShowSelectedDay] = useState("월");
  const [isLoading, setIsLoading] = useState(true);
  const api = useAxios();

  useEffect(() => {
    const fetchBlocks = async () => {
      if (!userUuid) return;

      try {
        const res = await api.get("/api/blocks", {
          params: {
            userUuid,
            filter,
          },
        });

          setBlocks(res.data.blocks);
      } catch (error) {
        console.error("블럭 불러오기 실패:", error);
      }
    };

    fetchBlocks();
  }, [userUuid, filter]);

  const fetchRoutines = async () => {
    if (!userUuid) return;

    try {
      setIsLoading(true);
      // 1️⃣ 루틴 불러오기
      const res = await api.post(
        "/api/myroutine",
        { userUuid },
      );

      const routines = res.data.routines;

      // 2️⃣ 모든 blockId 수집
      const allBlockIds = [
        ...new Set(
          routines.flatMap(r => Object.values(r.blocks || {}).flat())
        ),
      ];

      if (!allBlockIds.length) {
        setRoutines(routines);
        const mainRoutine = routines.find(r => r.isMain) || routines[0] || null;
        setSelectedRoutine(mainRoutine);
        setIsLoading(false);
        return;
      }

      // 3️⃣ blockId로 실제 block 데이터 가져오기
      const blockRes = await api.get(
        `/api/myroutine/blocks?ids=${allBlockIds.join(",")}`
      );

      const blockMap = Object.fromEntries(
        blockRes.data.blocks.map(b => [b.copyId, b])
      );

      // 4️⃣ 루틴 데이터 가공
      const hydratedRoutines = routines.map(r => {
        const dayBlocks = Object.fromEntries(
          Object.entries(r.blocks || {}).map(([day, blockRefs]) => [
            day,
            blockRefs
              .map(ref => {
                const blockData = blockMap[ref];
                if (!blockData) return null;
                return {
                  ...blockData,
                  blockId: ref,
                  instanceId: uuidv4(),
                };
              })
              .filter(Boolean),
          ])
        );

        return {
          ...r,
          blocks: dayBlocks,
        };
      });

      setRoutines(hydratedRoutines);

      // ✅ isMain인 루틴 우선 선택
      const mainRoutine = hydratedRoutines.find(r => r.isMain) || hydratedRoutines[0] || null;
      setSelectedRoutine(mainRoutine);
      setIsLoading(false);
    } catch (error) {
      console.error("🚨 루틴 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, [userUuid, filter]);

  // 🔹 루틴 저장
  const handleSaveRoutine = async () => {
    try {
      if (!selectedRoutine?.title) {
        alert("루틴 이름을 입력해주세요!");
        return;
      }

      // ✅ 요일별 blockId만 추출해서 DB에 저장할 형태로 변환
      const dayKeys = ["월", "화", "수", "목", "금", "토", "일"];
      const formattedBlocks = {};

      dayKeys.forEach((day) => {
        formattedBlocks[day] =
          selectedRoutine.blocks?.[day]?.map((b) => b.blockId) || [];
      });

      const payload = {
        userUuid,
        title: selectedRoutine.title,
        schedule: selectedRoutine.schedule || {},
        blocks: formattedBlocks, // ✅ blockId만 저장
        note: selectedRoutine.note || "",
      };

      const res = await api.put(
        `/api/myroutine/${selectedRoutine.routineId}`, payload);

      if (res.status === 200) {
        alert("💾 루틴이 성공적으로 저장되었습니다!");
        await fetchRoutines(); // 최신화
        setEditRoutine(false);
      }
    } catch (error) {
      console.error("🚨 루틴 저장 실패:", error);
      alert(error.response?.data?.message || "루틴 저장 중 오류가 발생했습니다.");
    }
  };

  // 🔹 블럭 선택 시 해당 요일에 추가
  const handleSelectBlock = (day, block) => {
    const newBlock = {
      ...block,
      instanceId: uuidv4(), // 편집용 고유 ID
    };

    setSelectedRoutine((prev) => {
      if (!prev) return prev; // 안전장치

      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [day]: [...(prev.blocks?.[day] || []), newBlock],
        },
      };
    });
  };

  // 🔹 블럭 제거
  const handleRemoveBlock = (day, instanceId) => {
    setSelectedRoutine((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        blocks: {
          ...prev.blocks,
          [day]: prev.blocks?.[day]?.filter(
            (b) => b.instanceId !== instanceId
          ) || [],
        },
      };
    });
  };

  const setMainRoutine = async (routineId) => {
    try {
      const res = await api.put(`/api/myroutine/set-main/${routineId}`, {
        userUuid,
      });
      
      // 로컬 state 업데이트
      setRoutines(prev =>
        prev.map(r => ({
          ...r,
          isMain: r.routineId === routineId
        }))
      );
      window.location.reload();
      alert(res.data.message);
    } catch (error) {
      console.error(error);
      alert("메인 루틴 설정 실패");
    }
  };

  if (isLoading) return <div className="myroutine-container"><Spinner /></div>;

  return (
    <div className="myroutine-container">
      <h2 className="title">내 운동 루틴</h2>

      <div className="routine-btn">
        {routines?.map((routine, index) => (
          <button
            key={routine.routineId || index}
            onClick={() => {setSelectedRoutine(routine);setShowSelectedDay("월")}}
            className={selectedRoutine?.routineId === routine.routineId ? "active" : ""}
          >
            {routine.title || `루틴${index + 1}`}
          </button>
        ))}
      </div>
      
      <div className="routine-box">
        <div className="header">
          <h3>{selectedRoutine?.title}</h3>
          <div className="buttons">
            <button
                disabled={selectedRoutine?.isMain} // 이미 메인 루틴이면 비활성화
                onClick={() => {
                  {if (selectedRoutine) setMainRoutine(selectedRoutine.routineId); fetchRoutines()};
                }}
                className={`main-btn ${selectedRoutine?.isMain ? "disabled" : ""}`}
              >
                {selectedRoutine?.isMain ? "메인 루틴" : "메인 루틴으로 설정"}
              </button>
            <button onClick={() => {setEditStep(1);setEditRoutine(true);setSelectedDay("월")}}><FontAwesomeIcon icon={faPenToSquare} /></button>
          </div>
        </div>
        <ShowRoutine
          selectedRoutine={selectedRoutine}
          showSelectedDay={showSelectedDay}
          setShowSelectedDay={setShowSelectedDay}
        />
        {editRoutine && (
          <div className="overlay">
            <EditMyRoutine 
              editStep={editStep}
              setEditRoutine={setEditRoutine}
              selectedRoutine={selectedRoutine}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              filter={filter}
              setFilter={setFilter}
              blocks={blocks}
              setSelectedRoutine={setSelectedRoutine}
              handleSaveRoutine={handleSaveRoutine}
              setEditStep={setEditStep}
              handleSelectBlock={handleSelectBlock}
              filterOptions={filterOptions}
              handleRemoveBlock={handleRemoveBlock}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoutine;