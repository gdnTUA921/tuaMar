import { BarChart } from '@mui/x-charts/BarChart';

const COLORS = {
  CEIS: '#4CAF50',
  SLCN: '#2196F3',
  IBAM: '#FF9800',
  CMT: '#9C27B0',
  CAHS: '#00BCD4',
  CASE: '#E91E63',
  Others: '#607D8B'
};

const UsersByCollegeChart = ({ data }) => {
  // Default all known colleges, even if some aren't present
  const allColleges = ['CEIS', 'SLCN', 'IBAM', 'CMT', 'CAHS', 'CASE', 'Others'];

  // Turn data into a lookup for count per college
  const dataMap = Object.fromEntries(allColleges.map(c => [c, 0]));

  data.forEach(item => {
    const key = allColleges.includes(item.college) ? item.college : 'Others';
    dataMap[key] += parseInt(item.students, 10) || 0; // ← fix applied
  });


  // Now build one series per college
  const series = allColleges.map((college, index) => ({
    label: college,
    data: [dataMap[college]],
    color: COLORS[college]
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <BarChart
        xAxis={[{ scaleType: 'band', data: ['Colleges'] }]}
        yAxis={[
          {
            min: 0,
            tickMinStep: 1,
            valueFormatter: value => Number.isInteger(value) ? value.toString() : ''
          }
        ]}
        series={series}
        height={400}
      />
    </div>
  );
};

export default UsersByCollegeChart;
