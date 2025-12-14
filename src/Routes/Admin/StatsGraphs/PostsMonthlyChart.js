import {
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const PostsMonthlyChart = ({ monthlyPosts, totalPosts }) => {
  // monthlyPosts = { diary: [...], routine: [...], highlight: [...], community: [...] }

  // 모든 month 추출
  const monthsSet = new Set();
  Object.values(monthlyPosts).forEach(list =>
    list.forEach(item => monthsSet.add(item._id))
  );
  const months = [...monthsSet].sort();

  // 그래프용 데이터 구조화
  const data = months.map(month => {
    const row = { month };
    for (const key of Object.keys(monthlyPosts)) {
      const found = monthlyPosts[key].find(i => i._id === month);
      row[key] = found ? found.count : 0;
    }
    return row;
  });

  return (
    <div className="chart-wrapper">
      <h3>게시물 월별 생성량</h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar dataKey="diary" fill="#4a86e8" name="일지" />
          <Bar dataKey="routine" fill="#34d399" name="루틴" />
          <Bar dataKey="highlight" fill="#fbbf24" name="하이라이트" />
          <Bar dataKey="community" fill="#f87171" name="커뮤니티" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PostsMonthlyChart;