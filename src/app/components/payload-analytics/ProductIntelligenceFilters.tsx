"use client";


import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, Tags, Activity, XCircle } from 'lucide-react';

interface FilterProps {
  categories: { id: string; name: string }[];
}

export default function ProductIntelligenceFilters({ categories }: FilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCat = searchParams.get('category') || "";
  const currentTrend = searchParams.get('trend') || "";

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1'); // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const inputStyles = "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-bold dark:text-white focus:ring-2 focus:ring-brand-primary outline-none transition-all cursor-pointer";

  return (
    <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-4xl border dark:border-white/5">
      <div className="flex items-center gap-2 px-2 border-r dark:border-white/10 pr-4">
        <Filter size={16} className="text-brand-primary" />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Filters</span>
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-2">
        <Tags size={14} className="text-gray-400" />
        <select 
          value={currentCat} 
          onChange={(e) => updateUrl('category', e.target.value)}
          className={inputStyles}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* Trend Dropdown */}
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-gray-400" />
        <select 
          value={currentTrend} 
          onChange={(e) => updateUrl('trend', e.target.value)}
          className={inputStyles}
        >
          <option value="">All Trends</option>
          <option value="STAR">⭐ Rising Stars</option>
          <option value="FALLING">📉 Falling Stars</option>
          <option value="OOS">🚫 Out of Stock</option>
        </select>
      </div>

      {/* Reset Button */}
      {(currentCat || currentTrend) && (
        <button 
          onClick={() => router.push(pathname)}
          className="ml-auto flex items-center gap-2 text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-all"
        >
          <XCircle size={14} /> Clear All
        </button>
      )}
    </div>
  );
}