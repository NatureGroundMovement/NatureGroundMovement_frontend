import { useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storageService } from "../../services/firebase";
import "../../css/Write.css";
import { useAuth } from "../../contexts/AuthProvider";
import SingleSelectDropdown from "../../components/SingleSelectDropdown";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useAxios } from "../../contexts/useAxios";
import { v4 as uuid } from "uuid";

const categoryOptions = [
  { value: "free", label: "자유게시판" },
  { value: "workout", label: "헬스" },
  { value: "calisthenics", label: "맨몸운동" },
  { value: "diet", label: "다이어트" },
  { value: "stretching", label: "스트레칭" },
  { value: "rehab", label: "재활" },
  { value: "nutrition", label: "식단" },
];

const WritePost = () => {
  const { userUuid, uid } = useAuth();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [imageInputs, setImageInputs] = useState([0]); // 기본 1개
  const [imageFiles, setImageFiles] = useState({});
  const [isSubmit, isSetSubmit] = useState(false);
  const navigate = useNavigate();
  const api = useAxios();

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
        `communityFiles/${uid}/${uuid()}`
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
        userUuid,
        category,
        title,
        content,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        imageUrls: uploaded.imageUrls,
        videoUrls: uploaded.videoUrls
      };

      await api.post("/api/community", postData);

      alert("게시글이 등록되었습니다 ✅");
      navigate(-1);
    } catch (error) {
      console.error("🚨 게시글 등록 실패:", error);
      alert("게시글 등록에 실패했습니다.");
    } finally {
      isSetSubmit(false);
    }
  };

  return (
    <div className="write-container">
      <div className="write-content">
        <h1 className="title"><FontAwesomeIcon icon={faUsers} /> 커뮤니티 게시글 작성</h1>

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

          {/* 카테고리 */}
          <div>
            <label>카테고리</label>
            <SingleSelectDropdown
              options={categoryOptions}
              value={category}
              onChange={setCategory}
              label="카테고리 선택"
            />
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

          {/* 태그 */}
          <div>
            <label>태그</label>
            <textarea
              placeholder="쉼표로 구분하여 입력"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-tags"
            />
          </div>

          {/* 제출 */}
          <button type="submit" disabled={isSubmit} className={isSubmit ? "submit loading" : "submit"}>
            {isSubmit ? "업로드 중..." : "게시글 등록"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WritePost;
