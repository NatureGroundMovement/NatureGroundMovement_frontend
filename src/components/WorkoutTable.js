import "../css/WorkoutTable.css";

const WorkoutTable = ({ workouts }) => {
  if (!workouts || workouts.length === 0) {
    return <p className="no-workout">운동이 없습니다.</p>;
  }

  return (
    <table className="workout-table">
      <thead>
        <tr>
          <th style={{ width: "25%" }}>운동명</th>
          <th>중량(kg)</th>
          <th>횟수</th>
          <th>세트</th>
          <th>휴식(초)</th>
        </tr>
      </thead>
      <tbody>
        {workouts.map((w) => (
          <tr
            key={w.id}
          >
            <td>{w.exercise}</td>
            <td>{w.weight}</td>
            <td>{w.reps}</td>
            <td>{w.sets}</td>
            <td>{w.rest}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WorkoutTable;
