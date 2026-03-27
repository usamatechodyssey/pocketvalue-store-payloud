"use client";


import { Crown, UserMinus, UserPlus, Fingerprint } from 'lucide-react';

interface Props {
  data: {
    retentionRate: number;
    churnRate: number;
    segments: { champions: number; atRisk: number; newbies: number; };
    totalActiveBase: number;
  };
}

export default function LoyaltyIntelligence({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Fingerprint className="text-purple-500" size={22}/> Loyalty Science
        </h3>
        <div className="px-2 py-1 bg-purple-500/10 rounded-md border border-purple-500/20">
             <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Customer Churn AI</span>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {/* Retention Meter */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border dark:border-gray-700">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Retention Health</p>
            <h4 className="text-3xl font-black text-brand-primary">{data.retentionRate}%</h4>
            <div className="mt-3 h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)] transition-all duration-1000" style={{ width: `${data.retentionRate}%` }}></div>
            </div>
        </div>

        {/* Segmentation Grid */}
        <div className="grid grid-cols-3 gap-3">
            {/* Champions (VIP) */}
            <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-center">
                <Crown size={16} className="text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-black dark:text-white leading-none">{data.segments.champions}</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">VIPs</p>
            </div>
            {/* Newbies */}
            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                <UserPlus size={16} className="text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-black dark:text-white leading-none">{data.segments.newbies}</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">Newbies</p>
            </div>
            {/* At Risk */}
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
                <UserMinus size={16} className="text-red-500 mx-auto mb-1" />
                <p className="text-lg font-black dark:text-white leading-none">{data.segments.atRisk}</p>
                <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">At Risk</p>
            </div>
        </div>

        {/* Churn Alert */}
        <div className="mt-auto p-3 bg-red-500/5 rounded-xl border border-red-500/10 flex items-center justify-between">
            <p className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Churn Rate (30 Days)</p>
            <p className="text-sm font-black text-red-600">{data.churnRate}%</p>
        </div>
      </div>
    </div>
  );
}