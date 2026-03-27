"use client";


import Link from 'next/link'; // ✅ FIX: Correct import for navigation
import { Trophy, ArrowUpRight } from 'lucide-react';

interface TopProduct {
  name: string;
  variantName: string;
  totalSold: number;
  revenue: number;
}

export default function TopProductsList({ products }: { products: TopProduct[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <Trophy className="text-yellow-500" size={20} /> MVP Products
        </h3>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-2 py-1 rounded">Top 5</span>
      </div>

      {/* PRODUCTS LIST */}
      <div className="space-y-4 flex-1">
        {products.length > 0 ? (
          products.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-brand-primary/20 transition-all group/item"
            >
              <div className="flex gap-3 items-center">
                <span className="text-xl font-black text-gray-200 dark:text-gray-700 italic group-hover/item:text-brand-primary transition-colors">
                  0{i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold dark:text-white line-clamp-1 uppercase tracking-tight">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase font-black opacity-60">
                    {p.variantName}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-brand-primary">
                  {p.totalSold} sold
                </p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                  Rs. {p.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center italic text-gray-500 text-xs">
            No sales data for this period.
          </div>
        )}
      </div>

      {/* ✅ FIX: Button moved OUTSIDE the loop to the bottom of the card */}
      <div className="mt-6 pt-4 border-t dark:border-gray-800">
        <Link
          href="/admin/product-intelligence"
          className="w-full py-3.5 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5 flex justify-center items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all shadow-sm"
        >
          Open Intelligence Hub <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}