import "./ReportTable.css";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../components/formatDate";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";

const ReportTable = ({ reports, isLoading, selectedIds, onSelectChange, deleteSelected }) => {
    const navigate = useNavigate();

    if (isLoading) return <Spinner />;
    if (reports?.length === 0) return <p className="no-reports">접수된 신고가 없습니다</p>;

    const allChecked = reports.length > 0 && reports.every(r => selectedIds.includes(r._id));

    const toggleAll = () => {
        if (allChecked) {
            onSelectChange([]); // 모두 해제
        } else {
            onSelectChange(reports.map(r => r._id)); // 모두 선택
        }
    };

    const toggleOne = (id) => {
        if (selectedIds.includes(id)) {
            onSelectChange(selectedIds.filter(item => item !== id));
        } else {
            onSelectChange([...selectedIds, id]);
        }
    };

    return (
        <div className="report-table-container">
            <button
                className={`delete-btn ${selectedIds.length === 0 ? "disabled" : ""}`}
                disabled={selectedIds.length === 0}
                onClick={deleteSelected}
            >
                선택 삭제 ({selectedIds.length})
            </button>
            <table className="report-table">
                <thead>
                    <tr>
                        <th className="check-box">
                            <input 
                                type="checkbox" 
                                checked={allChecked}
                                onChange={toggleAll}
                            />
                        </th>
                        <th>신고 사유</th>
                        <th>신고자</th>
                        <th>신고일</th>
                        <th>신고 내용</th>
                    </tr>
                </thead>

                <tbody>
                    {reports.map((r) => (
                        <tr
                            key={r._id}
                            onClick={() =>
                                navigate(
                                `/${r.targetType === "comment" ? "community" : r.targetType}/${r.targetType === "comment" ? r.postId : r.targetId}`
                                )
                            }
                        >
                            <td className="check-box">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(r._id)}
                                    onChange={() => toggleOne(r._id)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>

                            <td>
                                {r.reason}
                            </td>

                            <td
                                className="reporter"
                            >
                                <div className="profile">
                                    {r?.reporter.photoUrl ? (
                                        <img src={r?.reporter.photoUrl} alt="picture" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} className="icon" />
                                    )}
                                </div>
                                <p>{r.reporter.nickname}</p>
                            </td>

                            <td>
                                {formatDate(r.createdAt)}
                            </td>

                            <td>
                                {r.detail}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;
