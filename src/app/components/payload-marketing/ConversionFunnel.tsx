"use client";

import { ChevronRight, ArrowDown, Info } from 'lucide-react';

export default function ConversionFunnel({ steps }: { steps: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl h-full">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">The Leaky Bucket <span className="text-gray-500 text-xs lowercase italic">(Sales Funnel)</span></h3>
        <Info size={16} className="text-gray-400 cursor-help" />
      </div>

      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <div className="flex justify-between items-end mb-2 px-1">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{step.label}</span>
                <span className="text-sm font-black dark:text-white">{step.value.toLocaleString()} <small className="text-[9px] text-brand-primary opacity-60">{step.percentage}%</small></span>
            </div>
            
            <div className="h-4 w-full bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden border dark:border-white/5 shadow-inner">
                <div 
                    className="h-full bg-linear-to-r from-brand-primary/40 to-brand-primary transition-all duration-1000 ease-out"
                    style={{ width: `${step.percentage}%` }}
                ></div>
            </div>

            {i < steps.length - 1 && (
                <div className="flex justify-center my-1 opacity-20">
                    <ArrowDown size={12} className="text-gray-400" />
                </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 p-4 bg-red-500/5 rounded-2xl border border-red-500/10 flex items-center justify-between">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Global Dropout Rate</p>
          <p className="text-xl font-black text-red-600">
            {steps.length > 0 ? (100 - steps[steps.length - 1].percentage).toFixed(1) : 0}%
          </p>
      </div>
    </div>
  );
}