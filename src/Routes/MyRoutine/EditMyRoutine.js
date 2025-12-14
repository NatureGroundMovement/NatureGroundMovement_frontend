import "./EditMyRoutine.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX, faTrash, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";

const EditMyRoutine = ({ 
    editStep,
    setEditRoutine,
    selectedRoutine,
    selectedDay,
    setSelectedDay,
    filter,
    setFilter,
    blocks,
    setSelectedRoutine,
    handleSaveRoutine,
    setEditStep,
    handleSelectBlock,
    filterOptions,
    handleRemoveBlock,
}) => {

    return (
        <div className="routine-edit-container">
            {/* 🔹 Header */}
            <div className="routine-edit-header">
                <h3>
                    루틴 편집{" "}
                    <span>
                        {editStep === 1
                            ? "(루틴 정보)"
                            : editStep === 2
                            ? "(요일별 운동)"
                            : "(메모 입력)"}
                    </span>
                </h3>
                <FontAwesomeIcon
                    icon={faX}
                    className="close-icon"
                    onClick={() => setEditRoutine(false)}
                />
            </div>

            {/* 🔹 Main */}
            <div className="routine-edit-main">

                {/* ■ STEP 1 — 루틴 정보 */}
                {editStep === 1 && (
                    <div className="routine-info-step">
                        {/* 루틴명 수정 */}
                        <div className="routine-name-section">
                            <label>루틴명</label>
                            <input
                                type="text"
                                placeholder="루틴 이름을 입력하세요"
                                value={selectedRoutine?.title || ""}
                                onChange={(e) =>
                                    setSelectedRoutine((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* 요일별 부위 설정 */}
                        <div className="routine-schedule-section">
                            <label>요일별 부위</label>
                            <table className="schedule-table">
                                <thead>
                                    <tr>
                                        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                                            <th key={day}>{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                                            <td key={day}>
                                                <input
                                                    type="text"
                                                    placeholder="입력"
                                                    value={selectedRoutine?.schedule?.[day]?.join(", ") || ""}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value
                                                            .split(",");
                                                        setSelectedRoutine((prev) => ({
                                                            ...prev,
                                                            schedule: {
                                                                ...prev.schedule,
                                                                [day]: newValue,
                                                            },
                                                        }));
                                                    }}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ■ STEP 2 — 요일별 블럭 구성 */}
                {editStep === 2 && (
                    <div className="routine-block-step">
                        <div className="routine-main-section">
                            {/* 요일 선택 */}
                            <div className="day-selector">
                                {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                                    <button
                                        key={day}
                                        className={`day-btn ${selectedDay === day ? "active" : ""}`}
                                        onClick={() => setSelectedDay(day)}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>

                            {/* 선택된 요일 루틴 */}
                            <div className="day-routine-section">
                                {selectedRoutine?.blocks?.[selectedDay]?.length > 0 ? (
                                    selectedRoutine.blocks[selectedDay].map((block) => (
                                        <div key={block.instanceId} className="routine-block-item">
                                            <p className="title">{block.title}</p>
                                            <button
                                                className="remove-btn"
                                                onClick={() =>
                                                    handleRemoveBlock(selectedDay, block.instanceId)
                                                }
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="placeholder">아직 블럭이 추가되지 않았습니다.</p>
                                )}
                            </div>
                        </div>

                        {/* 우측 블럭 목록 */}
                        <div className="routine-side-panel">
                            <div className="routine-side-header">
                                <div className="panel-header">
                                    <h4>블럭 목록</h4>
                                    <Link to="/myblock">상세보기</Link>
                                </div>

                                <div className="block-filter">
                                    <SingleSelectDropdown
                                        options={filterOptions}
                                        value={filter}
                                        onChange={setFilter}
                                        label="필터 선택"
                                    />
                                </div>
                            </div>

                            <div className="block-card-list">
                                {blocks.map((b) => (
                                    <div
                                        key={b.blockId}
                                        className="block-card"
                                        onClick={() => handleSelectBlock(selectedDay, b)}
                                    >
                                        <p>{b.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ■ STEP 3 — 메모 입력 */}
                {editStep === 3 && (
                    <div className="routine-memo-step">
                        <label>메모 입력</label>
                        <textarea
                            className="memo-textarea"
                            placeholder="루틴에 관한 메모를 입력하세요"
                            value={selectedRoutine?.note || ""}
                            onChange={(e) =>
                                setSelectedRoutine((prev) => ({
                                    ...prev,
                                    note: e.target.value,
                                }))
                            }
                        />
                    </div>
                )}
            </div>

            {/* 🔹 Footer */}
            <div
                className={`routine-edit-footer ${
                    editStep === 1
                        ? "step-first"
                        : editStep === 2
                        ? "step-second"
                        : "step-third"
                }`}
            >
                {editStep === 1 && (
                    <button onClick={() => setEditStep(2)}>다음 <FontAwesomeIcon icon={faAngleRight} /></button>
                )}

                {editStep === 2 && (
                    <>
                        <button onClick={() => setEditStep(1)}><FontAwesomeIcon icon={faAngleLeft} /> 뒤로</button>
                        <button onClick={() => setEditStep(3)}>다음 <FontAwesomeIcon icon={faAngleRight} /></button>
                    </>
                )}

                {editStep === 3 && (
                    <>
                        <button onClick={() => setEditStep(2)}><FontAwesomeIcon icon={faAngleLeft} /> 뒤로</button>
                        <button onClick={handleSaveRoutine}><FontAwesomeIcon icon={faFloppyDisk} /> 저장하기</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditMyRoutine;
