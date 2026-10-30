import React from 'react';
import { Pie } from 'react-chartjs-2';

interface PieChartProps {
  data: { label: string; value: number }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      data: data.map(d => d.value),
      backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6']
    }]
  };

  return (
    <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
      <Pie data={chartData} options={{ maintainAspectRatio: false }} />
    </div>
  );
};