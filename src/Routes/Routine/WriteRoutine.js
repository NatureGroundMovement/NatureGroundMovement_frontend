import { useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../css/Write.css";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storageService } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import { useAxios } from "../../contexts/useAxios";
import { v4 as uuid } from "uuid";


const WriteRoutine = () => {
  const { userUuid, uid } = useAuth();
  const navigate = useNavigate();
  const api = useAxios();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("day");

  const [purpose, setPurpose] = useState([]);
  const [bodyParts, setBodyParts] = useState([]);

  const [difficulty, setDifficulty] = useState(0);

  // day or weekly
  const [totalTime, setTotalTime] = useState(0);
  const [weeklyTotalTime, setWeeklyTotalTime] = useState({
    월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0, 일: 0,
  });

  const [workouts, setWorkouts] = useState([
    { exercise: "", weight: "", reps: "", sets: "", rest: "" },
  ]);

  const [weekWorkouts, setWeekWorkouts] = useState({
    월: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
    화: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
    수: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
    목: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
    금: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
    토: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
    일: [{ exercise: "", weight: "", reps: "", sets: "", rest: "" }],
  });

  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [dietTip, setDietTip] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const [note, setNote] = useState("");
  const [tags, setTags] = useState("");

  const [imageFiles, setImageFiles] = useState([]);
  const [imageInputs, setImageInputs] = useState([null]);

  const [isSubmit, setIsSubmit] = useState(false);

  const handleWorkoutChange = (index, field, value) => {
    setWorkouts((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addWorkout = () => {
    setWorkouts((prev) => [
      ...prev,
      { exercise: "", weight: "", reps: "", sets: "", rest: "" },
    ]);
  };

  const removeWorkout = (index) => {
    setWorkouts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleWeekWorkoutChange = (day, index, field, value) => {
    setWeekWorkouts((prev) => {
      const updatedDay = [...prev[day]];
      updatedDay[index][field] = value;

      return {
        ...prev,
        [day]: updatedDay,
      };
    });
  };

  const addWeekWorkout = (day) => {
    setWeekWorkouts((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        { exercise: "", weight: "", reps: "", sets: "", rest: "" },
      ],
    }));
  };

  const removeWeekWorkout = (day, index) => {
    setWeekWorkouts((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleAddImageInput = () => setImageInputs([...imageInputs, null]);

  const handleFileChange = (index, file) => {
    const filesCopy = [...imageFiles];
    filesCopy[index] = file;
    setImageFiles(filesCopy);
  };

  const handleRemoveImageInput = (index) => {
    const inputsCopy = [...imageInputs];
    inputsCopy.splice(index, 1);
    setImageInputs(inputsCopy);

    const filesCopy = [...imageFiles];
    filesCopy.splice(index, 1);
    setImageFiles(filesCopy);
  };

  const handleImageUpload = async () => {
    const imageUrls = [];
    const videoUrls = [];

    // 이미지 + 동영상 모두 처리
    for (const file of imageFiles) {
      if (!file) continue;

      const fileRef = ref(storageService, `routineFiles/${uid}/${uuid()}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // MIME 타입에 따라 분류
      if (file.type.startsWith("image/")) {
        imageUrls.push(url);
      } else if (file.type.startsWith("video/")) {
        videoUrls.push(url);
      }
    }

    // 썸네일 처리 (기존 그대로)
    let thumbUrl = "";
    if (thumbnailFile) {
      const thumbRef = ref(
        storageService,
        `routineFiles/${uid}/${uuid()}`
      );
      await uploadBytes(thumbRef, thumbnailFile);
      thumbUrl = await getDownloadURL(thumbRef);
    }

    return { imageUrls, videoUrls, thumbUrl };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!userUuid) {
        alert("로그인이 필요합니다.");
        return;
      }

      setIsSubmit(true);

      // 🔹 이미지 + 동영상 + 썸네일 업로드
      const uploaded = await handleImageUpload();

      const routineData = {
        title,
        type,
        difficulty,
        totalTime,
        description,
        purpose,
        bodyParts,
        note,
        frequency,
        dietTip,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        workouts,
        weekWorkouts,

        // 🔹 업로드된 URL 저장
        thumbnailUrl: uploaded.thumbUrl,
        imageUrls: uploaded.imageUrls,
        videoUrls: uploaded.videoUrls,
      };

      await api.post(
        `/api/routines`,
        { ...routineData, userUuid },
      );

      setIsSubmit(false);
      alert("루틴이 성공적으로 저장되었습니다!");
      navigate(-1);
    } catch (error) {
      console.error("🚨 루틴 저장 실패:", error.response?.data || error);
      alert("루틴 저장 중 오류가 발생했습니다.");
      setIsSubmit(false);
    }
  };

  return (
    <div className="write-container">
      <div className="write-content">
        <h1 className="title"><FontAwesomeIcon icon={faCalendar} /> 운동 루틴 작성</h1>

        <form onSubmit={handleSubmit}>

          {/* 루틴 이름 */}
          <div>
            <label>루틴 이름</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 하체 폭발 루틴"
              required
            />
          </div>

          {/* 루틴 타입 */}
          <div>
            <label>루틴 타입</label>
            <SingleSelectDropdown
              label=""
              value={type}
              onChange={(val) => setType(val)}
              options={[
                { value: "day", label: "하루 루틴" },
                { value: "week", label: "주간 루틴" },
              ]}
            />
          </div>

          {/* 루틴 목적 */}
          <div>
            <label>루틴 목적</label>
            <div className="checkbox-group">
              {["근력 강화", "근비대", "체중감량", "체력 향상", "유산소 강화", "체형 교정", "유연성 향상"].map(item => (
                <label key={item}>
                  <input
                    type="checkbox"
                    checked={purpose.includes(item)}
                    onChange={(e) => {
                      if (e.target.checked) setPurpose(prev => [...prev, item]);
                      else setPurpose(prev => prev.filter(p => p !== item));
                    }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* 운동 부위 */}
          <div>
            <label>운동 부위</label>
            <div className="checkbox-group">
              {["가슴", "등", "하체", "어깨", "팔", "복근", "전신"].map(part => (
                <label key={part}>
                  <input
                    type="checkbox"
                    checked={bodyParts.includes(part)}
                    onChange={(e) => {
                      if (e.target.checked) setBodyParts(prev => [...prev, part]);
                      else setBodyParts(prev => prev.filter(p => p !== part));
                    }}
                  />
                  {part}
                </label>
              ))}
            </div>
          </div>

          {/* 난이도 */}
          <div>
            <label>난이도</label>
            <div>
              {[1, 2, 3, 4, 5].map(level => (
                <span
                  key={level}
                  className="rate"
                  style={{
                    cursor: "pointer",
                    color: level <= difficulty ? "#ffc107" : "#ccc"
                  }}
                  onClick={() => setDifficulty(level)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          {/* 총 소요 시간 */}
          <div>
            <label>총 소요 시간 (분)</label>

            {type === "day" ? (
              <input
                type="number"
                value={totalTime}
                onChange={(e) => setTotalTime(Number(e.target.value))}
                placeholder="예: 70"
                min={0}
              />
            ) : (
              <table className="weekly-time-table">
                <thead>
                  <tr>
                    {Object.keys(weeklyTotalTime).map((day) => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    {Object.keys(weeklyTotalTime).map((day) => (
                      <td key={day}>
                        <input
                          type="number"
                          min={0}
                          value={weeklyTotalTime[day]}
                          onChange={(e) =>
                            setWeeklyTotalTime((prev) => ({
                              ...prev,
                              [day]: Number(e.target.value),
                            }))
                          }
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* 하루 루틴 */}
          {type === "day" && (
            <div>
              <div className="input-header">
                <label>운동 목록</label>
                <button
                  type="button"
                  onClick={addWorkout}
                  className="add-btn"
                >
                  운동 추가
                </button>
              </div>

              {workouts.map((w, i) => (
                <div key={i} className="ex-inputs">
                  <input
                    type="text"
                    placeholder="운동 종목"
                    value={w.exercise}
                    onChange={(e) => handleWorkoutChange(i, "exercise", e.target.value)}
                    required
                    style={{flex: "1"}}
                  />

                  <input
                    type="number"
                    placeholder="중량(kg)"
                    value={w.weight}
                    onChange={(e) => handleWorkoutChange(i, "weight", e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="횟수"
                    value={w.reps}
                    onChange={(e) => handleWorkoutChange(i, "reps", e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="세트"
                    value={w.sets}
                    onChange={(e) => handleWorkoutChange(i, "sets", e.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="휴식(초)"
                    value={w.rest}
                    onChange={(e) => handleWorkoutChange(i, "rest", e.target.value)}
                    required
                  />

                  <button type="button" onClick={() => removeWorkout(i)} className="del-btn">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 주간 루틴 */}
          {type === "week" && (
            <>
              {Object.keys(weekWorkouts).map((day) => (
                <div key={day}>
                  <div className="input-header">
                    <label>{day}요일</label>
                    <button
                      type="button"
                      onClick={() => addWeekWorkout(day)}
                      className="add-btn"
                    >
                      {day}요일 운동 추가
                    </button>
                  </div>

                  {weekWorkouts[day].map((w, i) => (
                    <div key={i} className="ex-inputs">
                      <input
                        type="text"
                        placeholder="운동 종목"
                        value={w.exercise}
                        style={{flex: "1"}}
                        onChange={(e) =>
                          handleWeekWorkoutChange(day, i, "exercise", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="중량(kg)"
                        value={w.weight}
                        onChange={(e) =>
                          handleWeekWorkoutChange(day, i, "weight", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="횟수"
                        value={w.reps}
                        onChange={(e) =>
                          handleWeekWorkoutChange(day, i, "reps", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="세트"
                        value={w.sets}
                        onChange={(e) =>
                          handleWeekWorkoutChange(day, i, "sets", e.target.value)
                        }
                      />
                      <input
                        type="number"
                        placeholder="휴식(초)"
                        value={w.rest}
                        onChange={(e) =>
                          handleWeekWorkoutChange(day, i, "rest", e.target.value)
                        }
                      />

                      <button
                        type="button"
                        onClick={() => removeWeekWorkout(day, i)}
                        className="del-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* 루틴 설명 */}
          <div>
            <label>루틴 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="왜 이렇게 구성했는지 작성"
            />
          </div>

          {/* 주기 */}
          <div>
            <label>루틴 주기</label>
            <input
              type="text"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="예: 주 3회 / 4주 반복"
            />
          </div>

          {/* 식단 */}
          <div>
            <label>식단</label>
            <input
              type="text"
              value={dietTip}
              onChange={(e) => setDietTip(e.target.value)}
              placeholder="예: 단백질 위주"
            />
          </div>

          {/* 썸네일 */}
          <div>
            <label>썸네일 이미지</label>
            <div className="file-input-row">
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setThumbnailFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* 이미지/동영상 업로드 */}
          <div>
            <div className="input-header">
              <label>
                이미지 / 동영상
              </label>
                <button type="button" onClick={handleAddImageInput} className="add-btn">
                  추가
                </button>
            </div>

              {imageInputs.map((file, index) => (
                <div key={index} className="file-input-row">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileChange(index, e.target.files[0])}
                  />

                  {imageInputs.length > 1 && (
                    <button type="button" onClick={() => handleRemoveImageInput(index)} className="del-btn">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* 작성자 메모 */}
          <div>
            <label>메모</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="메모"
            />
          </div>

          {/* 태그 */}
          <div>
            <label>태그</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="쉼표로 구분하여 입력"
            />
          </div>

          {/* 제출 */}
          <button
            type="submit"
            disabled={isSubmit}
            className={isSubmit ? "submit loading" : "submit"}
          >
            {isSubmit ? "업로드 중..." : "루틴 등록"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteRoutine;
