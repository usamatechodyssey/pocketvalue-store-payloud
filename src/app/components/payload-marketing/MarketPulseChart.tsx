"use client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MarketPulseChart({ data }: { data: any[] }) {
  return (
    <div className="bg-gray-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-112.5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="h-40 w-40 bg-brand-primary rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 mb-10 flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Conversion Velocity</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Real-Time Behavioral Analytics</p>
        </div>
        <div className="text-right font-mono">
            <p className="text-3xl font-black text-brand-primary leading-none">2.4%</p>
            <p className="text-[10px] text-green-500 font-bold">+0.4% vs Prev Hour</p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="70%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
          <XAxis dataKey="time" stroke="#444" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="rate" 
            stroke="#f97316" 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorPulse)" 
            animationDuration={3000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}