import "./EditBlock.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { faFloppyDisk, faTrashCan } from "@fortawesome/free-regular-svg-icons";

const EditBlock = ({ 
        handleDeleteRoutine,
        handleWorkoutChange,
        block, 
        setBlock,
        addMode,
        setAddMode,
        editMode,
        setEditMode,
        removeWorkout,
        saveBlock, 
        addWorkout,
        updateBlock,
    }) => {
    return (
        <div className="block-edit-container">
            {/* 헤더 */}
            <div className="block-header">
                <h3>{addMode ? "블럭 추가" : "블럭 수정"}</h3>
                <FontAwesomeIcon
                    icon={faX}
                    className="close-icon"
                    onClick={() => {
                        setAddMode(false);
                        setEditMode(false);
                        setBlock({
                        name: "",
                        workouts: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
                        });
                    }}
                />
            </div>

            {/* 블럭 폼 */}
            <div className="block-form">
                {/* 블럭명 & 운동 추가 버튼 */}
                <div className="form-header">
                    <div className="block-name">
                        <label>블럭명 :</label>
                        <input
                        type="text"
                        placeholder="예: 하체 루틴 / 벤치데이 등"
                        value={block.name}
                        onChange={(e) => setBlock({ ...block, name: e.target.value })}
                        />
                    </div>

                    <button type="button" onClick={addWorkout} className="add-btn">
                        운동 추가
                    </button>
                </div>

                {/* 운동 입력 목록 */}
                <div className="workout-list">
                    {block.workouts.map((w, i) => (
                        <div key={i} className="workout-item">
                        <input
                            type="text"
                            placeholder="운동 이름"
                            value={w.exercise}
                            onChange={(e) => handleWorkoutChange(i, "exercise", e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <input
                            type="text"
                            placeholder="무게 (kg)"
                            value={w.weight}
                            onChange={(e) => handleWorkoutChange(i, "weight", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="횟수"
                            value={w.reps}
                            onChange={(e) => handleWorkoutChange(i, "reps", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="세트"
                            value={w.sets}
                            onChange={(e) => handleWorkoutChange(i, "sets", e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="휴식 (초)"
                            value={w.rest}
                            onChange={(e) => handleWorkoutChange(i, "rest", e.target.value)}
                        />
                        <button
                            type="button"
                            className="del-btn"
                            onClick={() => removeWorkout(i)}
                            disabled={block.workouts.length === 1}
                        >
                           <FontAwesomeIcon icon={faTrash}/>
                        </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 푸터 */}
            <div className={editMode ? "block-footer edit" : "block-footer"}>
                {editMode && (
                <button
                    className="delete-btn"
                    onClick={() => handleDeleteRoutine(block.blockId)}
                >
                    <FontAwesomeIcon icon={faTrashCan} /> <span>삭제하기</span>
                </button>
                )}

                <button onClick={addMode ? saveBlock : updateBlock}>
                    <FontAwesomeIcon icon={faFloppyDisk} /> <span>{addMode ? "저장하기" : "수정하기"}</span>
                </button>
            </div>
        </div>
    );
};

export default EditBlock;