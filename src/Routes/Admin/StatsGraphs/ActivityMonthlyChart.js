import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const ActivityMonthlyChart = ({ monthly, actionLabels }) => {
  // 액션별 Bar 표시를 위해 데이터 재구성
  const data = monthly.reduce((acc, item) => {
    const month = item._id.month;
    const action = item._id.action;
    const existing = acc.find(d => d.month === month);

    if (existing) {
      existing[action] = item.count;
    } else {
      acc.push({ month, [action]: item.count });
    }

    return acc;
  }, []);

  // 모든 액션 종류
  const actions = [...new Set(monthly.map(item => item._id.action))];

  return (
    <div className="chart-wrapper">
      <h3>월별 액션량</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, actionLabels[name] || name]}/>
          <Legend formatter={(value) => actionLabels[value] || value}/>
          {actions.map((action, i) => (
            <Bar key={action} dataKey={action} fill={["#4a86e8", "#e84a4a", "#82ca9d", "#ffc658"][i % 8]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityMonthlyChart;