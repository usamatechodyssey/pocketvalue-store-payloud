"use client";

import  { useState, useEffect } from 'react';
import { Radio, Smartphone, Activity } from 'lucide-react';
import { PieChart, Pie, ResponsiveContainer, Tooltip } from 'recharts';

export default function LiveRadar({ activeCount, deviceData }: { activeCount: number, deviceData: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-100 w-full bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] animate-pulse" />;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl h-full flex flex-col group overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-[0.3em]">
            <Radio size={12} className="animate-ping" /> Live Radar
          </div>
          <h3 className="text-4xl font-black dark:text-white mt-2 tracking-tighter">{activeCount}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Users Online Now</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/10">
            <Activity className="text-brand-primary" />
        </div>
      </div>

      <div className="flex-1 min-h-50 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deviceData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              // ✅ FIX: Cell hata kar direct data se 'fill' uthayega
              isAnimationActive={true}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
              itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <Smartphone size={24} className="text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t dark:border-white/5">
         {deviceData.map((d, i) => (
           <div key={i} className="text-center">
              <p className="text-[8px] font-black text-gray-500 uppercase">{d.name}</p>
              <p className="text-xs font-bold dark:text-white">{d.value}</p>
           </div>
         ))}
      </div>
    </div>
  );
}