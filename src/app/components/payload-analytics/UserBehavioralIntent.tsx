"use client";


import { Target, Search, Users2, BarChart3 } from 'lucide-react';

interface Props {
  data: {
    loyaltyIndex: number;
    trendingKeywords: string[];
    categoryPulse: { name: string, count: number }[];
    newCustomerRate: number;
  };
}

export default function UserBehavioralIntent({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Target className="text-brand-primary" size={24}/> Behavioral Intent
        </h3>
        <span className="text-[9px] font-black bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md uppercase tracking-widest">
            AI Patterns Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        
        {/* SECTION A: SEARCH INTENT & KEYWORDS */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Search size={14} className="text-brand-primary"/> Discovery Trends
          </p>
          <div className="flex flex-wrap gap-2">
            {data.trendingKeywords.length > 0 ? data.trendingKeywords.map((word, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[10px] font-black text-gray-600 dark:text-gray-300 hover:border-brand-primary hover:text-brand-primary transition-all cursor-help">
                #{word.toUpperCase()}
              </span>
            )) : <p className="text-xs text-gray-500 italic">No trending data available.</p>}
          </div>
        </div>

        {/* SECTION B: LOYALTY GAUGE */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <Users2 size={14} className="text-brand-primary"/> Retention Index
          </p>
          <div className="relative pt-2">
             <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Loyalty Score</span>
                <span className="text-xl font-black text-brand-primary tracking-tighter">{data.loyaltyIndex}%</span>
             </div>
             <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-brand-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]" 
                  style={{ width: `${data.loyaltyIndex}%` }}
                ></div>
             </div>
             <p className="text-[9px] text-gray-400 mt-2 font-medium">New Customer Rate: <span className="dark:text-white">{data.newCustomerRate}%</span></p>
          </div>
        </div>

        {/* SECTION C: CATEGORY CONCENTRATION HEATMAP */}
        <div className="md:col-span-2 space-y-4 pt-6 border-t dark:border-gray-800">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <BarChart3 size={14} className="text-brand-primary"/> Inventory Concentration
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {data.categoryPulse.map((cat, i) => (
              <div key={i} className="relative group/item h-14 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex flex-col items-center justify-center border border-transparent hover:border-brand-primary/30 transition-all cursor-default">
                <span className="text-sm font-black dark:text-white leading-none">{cat.count}</span>
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter mt-1">{cat.name}</span>
                {/* Micro-indicator Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-brand-primary/20 w-full rounded-b-2xl overflow-hidden">
                    <div className="h-full bg-brand-primary transition-all duration-700" style={{ width: `${Math.min(100, (cat.count / 20) * 100)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}