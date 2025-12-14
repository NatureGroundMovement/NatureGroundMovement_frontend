import { useState } from "react";
import { useAuth } from "../contexts/AuthProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import "../css/ReportButton.css";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useAxios } from "../contexts/useAxios";
import useWindowWidth from "./useWindowWidth";

const ReportButton = ({ targetId, targetType, postId }) => {
  const { userUuid } = useAuth();
  const [reportMode, setReportMode] = useState(false);
  const [reportStep, setReportStep] = useState(1);
  const [reason, setReason] = useState(null);
  const [detail, setDetail] = useState("");
  const width = useWindowWidth();
  const isMobile = width < 768;
  const api = useAxios();

  const reportReasons = [
    "스팸/광고",
    "욕설/비방/혐오 표현",
    "음란물/부적절한 콘텐츠",
    "개인정보 노출",
    "사칭/허위 정보",
    "위협/폭력 조장",
    "불법 행위 관련 내용",
    "기타"
  ];

  const handleReport = async () => {
    if (!userUuid) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    if (!reason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    try {
      const res = await api.post(
        "/api/reactions/report",
        {
          targetId,
          targetType,
          reason,
          detail,
          userUuid,
          postId
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || "신고 실패");
      }

      alert("신고가 접수되었습니다.");
      setReportMode(false);
      setReportStep(1);
      setReason(null);
      setDetail("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="report-container">
      <button onClick={() => {setReportMode(true);setReportStep(1);setReason(null);setDetail("");}} className="report-btn">
        <FontAwesomeIcon icon={faBell} /> 신고
      </button>

      {reportMode && (
        <div className="overlay">
          <div className="report-mode">
            <div className="report-header">
              <h3>신고</h3>
              <button>
                <FontAwesomeIcon icon={faX} onClick={() => setReportMode(false)} />
              </button>
            </div>

            <div className={`report-content ${reportStep === 1 ? "" : "sec"}`}>
              {reportStep === 1 && (
                <>
                  {reportReasons.map((r, idx) => (
                    <li
                      key={idx}
                      className={reason === r ? "selected" : ""}
                      onClick={() => setReason(r)}
                    >
                      {r}
                    </li>
                  ))}
                </>
              )}

              {reportStep === 2 && (
                <>
                  <label>구체적인 사유</label>
                  <textarea
                    placeholder="구체적인 신고 사유를 입력해 주세요."
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                  />
                </>
              )}
            </div>

            <div className={`report-footer ${reportStep === 1 ? "" : "sec"}`}>
              {reportStep === 1 ? (
                <button
                  onClick={() => {
                    if (!reason) {
                      alert("신고 사유를 선택해주세요.");
                      return;
                    }
                    setReportStep(2);
                  }}
                >
                  다음 <FontAwesomeIcon icon={faAngleRight} />
                </button>
              ) : (
                <>
                  <button onClick={() => setReportStep(1)}><FontAwesomeIcon icon={faAngleLeft} /> 뒤로</button>
                  <button className="report-completed" onClick={handleReport}>
                    신고 완료 <FontAwesomeIcon icon={faBell} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportButton;
