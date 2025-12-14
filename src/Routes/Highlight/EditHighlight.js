import "../../css/Write.css";
import { useState, useEffect } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storageService } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthProvider";
import { useParams, useNavigate } from "react-router-dom";
import { useAxios } from "../../contexts/useAxios";
import { v4 as uuid } from "uuid";

const EditHighlight = () => {
  const { postId } = useParams(); // highlightId
  const navigate = useNavigate();
  const { userUuid, userRole, uid } = useAuth();

  const [highlight, setHighlight] = useState({
    title: "",
    content: "",
    tags: [],
    videoUrl: "",
    thumbnailUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const api = useAxios();

  // ✅ 기존 데이터 불러오기
  useEffect(() => {
    const fetchHighlight = async () => {
      try {
        const res = await api.get(`/api/highlights/${postId}`);
        const data = res.data;

        setHighlight({
          title: data.title || "",
          content: data.content || "",
          tags: (data.tags || []).join(", "),
          videoUrl: data.videoUrl || "",
          thumbnailUrl: data.thumbnailUrl || "",
        });
        setThumbnailPreview(data.thumbnailUrl || null);
      } catch (error) {
        console.error("🚨 하이라이트 불러오기 실패:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchHighlight();
  }, [postId]);

  // ✅ 썸네일 업로드
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageRef = ref(storageService, `highlightFiles/${uid}/${uuid()}`);
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      setHighlight((prev) => ({ ...prev, thumbnailUrl: downloadURL }));
      setThumbnailPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error("🚨 썸네일 업로드 실패:", error);
      alert("썸네일 업로드 중 오류가 발생했습니다.");
    }
  };

  // ✅ 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(
        `/api/highlights/${postId}`,
        {
          title: highlight.title,
          content: highlight.content,
          thumbnailUrl: highlight.thumbnailUrl,
          tags: highlight.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
          userUuid,
          userRole
        },
      );

      alert("하이라이트가 수정되었습니다!");
      navigate(`/highlight/${postId}`);
    } catch (error) {
      console.error("🚨 수정 실패:", error);
      alert(error.response?.data?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div />;

  return (
    <div className="write-container">
      <div className="write-content">
        <h1 className="title">✏️ 하이라이트 수정</h1>

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

          <div>
            <label>기존 썸네일</label>
            {thumbnailPreview && (
              <div>
                <img src={thumbnailPreview} alt="thumbnail" className="thumbnail-preview"/>
              </div>
            )}
          </div>

          {/* 썸네일 업로드 */}
          <div>
            <label>썸네일 이미지 (선택)</label>
            <div className="file-input-row">
              <input type="file" accept="image/*" onChange={handleThumbnailUpload} disabled={saving} />
            </div>
          </div>

          {/* 영상 미리보기 (수정 불가) */}
          <div>
            <label>영상 (수정 불가)</label>
            <div>
              {highlight.videoUrl ? (
                <video src={highlight.videoUrl} controls width="100%" className="highlgiht-preview" />
              ) : (
                <p>🎥 영상 없음</p>
              )}
            </div>
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

          <button type="submit" disabled={saving} className="submit">
            {saving ? "업로드 중..." : "수정 완료"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditHighlight;
