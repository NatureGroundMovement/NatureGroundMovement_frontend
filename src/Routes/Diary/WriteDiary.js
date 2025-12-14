import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storageService } from "../../services/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faTrash } from "@fortawesome/free-solid-svg-icons";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import "../../css/Write.css";
import ImportDiary from "./ImportRoutine";
import { useAxios } from "../../contexts/useAxios";
import { v4 as uuid } from "uuid";

const conditions = [
  { value: "좋음", label: "좋음" },
  { value: "보통", label: "보통" },
  { value: "나쁨", label: "나쁨" }
];

const WriteDiary = () => {
  const { userUuid, uid } = useAuth();
  const navigate = useNavigate();
  const api = useAxios();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dayOfWeek, setDayOfWeek] = useState(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[new Date().getDay()] + "요일";
  });
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [weight, setWeight] = useState("0");
  const [sleepHours, setSleepHours] = useState("0");
  const [condition, setCondition] = useState("보통");
  const [exercisePart, setExercisePart] = useState([]);
  const [workoutsInputs, setWorkoutsInputs] = useState([null]);
  const [importMode, setImportMode] = useState(false);
  const [notes, setNotes] = useState("");
  const [focusLevel, setFocusLevel] = useState(5);
  const [painAreas, setPainAreas] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [satisfaction, setSatisfaction] = useState(5);
  const [nextGoal, setNextGoal] = useState("");
  const [meals, setMeals] = useState("");
  const [imageInputs, setImageInputs] = useState([null]); // 기본 1개 input
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [tags, setTags] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);
  const [myDiaryCount, setMyDiaryCount] = useState(0);

  useEffect(() => {
    const fetchMyDiaryCount = async () => {
    if (!userUuid) return;
      try {
      const res = await api.get("/api/diaries/today/mine/count", {
        params: { userUuid },
      });
      setMyDiaryCount(res.data.count);
      } catch (error) {
        console.error("🚨 내 오늘 일지 개수 조회 실패:", error);
      }
    };

    fetchMyDiaryCount();
  }, [userUuid]);

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

  const handleAddWorkoutInput = () => {
    setWorkoutsInputs((prev) => [...prev, {}]);
  };

  const handleRemoveWorkoutInput = (index) => {
    setWorkoutsInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleWorkoutChange = (index, field, value) => {
    setWorkoutsInputs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleImageUpload = async () => {
    const imageUrls = [];
    const videoUrls = [];

    // 이미지 + 동영상 모두 처리
    for (const file of imageFiles) {
      if (!file) continue;

      const fileRef = ref(storageService, `diaryFiles/${uid}/${uuid()}`);
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
        `diaryFiles/${uid}/${uuid()}`
      );
      await uploadBytes(thumbRef, thumbnailFile);
      thumbUrl = await getDownloadURL(thumbRef);
    }

    return { imageUrls, videoUrls, thumbUrl };
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (myDiaryCount >= 2) {
      alert("🚫 오늘은 최대 2개의 일지만 작성할 수 있습니다.");
      return; // ✅ 이동 막기
    };
    setIsSubmit(true);

    const postId = crypto.randomUUID();

    let uploaded = { imageUrls: [], videoUrls: [], thumbUrl: "" };
    if (imageFiles.length > 0 || thumbnailFile) {
      uploaded = await handleImageUpload();
    }

    const diaryData = {
      postId,
      userUuid,
      title,
      date,
      dayOfWeek,
      startTime,
      endTime,
      location,
      weight: weight ? Number(weight) : undefined,
      sleepHours: sleepHours ? Number(sleepHours) : undefined,
      condition,
      exercisePart,
      notes,
      focusLevel,
      painAreas: painAreas.split(",").map((t) => t.trim()).filter(Boolean),
      formNotes,
      satisfaction,
      nextGoal,
      meals: meals.split(",").map((t) => t.trim()).filter(Boolean),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrls: uploaded.imageUrls,
      videoUrls: uploaded.videoUrls,
      thumbnailUrl: uploaded.thumbUrl,
      workouts: workoutsInputs
    };

    try {
      await api.post("/api/diaries", diaryData);
      alert("운동일지가 저장되었습니다 ✅");
      navigate(-1);
    } catch (error) {
      console.error("🚨 운동일지 저장 실패:", error);
      alert("운동일지 저장에 실패했습니다.");
    }
  };

  return (
    <div className="write-container">
      <div className="write-content">
        <h1 className="title"><FontAwesomeIcon icon={faBook} /> 운동일지 작성</h1>
        <form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <fieldset>
              <legend>기본 정보</legend>
                <div>
                  <label>제목</label><input type="text" value={title} placeholder="일지 제목 입력" onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label>날짜</label><p className="default-value">{date}</p>
                </div>
                <div>
                  <label>요일</label><p className="default-value">{dayOfWeek}</p>
                </div>
                <div>
                  <label>
                    운동 시간
                  </label>
                  <div className="time-input">
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    <span>~</span>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label>장소</label><input type="text" value={location} placeholder="예: 헬스장" onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <label>체중 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div>
                  <label>수면시간 (시간)</label><input type="number" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} />
                </div>
                <div>
                <label>컨디션</label>
                  <SingleSelectDropdown
                      options={conditions}
                      value={condition}
                      onChange={setCondition}
                      label="컨디션 선택"
                  />
                </div>
            </fieldset>

            {/* 루틴 */}
            <fieldset>
              <legend>오늘의 루틴</legend>

              {/* 운동부위 선택 */}
              <div className="part-container">
                <label>운동 부위</label>
                <div className="checkbox-group">
                  {["가슴", "등", "하체", "어깨", "팔", "복근", "전신"].map((part) => (
                    <label key={part}>
                      <input
                        type="checkbox"
                        checked={exercisePart.includes(part)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExercisePart((prev) => [...prev, part]); // ✅ 추가
                          } else {
                            setExercisePart((prev) => prev.filter((p) => p !== part)); // ✅ 제거
                          }
                        }}
                      />
                      {part}
                    </label>
                  ))}
                </div>
              </div>

              {/* 루틴 입력 헤더 */}
              <div>
                <div className="input-header">
                  <label>루틴</label>
                  <button type="button" className="add-btn" onClick={handleAddWorkoutInput}>
                    운동 추가
                  </button>
                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => setImportMode(true)}
                  >
                    내 루틴에서 가져오기
                  </button>
                </div>

              {/* 직접 입력 필드 */}
                {workoutsInputs.map((input, index) => (
                  <div key={index} className="ex-inputs">
                    <input
                      type="text"
                      placeholder="운동 이름"
                      value={input?.exercise || ""}
                      onChange={(e) => handleWorkoutChange(index, "exercise", e.target.value)}
                      style={{ flex: "1" }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="무게(kg)"
                      value={input?.weight || ""}
                      onChange={(e) => handleWorkoutChange(index, "weight", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="세트"
                      value={input?.sets || ""}
                      onChange={(e) => handleWorkoutChange(index, "sets", e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="횟수"
                      value={input?.reps || ""}
                      onChange={(e) => handleWorkoutChange(index, "reps", e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="휴식(초)"
                      value={input?.rest || ""}
                      onChange={(e) => handleWorkoutChange(index, "rest", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="del-btn"
                      onClick={() => handleRemoveWorkoutInput(index)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>

              {/* 메모 */}
              <label>
                메모
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="메모"
                />
              </label>
            </fieldset>

            {/* 피드백 */}
            <fieldset>
                <legend>피드백 / 컨디션</legend>
                <div>
                  <label>집중도(1~10)</label>
                  <span className="range-input">
                    <input type="range" min="1" max="10" value={focusLevel} onChange={(e) => setFocusLevel(Number(e.target.value))} />
                    <p>{focusLevel}</p>
                  </span>
                </div>
                <div>
                  <label>통증/불편 부위 (쉼표 구분)</label>
                  <input type="text" 
                    value={painAreas} 
                    onChange={(e) => setPainAreas(e.target.value)}
                    placeholder="예: 손목"
                  />
                </div>
                <div>
                  <label>자세/폼 관련 메모</label>
                  <textarea 
                    value={formNotes} 
                    onChange={(e) => setFormNotes(e.target.value)} 
                    placeholder="다음 운동할 때 신경 써야 할 자세"  
                  />
                </div>
                <div>
                  <label>오늘 만족도(1~10)</label>
                  <span className="range-input">
                    <input type="range" min="1" max="10" value={satisfaction} onChange={(e) => setSatisfaction(Number(e.target.value))} />
                    <p>{satisfaction}</p>
                  </span>
                </div>
                <div>
                  <label>다음 목표</label>
                  <input type="text" value={nextGoal} onChange={(e) => setNextGoal(e.target.value)} placeholder="예: 무게 추가"/>
                </div>
            </fieldset>

            {/* 식단 */}
            <div>
                <label>식단</label>
                <textarea value={meals} onChange={(e) => setMeals(e.target.value)} placeholder="아침,점심,저녁 쉼표로 구분" />
            </div>

            <div>
              <label>썸네일 이미지</label>
              <div className="file-input-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  required
                />
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <div className="input-header">
                <label>이미지 / 동영상</label>
                <button type="button" onClick={handleAddImageInput} className="add-btn">추가</button>
              </div>
                {imageInputs.map((_, index) => (
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

            {/* 태그 */}
            <div>
                <label>태그</label>
                <textarea
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="쉼표로 구분하여 입력"
                />
            </div>

            <button type="submit" disabled={isSubmit} className="submit">
                {isSubmit ? "업로드 중..." : "운동일지 등록"}
            </button>
        </form>
      </div>

      {importMode && 
        <div className="overlay">
          <ImportDiary 
            setImportMode={setImportMode}
            userUuid={userUuid}
            setWorkoutsInputs={setWorkoutsInputs}
          />
        </div>
      }
    </div>
  );
};

export default WriteDiary;
