// 📊 TrafficSourceChart.tsx
"use client";

import{ useState, useEffect } from 'react';
import Link from 'next/link'; // ✅ Added for navigation
import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend, } from 'recharts';
import { ArrowUpRight } from 'lucide-react';

interface TrafficData {
  name: string;
  value: number;
  orders: number;
  fill: string;
}

export default function TrafficSourceChart({ data }: { data: TrafficData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-full min-h-100 w-full bg-gray-50 dark:bg-gray-800/50 rounded-3xl animate-pulse" />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter">Attribution Audit</h3>
        <p className="text-xs text-gray-500 font-medium italic leading-none mt-1">Revenue Share by Traffic Source</p>
      </div>

      <div className="flex-1 w-full min-h-62.5">
        <ResponsiveContainer width="99%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={10}
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                border: '1px solid #1f2937', 
                borderRadius: '16px', 
                padding: '12px'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: any) => [`Rs. ${Number(value || 0).toLocaleString()}`, 'Revenue']}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              iconType="diamond"
              iconSize={10}
              formatter={(value: string) => (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ FIX: Added Link to Marketing Hub Hub */}
      <div className="mt-6 pt-4 border-t dark:border-gray-800">
        <Link 
          href="/admin/marketing-hub" 
          className="w-full py-3 bg-gray-50 dark:bg-white/5 rounded-xl border dark:border-white/5 flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all shadow-sm"
        >
          Open Marketing Hub <ArrowUpRight size={14}/>
        </Link>
      </div>
    </div>
  );
}