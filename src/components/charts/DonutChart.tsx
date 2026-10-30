import React from 'react';
import { Doughnut } from 'react-chartjs-2';

interface DonutChartProps {
  data: { label: string; value: number }[];
}

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']
    }]
  };

  return (
    <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
      <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
    </div>
  );
};