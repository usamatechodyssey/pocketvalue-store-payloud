"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ConversionPulseChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-950 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-900 shadow-2xl h-100">
      <div className="mb-6">
        <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter">Conversion Velocity Pulse</h3>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time Market Analytics</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
          <XAxis dataKey="time" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} unit="%" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
            itemStyle={{ color: '#f97316' }}
          />
          <Area 
            type="monotone" 
            dataKey="rate" 
            stroke="#f97316" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorPulse)" 
            animationDuration={2000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}