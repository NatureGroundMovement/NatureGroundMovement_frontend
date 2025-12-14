import "../../css/Write.css";
import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storageService } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../../contexts/useAxios";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuid } from "uuid";

const WriteHighlight = () => {
  const { userUuid, uid } = useAuth();
  const api = useAxios();
  const [highlight, setHighlight] = useState({
    postType: "highlight",
    title: "",
    content: "",
    tags: "",
    videoUrl: "",
    thumbnailUrl: "",
  });

  const [isSubmit, setIsSubmit] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const navigate = useNavigate();

  // ✅ 랜덤 시점에서 썸네일 추출
  const extractRandomThumbnail = (videoUrl) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.addEventListener("loadedmetadata", () => {
        const randomTime = video.duration * (0.1 + Math.random() * 0.8);
        video.currentTime = randomTime;
      });

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
      });

      video.addEventListener("error", () => resolve(null));
    });
  };

  // ✅ 영상 업로드
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsSubmit(true);
    try {
      const videoRef = ref(storageService, `highlightFiles/${uid}/${uuid()}`);
      await uploadBytes(videoRef, file);
      const downloadURL = await getDownloadURL(videoRef);
      setHighlight((prev) => ({ ...prev, videoUrl: downloadURL }));
      setPreviewUrl(URL.createObjectURL(file));

      // ❗ 썸네일이 아직 업로드되지 않았으면 자동 추출
      if (!highlight.thumbnailUrl) {
        const thumbnailBlob = await extractRandomThumbnail(URL.createObjectURL(file));
        if (thumbnailBlob) {
          const thumbnailRef = ref(storageService, `highlightFiles/${uid}/${uuid()}`);
          await uploadBytes(thumbnailRef, thumbnailBlob);
          const thumbnailURL = await getDownloadURL(thumbnailRef);
          setHighlight((prev) => ({ ...prev, thumbnailUrl: thumbnailURL }));
          setThumbnailPreview(thumbnailURL);
        }
      }
    } catch (error) {
      console.error("🚨 영상 업로드 실패:", error);
      alert("영상 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsSubmit(false);
    }
  };

  // ✅ 썸네일 직접 업로드
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageRef = ref(storageService, `highlights/thumbnails/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      setHighlight((prev) => ({ ...prev, thumbnailUrl: downloadURL }));
      setThumbnailPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("🚨 썸네일 업로드 실패:", error);
      alert("썸네일 업로드 중 오류가 발생했습니다.");
    }
  };

  // ✅ 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!highlight.videoUrl) return alert("먼저 영상을 업로드하세요!");
    if (!highlight.thumbnailUrl) return alert("썸네일이 없습니다. 영상에서 자동 생성되지 않았다면 직접 업로드하세요.");

    try {
      await api.post(
        `/api/highlights`,
        {
          ...highlight,
          userUuid,
          tags: highlight.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag !== ""),
        }
      );

      alert("하이라이트가 등록되었습니다!");
      navigate("/highlight")
    } catch (error) {
      console.error("🚨 업로드 실패:", error);
      alert(error.response?.data?.message || "업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="write-container">
      <div className="write-content">
        <h1 className="title"><FontAwesomeIcon icon={faVideo} /> 하이라이트 작성</h1>

        <form onSubmit={handleSubmit}>
          {/* 제목 */}
          <div>
            <label>제목</label>
            <input
              type="text"
              value={highlight.title}
              onChange={(e) => setHighlight({ ...highlight, title: e.target.value })}
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          {/* 썸네일 업로드 */}
          <div>
            <label>썸네일 이미지 (선택)</label>
            <div className="file-input-row">
              <input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={isSubmit} />
            </div>
          </div>

          {/* 영상 업로드 */}
          <div>
            <label>영상 업로드</label>
            <div className="file-input-row">
              <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={isSubmit} required/>
            </div>
            {previewUrl && <video src={previewUrl} controls className="highlight"/>}
          </div>

          {/* 내용 */}
          <div>
            <label>내용</label>
            <textarea
              value={highlight.content}
              onChange={(e) => setHighlight({ ...highlight, content: e.target.value })}
              placeholder="내용을 입력하세요"
            />
          </div>

          {/* 태그 */}
          <div>
            <label>태그</label>
            <input
              type="text"
              value={highlight.tags}
              onChange={(e) => setHighlight({ ...highlight, tags: e.target.value })}
              placeholder="쉼표로 구분하여 입력"
            />
          </div>

          <button type="submit" disabled={isSubmit} className={isSubmit ? "submit loading" : "submit"}>
            {isSubmit ? "업로드 중..." : "게시글 등록"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteHighlight;
