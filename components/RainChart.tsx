import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { time: '现在', rain: 20 },
  { time: '10分', rain: 45 },
  { time: '20分', rain: 80 },
  { time: '30分', rain: 95 },
  { time: '40分', rain: 60 },
  { time: '50分', rain: 30 },
  { time: '60分', rain: 10 },
];

const RainChart: React.FC = () => {
  return (
    <div className="w-full h-56 rounded-2xl p-6 glass-card border border-white/40 shadow-sm bg-white/30">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold text-slate-700">未来一小时降雨趋势</h3>
        <span className="text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-full border border-white/50 shadow-sm">实时雷达</span>
      </div>
      <ResponsiveContainer width="100%" height="100%" className="-ml-2">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.5} />
          <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#2563eb' }}
            formatter={(value: number) => [`${value}%`, '降雨概率']}
            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey="rain"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRain)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RainChart;