import React from 'react';
import { Bar } from 'react-chartjs-2';

interface HorizontalBarChartProps {
  data: { name: string; count: number }[];
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.name),
    datasets: [{
      label: 'Số lượng tài sản',
      data: data.map(d => d.count),
      backgroundColor: '#3B82F6',
      borderRadius: 4
    }]
  };

  return (
    <div style={{ height: '350px' }}>
      <Bar data={chartData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};