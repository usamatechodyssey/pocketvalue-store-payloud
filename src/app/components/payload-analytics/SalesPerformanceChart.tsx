"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-brand-primary/30 p-5 rounded-2xl shadow-[0_0_30px_rgba(var(--brand-primary-rgb),0.2)] backdrop-blur-xl z-50">
        <p className="text-gray-400 text-[10px] font-black uppercase mb-3 tracking-[0.2em] border-b border-white/10 pb-2">{label}</p>
        <div className="space-y-3">
            <div className="flex justify-between items-center gap-8">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Gross Revenue</span>
                <span className="text-brand-primary font-black text-xl italic">Rs. {payload[0].value?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center gap-8">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Order Volume</span>
                <span className="text-blue-400 font-black text-lg">{payload[1].value} <small className="text-[8px]">PKTS</small></span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesPerformanceChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="h-112.5 w-full bg-gray-900 rounded-3xl animate-pulse border border-white/5" />;

  return (
    <div className="bg-white dark:bg-[#050505] p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl h-full min-h-112.5 flex flex-col group overflow-hidden">
      
      {/* HEADER SECTION - High Contrast */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none italic">
            Sales Velocity Engine
          </h3>
          <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest opacity-60">Real-time Performance Monitoring</p>
        </div>
        <div className="flex items-center gap-6 bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border dark:border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-primary shadow-[0_0_10px_#D11111]"></div>
                <span className="text-[10px] font-black dark:text-gray-300 uppercase tracking-widest">Revenue</span>
            </div>
            <div className="flex items-center gap-2 border-l dark:border-white/10 pl-6">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                <span className="text-[10px] font-black dark:text-gray-300 uppercase tracking-widest">Volume</span>
            </div>
        </div>
      </div>

      {/* CHART BODY - Overflow Fixed with min-w-0 */}
      <div className="flex-1 w-full min-w-0 overflow-visible pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="glowRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="glowOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#1f2937" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4b5563', fontSize: 10, fontWeight: '900' }} 
                dy={15}
              />
              <YAxis hide domain={['auto', 'dataMax + 1000']} />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#ffffff20', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--brand-primary)" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#glowRev)" 
                animationDuration={2000}
                activeDot={{ r: 8, strokeWidth: 0, fill: 'var(--brand-primary)' }}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6" 
                strokeWidth={5} 
                fillOpacity={1} 
                fill="url(#glowOrders)" 
                animationDuration={2500}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#3b82f6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}