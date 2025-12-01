import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostBreakdown } from '../types';

interface CostChartProps {
  cost: CostBreakdown;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CostChart: React.FC<CostChartProps> = ({ cost }) => {
  const data = [
    { name: '大交通 (Flights/Train)', value: cost.transportation },
    { name: '小交通 (Local)', value: cost.localTransport },
    { name: '住宿 (Stay)', value: cost.accommodation },
    { name: '餐饮 (Food)', value: cost.food },
    { name: '门票 (Tickets)', value: cost.tickets },
  ].filter(d => d.value > 0);

  return (
    <div className="w-full h-64 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">费用预估 ({cost.currency})</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value} ${cost.currency}`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostChart;