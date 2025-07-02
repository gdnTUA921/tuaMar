import { BarChart } from '@mui/x-charts/BarChart';

const COLORS = {
  Textbooks: '#4CAF50',
  Electronics: '#1976D2',
  Uniforms: '#FF9800',
  'School Supplies': '#9C27B0',
  Foods: '#00BCD4',
  Collectibles: '#E91E63',
  Others: '#607D8B'
};

const ItemsByCategoryChart = ({ data }) => {
  const allCategories = ['Textbooks', 'Electronics', 'Uniforms', 'School Supplies', 'Foods', 'Collectibles', 'Others'];

  const dataMap = Object.fromEntries(allCategories.map(c => [c, 0]));
  data.forEach(item => {
    const key = allCategories.includes(item.category) ? item.category : 'Others';
    dataMap[key] += parseInt(item.count, 10) || 0;
  });

  const series = allCategories.map(category => ({
    label: category,
    data: [dataMap[category]],
    color: COLORS[category]
  }));

  return (
    <div style={{ width: '100%' }}>
      <BarChart
        xAxis={[{ scaleType: 'band', data: ['Categories'] }]}
        yAxis={[
          {
            min: 0,
            tickMinStep: 1,
            valueFormatter: v => Number.isInteger(v) ? v.toString() : ''
          }
        ]}
        series={series}
        tooltip={{
          valueFormatter: (v) => parseInt(v).toString()
        }}
        height={400}
        grid={{ horizontal: false, vertical: false }}
      />
    </div>
  );
};


export default ItemsByCategoryChart;
