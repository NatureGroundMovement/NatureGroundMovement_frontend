import "./BlockList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import Spinner from "../../components/Spinner";
import WorkoutTable from "../../components/WorkoutTable";

const BlockList = ({
    myBlocks,
    expandedBlock,
    setExpandedBlock,
    allEditMode,
    selectedBlocks,
    toggleSelect,
    setBlock,
    setEditMode,
    isLoading
}) => {
    if (myBlocks.length === 0) return <p className="no-block">생성된 블럭이 없습니다.</p>;

    if (isLoading) return <Spinner />;

    return (
        <div className="my-block-list">
                    {myBlocks.map((b) => (
                        <div key={b.blockId} className="block-card">
                        {/* 제목 영역 */}
                        <div
                            className={expandedBlock === b.blockId ? "card-header active" : "card-header"}
                            onClick={() =>
                            setExpandedBlock(expandedBlock === b.blockId ? null : b.blockId)
                            }
                        >
                            <div className="title-container">
                                {allEditMode && (
                                    <input
                                        type="checkbox"
                                        checked={selectedBlocks.includes(b.blockId)}
                                        onChange={() => toggleSelect(b.blockId)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                                <h4>{b.title}</h4>
                            </div>
                            <div className="icon-container">
                                <FontAwesomeIcon
                                    icon={faPenToSquare}
                                    className="edit-icon"
                                    onClick={(e) => {
                                        e.stopPropagation(); // 이벤트 버블링 방지
                                        setBlock({
                                        blockId: b.blockId, // 기존 블럭 ID
                                        name: b.title,
                                        workouts: b.exercises.map(ex => ({
                                            exercise: ex.exercise,
                                            sets: ex.sets,
                                            reps: ex.reps,
                                            weight: ex.weight,
                                            rest: ex.rest,
                                        })),
                                        });
                                        setEditMode(true);
                                    }}
                                />
                                <span>{expandedBlock === b.blockId ? "▲" : "▼"}</span>

                            </div>
                        </div>

                        {/* 상세 운동 영역 */}
                        {expandedBlock === b.blockId && (
                            <WorkoutTable workouts={b.exercises} />
                        )}
                        </div>
                    ))}
                </div>
    );
};

export default BlockList;