import { useEffect, useState, useRef } from "react";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import "./Block.css";
import { useAuth } from "../../contexts/AuthProvider";
import EditBlock from "./EditBlock";
import BlockList from "./BlockList";
import { useAxios } from "../../contexts/useAxios";
import useWindowWidth from "../../components/useWindowWidth";

const Block = () => {
    const { userUuid } = useAuth();
    const width = useWindowWidth();
    const isMobile = width < 768;
    const [addMode, setAddMode] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [allEditMode, setAllEditMode] = useState(false);        // 전체 편집 모드 ON/OFF
    const [selectedBlocks, setSelectedBlocks] = useState([]);
    const [block, setBlock] = useState({
        name: "",
        workouts: [
            {
            exercise: "",
            weight: "",
            reps: "",
            sets: "",
            rest: "",
            },
        ],
    });
    const [myBlocks, setMyBlocks] = useState([]);
    const [filter, setFilter] = useState("all");
    const filterOptions = [
        { value: "all", label: "모두" },
        { value: "my", label: "내 블럭" },
        { value: "others", label: "저장한 블럭" },
    ];
    const [expandedBlock, setExpandedBlock] = useState(null);
    const [limit] = useState(20);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const [isFetching, setIsFetching] = useState(false);
    const api = useAxios();

    const fetchBlocks = async (forceRefresh = false) => {
        if (!userUuid || (!hasMore && !forceRefresh)) return;

        setIsFetching(true);

        try {
            // forceRefresh면 skip 0부터 가져오기
            const res = await api.get("/api/blocks", {
                params: { userUuid, filter, skip: forceRefresh ? 0 : skip, limit },
            });

            const fetched = res.data.blocks || [];

            setMyBlocks(prev => forceRefresh ? fetched : [...prev, ...fetched]);
            setSkip(prev => forceRefresh ? fetched.length : prev + fetched.length);

            if (fetched.length < limit) setHasMore(false);
            else if (forceRefresh) setHasMore(true); // 새로고침 시 hasMore 재설정
        } catch (error) {
            console.error("블럭 불러오기 실패:", error);
        }

        setIsFetching(false);
    };

    useEffect(() => {
        setMyBlocks([]);
        setSkip(0);
        setHasMore(true);
        fetchBlocks();
    }, [filter, userUuid]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && skip > 0) {
                fetchBlocks();
            }
        });

        const node = loaderRef.current;
        if (node) observer.observe(node);

        return () => {
            if (node) observer.unobserve(node);
        };
    }, [skip, hasMore]);


    const addWorkout = () => {
        setBlock((prev) => ({
            ...prev,
            workouts: [
            ...prev.workouts,
            { exercise: "", weight: "", reps: "", sets: "", rest: "" },
            ],
        }));
    };

    const handleWorkoutChange = (index, key, value) => {
        const updated = [...block.workouts];
        updated[index][key] = value;
        setBlock({ ...block, workouts: updated });
    };

    const removeWorkout = (index) => {
        setBlock((prev) => {
            if (prev.workouts.length === 1) return prev; // ✅ 최소 1개 유지
            return {
            ...prev,
            workouts: prev.workouts.filter((_, i) => i !== index),
            };
        });
    };

    const updateBlock = async () => {
        try {
            const payload = {
            userUuid,
            title: block.name,
            exercises: block.workouts.map(w => ({
                exercise: w.exercise,
                sets: Number(w.sets) || 0,
                reps: Number(w.reps) || 0,
                weight: Number(w.weight) || 0,
                rest: Number(w.rest) || 0,
            }))
            };
            await api.put(`/api/blocks/${block.blockId}`, payload);
            alert("블럭 수정 완료!");
            setEditMode(false);
            setBlock({
                name: "",
                workouts: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
            });
            fetchBlocks(true); // 목록 갱신
        } catch (err) {
            console.error(err);
            alert("블럭 수정 실패");
        }
    };

    const saveBlock = async () => {
        if (!block.name.trim()) {
            alert("블럭 이름을 입력해주세요!");
            return;
        }

        if (block.workouts.length === 0) {
            alert("운동을 최소 1개 이상 추가해주세요!");
            return;
        }

        try {
            const payload = {
            userUuid, // 로그인한 유저의 uuid
            title: block.name,
            creatorUuid: userUuid, // 블럭 작성자 UUID
            isSave: false,
            exercises: block.workouts.map((w) => ({
                exercise: w.exercise,
                sets: Number(w.sets) || 0,
                reps: Number(w.reps) || 0,
                weight: Number(w.weight) || 0,
                rest: Number(w.rest) || 0,
            })),
            };

            await api.post("/api/blocks/", payload);

            alert("블럭이 저장되었습니다!");

            // ✅ 입력값 초기화
            setBlock({
            name: "",
            workouts: [
                {
                exercise: "",
                sets: "",
                reps: "",
                weight: "",
                rest: "",
                },
            ],
            });

            setAddMode(false);
            fetchBlocks(true);
        } catch (error) {
            console.error("🚨 블럭 저장 실패:", error);
            alert("블럭 저장 중 오류가 발생했습니다.");
        }
    };

    const toggleSelect = (blockId) => {
        setSelectedBlocks((prev) =>
            prev.includes(blockId)
            ? prev.filter((id) => id !== blockId)
            : [...prev, blockId]
        );
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm("선택한 블럭을 삭제하시겠습니까?")) return;

        try {
            await api.post(
            "/api/blocks/delete-multiple",
            { blockIds: selectedBlocks },
            );

            alert("선택한 블럭이 삭제되었습니다.");
            setMyBlocks((prev) =>
            prev.filter((block) => !selectedBlocks.includes(block.blockId))
            );
            setSelectedBlocks([]);
            setEditMode(false);
            setAllEditMode(false);
            fetchBlocks(true);
        } catch (error) {
            console.error("🚨 삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    const handleDeleteRoutine = async (blockId) => {
        if (!window.confirm("이 루틴을 삭제하시겠습니까?")) return;

        try {
            const res = await api.delete(`/api/blocks/${userUuid}/${blockId}`);

            if (!res.ok) throw new Error("삭제 실패");

            // 삭제 성공 후 상태 업데이트
            alert("블럭이 삭제되었습니다.")
            setEditMode(false);
            setBlock({
                name: "",
                workouts: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
            });
            fetchBlocks(true);
        } catch (error) {
            console.error("루틴 삭제 실패:", error);
            alert("루틴 삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="block-container">
            <h2>운동 블럭</h2>
            <div className="block-list">
                <div className="header">
                    <div className="filter">
                        {!isMobile &&
                            <h3>블럭 리스트</h3>
                        }
                        <SingleSelectDropdown
                            options={filterOptions}
                            value={filter}
                            onChange={setFilter}
                            label="필터 선택"
                        />
                    </div>
                    <div className="buttons">
                        {allEditMode && selectedBlocks.length > 0 && (
                            <button onClick={handleDeleteSelected} className="delete">선택 삭제</button>
                        )}
                        <button onClick={() => setAllEditMode((prev) => !prev)}>
                            {allEditMode ? "편집 종료" : "편집 모드"}
                        </button>
                        <button onClick={() => setAddMode(true)}>블럭 추가</button>
                    </div>
                </div>
                <BlockList 
                    myBlocks={myBlocks}
                    expandedBlock={expandedBlock}
                    setExpandedBlock={setExpandedBlock}
                    allEditMode={allEditMode}
                    selectedBlocks={selectedBlocks}
                    toggleSelect={toggleSelect}
                    setBlock={setBlock}
                    setEditMode={setEditMode}
                    isLoading={isFetching}
                />
                {hasMore && <div ref={loaderRef} style={{ height: "1px" }} />}
            </div>
            
            {(addMode || editMode) && 
                <div className="overlay">
                    <EditBlock 
                        handleDeleteRoutine={handleDeleteRoutine}
                        handleWorkoutChange={handleWorkoutChange}
                        block={block}
                        setBlock={setBlock}
                        addMode={addMode}
                        setAddMode={setAddMode}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        saveBlock={saveBlock}
                        updateBlock={updateBlock}
                        addWorkout={addWorkout}
                        removeWorkout={removeWorkout}
                    />
                </div>
            }
        </div>
    );
};

export default Block;