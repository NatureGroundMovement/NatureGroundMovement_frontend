import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storageService } from "../../services/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import "../../css/Write.css";
import { formatDate } from "../../components/formatDate";
import ImportDiary from "./ImportRoutine";
import { useAxios } from "../../contexts/useAxios";
import { v4 as uuid } from "uuid";

const conditions = [
  { value: "좋음", label: "좋음" },
  { value: "보통", label: "보통" },
  { value: "나쁨", label: "나쁨" },
];

const EditDiary = () => {
  const { postId } = useParams();
  const api = useAxios();
  const { userUuid, userRole, uid } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSubmit, setIsSubmit] = useState(false);
  const [importMode, setImportMode] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [weight, setWeight] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [condition, setCondition] = useState("보통");
  const [exercisePart, setExercisePart] = useState("");
  const [workoutsInputs, setWorkoutsInputs] = useState([{}]);
  const [notes, setNotes] = useState("");
  const [focusLevel, setFocusLevel] = useState(5);
  const [painAreas, setPainAreas] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [satisfaction, setSatisfaction] = useState(5);
  const [nextGoal, setNextGoal] = useState("");
  const [meals, setMeals] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [imageInputs, setImageInputs] = useState([null]);
  const [imageFiles, setImageFiles] = useState({});
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tags, setTags] = useState("");

  /** 기존 데이터 불러오기 */
  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await api.get(`/api/diaries/${postId}`);
        const data = res.data;
        setTitle(data.title || "");
        setDate(data.date || "");
        setDayOfWeek(data.dayOfWeek || "");
        setStartTime(data.startTime || "");
        setEndTime(data.endTime || "");
        setLocation(data.location || "");
        setWeight(data.weight || "0");
        setSleepHours(data.sleepHours || "0");
        setCondition(data.condition || "보통");
        setExercisePart(data.exercisePart || "");
        setWorkoutsInputs(data.workouts || [{}]);
        setNotes(data.notes || "");
        setFocusLevel(data.focusLevel || 5);
        setPainAreas(data.painAreas?.join(", ") || "");
        setFormNotes(data.formNotes || "");
        setSatisfaction(data.satisfaction || 5);
        setNextGoal(data.nextGoal || "");
        setMeals(data.meals?.join(", ") || "");
        setTags(data.tags?.join(", ") || "");
        setThumbnailUrl(data.thumbnailUrl || "");
        setExistingImages(data.imageUrls || []);
        setExistingVideos(data.videoUrls || []);
      } catch (err) {
        console.error("🚨 일지 불러오기 실패:", err);
        alert("일지를 불러오는 데 실패했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchDiary();
  }, [postId, navigate]);

  const handleAddImageInput = () => {
    setImageInputs((prev) => [...prev, prev.length])
  };

  const handleFileChange = (index, file) => {
    setImageFiles((prev) => ({ ...prev, [index]: file }));
  };

  const handleRemoveImageInput = (index) => {
    setImageInputs((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleRemoveExistingVideo = (url) => {
    setExistingVideos((prev) => prev.filter((video) => video !== url));
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

    // 이미지 + 동영상 업로드
    for (const file of Object.values(imageFiles)) {
      if (!file) continue;

      const fileRef = ref(
        storageService,
        `diaryFiles/${uid}/${uuid()}`
      );

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // 🔥 타입 자동 분류
      if (file.type.startsWith("image/")) {
        imageUrls.push(url);
      } else if (file.type.startsWith("video/")) {
        videoUrls.push(url);
      }
    }

    // ✅ 썸네일 업로드
    let thumbUrl = thumbnailUrl;
    if (thumbnailFile) {
      try {
        const thumbRef = ref(
          storageService,
          `diaryFiles/${uid}/${uuid()}`
        );
        await uploadBytes(thumbRef, thumbnailFile);
        thumbUrl = await getDownloadURL(thumbRef);
      } catch (error) {
        console.error("🚨 썸네일 업로드 실패:", error);
        alert("썸네일 업로드 중 오류가 발생했습니다.");
        thumbUrl = thumbnailUrl || null;
      }
    }

    // 🔥 이미지/영상/썸네일 모두 반환
    return { imageUrls, videoUrls, thumbUrl };
  };

    // 🔹 운동일지 수정
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmit(true);

        try {
            // 업로드 처리
            const { imageUrls, videoUrls, thumbUrl } = await handleImageUpload();

            // 기존 이미지와 새 이미지 합치기
            const updatedImages = [...existingImages, ...imageUrls];
            const updatedVideos = [...existingVideos, ...videoUrls];

            // 업데이트 데이터 구성
            const updatedData = {
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
                workouts: workoutsInputs,
                imageUrls: updatedImages,
                videoUrls: updatedVideos,
                thumbnailUrl: thumbUrl, // 새 썸네일 적용
            };

            // PUT 요청
            await api.put(
                `/api/diaries/${postId}`,
                { ...updatedData, userUuid, userRole });

            alert("✅ 운동일지가 성공적으로 수정되었습니다!");
            navigate(-1);
        } catch (err) {
            console.error("🚨 운동일지 수정 실패:", err);
            alert("운동일지 수정에 실패했습니다.");
        } finally {
            setIsSubmit(false);
        }
    };

  if (loading) return <p></p>;

  const medias = [
      ...(existingImages || []).map(url => ({ url, type: "image" })),
      ...(existingVideos || []).map(url => ({ url, type: "video" })),
  ];

  return (
    <div className="write-container">
      <div className="write-content">
        <h1 className="title">📅 운동일지 수정</h1>
        <form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <fieldset>
              <legend>기본 정보</legend>
                <div>
                  <label>제목</label><input type="text" value={title} placeholder="일지 제목 입력" onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                  <label>날짜</label><p className="default-value">{formatDate(date)}</p>
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
              <label>기존 썸네일</label>
              {thumbnailUrl && (
                <div>
                  <img src={thumbnailUrl} alt="thumbnail" className="thumbnail-preview"/>
                </div>
              )}
            </div>

            <div>
              <label>썸네일 이미지</label>
              <div className="file-input-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                />
              </div>
            </div>

            {medias.length > 0 && (
                <div className="media-container">
                    <label>기존 이미지 / 동영상</label>
                    <div className="medias">
                        {medias.map((m, idx) =>
                        m.type === "image" ? (
                          <div className="media">
                            <img
                            key={idx}
                            src={m.url}
                            className="diary-media-image"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(m.url)}
                              className="remove-btn"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        ) : (
                          <div className="media">
                            <video
                                key={idx}
                                src={m.url}
                                className="diary-media-video"
                                controls
                                controlsList="nodownload"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingVideo(m.url)}
                              className="remove-btn"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        )
                        )}
                    </div>
                </div>
            )}
            
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
                        <button type="button" onClick={() => handleRemoveImageInput(index)}>
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
                {isSubmit ? "업로드 중..." : "수정 완료"}
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

export default EditDiary;
