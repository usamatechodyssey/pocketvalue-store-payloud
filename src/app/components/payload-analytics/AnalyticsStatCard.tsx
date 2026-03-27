"use client";


import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number; // Percentage growth
  subtext?: string;
  colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export default function AnalyticsStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtext, 
  colorVariant = 'primary' 
}: StatCardProps) {

  // Color Mapping for Dynamic UI
  const colorMap = {
    primary: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20',
    success: 'text-green-500 bg-green-500/10 border-green-500/20',
    warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    error: 'text-red-500 bg-red-500/10 border-red-500/20',
    info: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className="relative group overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Background Decorative Glow (Dark Mode Only) */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${colorMap[colorVariant].split(' ')[0]}`}></div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
        </div>
        
        {/* Icon Wrapper */}
        <div className={`p-3 rounded-xl border ${colorMap[colorVariant]}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Trend Logic */}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 
            trend < 0 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 
            'bg-gray-100 text-gray-500'
          }`}>
            {trend > 0 ? <TrendingUp size={12}/> : trend < 0 ? <TrendingDown size={12}/> : <Minus size={12}/>}
            {Math.abs(trend)}%
          </div>
        )}
        
        {subtext && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate italic">{subtext}</p>
        )}
      </div>

      {/* Subtle Bottom Line Indicator */}
      <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${colorMap[colorVariant].split(' ')[0].replace('text-', 'bg-')}`}></div>
    </div>
  );
}