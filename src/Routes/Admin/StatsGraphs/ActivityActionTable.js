const ActivityActionTable = ({ activity, actionLabels }) => {
  const data = activity.byAction;

  return (
    <div className="table-wrapper">
      <h3>액션별 활동량</h3>

      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id}>
              <td>{actionLabels[row._id] || row._id}</td>
              <td>{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityActionTable;