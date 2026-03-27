"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Calendar, ChevronDown, Clock, Filter } from 'lucide-react';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

const QUICK_RANGES = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: 'Year to Date', getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
];

export default function AnalyticsDateRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Current Active Range Label
  const activeLabel = searchParams.get('rangeLabel') || 'Today';

  const handleRangeSelect = (label: string, from: Date, to: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('from', format(from, 'yyyy-MM-dd'));
    params.set('to', format(to, 'yyyy-MM-dd'));
    params.set('rangeLabel', label);
    params.delete('page'); // Reset pagination on date change

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary group-hover:scale-110 transition-transform">
            <Calendar size={16} strokeWidth={2.5}/>
        </div>
        <div className="text-left hidden sm:block">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Timeframe</p>
            <p className="text-xs font-bold dark:text-white leading-none">{activeLabel}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-4xl shadow-2xl z-100 p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
           <div className="flex items-center gap-2 mb-4 px-2">
              <Filter size={12} className="text-brand-primary" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Audit Range</span>
           </div>
           
           <div className="grid grid-cols-1 gap-1">
              {QUICK_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    const { from, to } = range.getValue();
                    handleRangeSelect(range.label, from, to);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group/btn ${
                    activeLabel === range.label 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {range.label}
                  <Clock size={12} className={`opacity-0 group-hover/btn:opacity-100 transition-opacity ${activeLabel === range.label ? 'hidden' : ''}`} />
                </button>
              ))}
           </div>

           {/* Custom Range Placeholder (Future Feature) */}
           <div className="mt-4 pt-4 border-t dark:border-white/5 px-2">
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter italic">
                * Real-time sync with MongoDB Core
              </p>
           </div>
        </div>
      )}
    </div>
  );
}