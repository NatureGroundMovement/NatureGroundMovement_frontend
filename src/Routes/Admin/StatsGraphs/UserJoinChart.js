import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const UserJoinChart = ({ monthlyJoin, total }) => {
  const data = monthlyJoin.map(item => ({
    month: item._id,
    count: item.count
  }));

  return (
    <div className="chart-wrapper">
      <h3>
        월별 신규 가입자 (총 {total.toLocaleString()}명)
      </h3>

      <ResponsiveContainer width="100%" height="100%" >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#4a86e8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserJoinChart;