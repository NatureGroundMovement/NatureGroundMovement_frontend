import { useState } from "react";
import "./NotifyAdmin.css";
import { useAuth } from "../../contexts/AuthProvider";
import { storageService } from "../../services/firebase";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../../css/Write.css";
import SelectTarget from "./SelectTarget";
import { useAxios } from "../../contexts/useAxios";

const NotifyAdmin = ({ currentMenuLabel, isMobile, toggleSidebarOpen }) => {
    const { userUuid } = useAuth();
    const api = useAxios();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [imageInputs, setImageInputs] = useState([0]); // 기본 1개
    const [imageFiles, setImageFiles] = useState({});
    const [isSubmit, isSetSubmit] = useState(false);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [targets, setTargets] = useState("all");

    // 🔹 이미지 인풋 추가
  const handleAddImageInput = () => {
    setImageInputs((prev) => [...prev, prev.length]);
  };

  // 🔹 특정 이미지 인풋 삭제
  const handleRemoveImageInput = (index) => {
    setImageInputs((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[index];
      return newFiles;
    });
  };

  // 🔹 파일 선택 시 상태 업데이트
  const handleFileChange = (index, file) => {
    setImageFiles((prev) => ({ ...prev, [index]: file }));
  };

  // 🔹 Firebase 업로드
  const handleImageUpload = async () => {
    const imageUrls = [];
    const videoUrls = [];

    for (const key in imageFiles) {
      const file = imageFiles[key];
      if (!file) continue;

      const fileRef = ref(
        storageService,
        `communityFiles/${Date.now()}_${file.name}`
      );

      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // 타입 자동 구분
      if (file.type.startsWith("image/")) {
        imageUrls.push(url);
      } else if (file.type.startsWith("video/")) {
        videoUrls.push(url);
      }
    }

    return { imageUrls, videoUrls };
  };

  // 🔹 게시글 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요!");
      return;
    }

    isSetSubmit(true);
    try {
      let uploaded = { imageUrls: [], videoUrls: [] };
      if (imageFiles.length > 0) {
        uploaded = await handleImageUpload();
      }

      const postData = {
        postType: "post",
        category: "notify",
        userUuid,
        title,
        content,
        imageUrls: uploaded.imageUrls,
        videoUrls: uploaded.videoUrls,
        isNotify: true,
        targets
      };

      await api.post("/api/community", postData);

      alert("알람이 발송되었습니다. ✅");
    } catch (error) {
      console.error("🚨 알람 발송 실패:", error);
      alert("알람 발송에 실패했습니다.");
    } finally {
      isSetSubmit(false);
    }
  };

    return (
        <div className="notify-admin">
          <div className="admin-header">
              {isMobile &&
              <FontAwesomeIcon icon={faBars} className="bars" onClick={toggleSidebarOpen}/>
              }
              <h2>{currentMenuLabel}</h2>
          </div>
            {isPopupOpen && (
            <div className="overlay">
                <SelectTarget
                    onClose={() => setPopupOpen(false)}
                    onSelect={(selected) => {
                        setTargets(selected);
                        setPopupOpen(false);
                    }}
                    targets={targets}
                />
            </div>
            )}

            <div className="write-container">
                <form onSubmit={handleSubmit}>
                {/* 제목 */}
                <div>
                    <label>제목</label>
                    <input
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-title"
                    required
                    />
                </div>

                <div className="target-box">
                    <div className="input-header">
                        <label>알람 대상</label>
                        <button type="button" onClick={() => setPopupOpen(true)} className="add-btn">
                        대상 선택
                        </button>
                    </div>
                    <p className="target-summary">
                    대상:{" "}
                    {targets === "all"
                        ? "전체 유저"
                        : `${targets.length}명 선택됨`}
                    </p>
                </div>

                {/* 내용 */}
                <div>
                    <label>내용</label>
                    <textarea
                    placeholder="내용을 입력하세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="input-content"
                    required
                    />
                </div>

                {/* 이미지 업로드 */}
                <div>
                    <div className="input-header">
                    <label>이미지 / 동영상</label>
                    <button
                        type="button"
                        onClick={handleAddImageInput}
                        className="add-btn"
                    >
                        추가
                    </button>
                    </div>
                    {imageInputs.map((_, index) => (
                    <div key={index} className="file-input-row">
                        <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                        className="input-file"
                        />
                        {imageInputs.length > 1 && (
                        <button
                            type="button"
                            onClick={() => handleRemoveImageInput(index)}
                            className="del-btn"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        )}
                    </div>
                    ))}
                </div>

                {/* 제출 */}
                <button type="submit" disabled={isSubmit} className={isSubmit ? "submit loading" : "submit"}>
                    {isSubmit ? "발송 중..." : "알람 발송"}
                </button>
                </form>
            </div>
        </div>
    );
};

export default NotifyAdmin;
