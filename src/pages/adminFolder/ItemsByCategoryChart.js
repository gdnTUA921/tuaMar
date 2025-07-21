import { BarChart } from '@mui/x-charts/BarChart';

const COLORS = {
  'Books & Study Materials': '#4CAF50',
  'Electronics': '#1976D2',
  'Furniture & Home Essentials': '#FF9800',
  'Clothing & Accessories': '#9C27B0',
  'Transportation': '#00BCD4',
  'Food & Drinks': '#E91E63',
  'Services & Gigs': '#3F51B5',
  'Tickets & Events': '#8BC34A',
  'Hobbies & Toys': '#FFC107',
  'Housing & Rentals': '#009688',
  'Health & Beauty': '#F44336',
  'Announcements': '#9E9E9E',
  'Others': '#607D8B'
};

const ItemsByCategoryChart = ({ data }) => {
  const allCategories = [
  'Books & Study Materials',
  'Electronics',
  'Furniture & Home Essentials',
  'Clothing & Accessories',
  'Transportation',
  'Food & Drinks',
  'Services & Gigs',
  'Tickets & Events',
  'Hobbies & Toys',
  'Housing & Rentals',
  'Health & Beauty',
  'Announcements',
  'Others'
];

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
