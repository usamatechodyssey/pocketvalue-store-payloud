"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from "@/sanity/lib/image";
import { 
  TrendingUp, TrendingDown, Minus, AlertCircle, 
  Edit3, Search, MousePointer2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductIntelItem, getProductDrillDownPayload } from '@/app/actions/payloadProductIntelligenceActions';
import ProductDrillDownModal from './ProductDrillDownModal';

export default function ProductIntelligenceContent({ data }: { data: ProductIntelItem[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 Logic: Fetch product story and open modal
  const handleDrillDown = async (id: string) => {
    if (isLoading) return;
    setIsLoading(true);
    const t = toast.loading("Accessing Product Records...");
    
    try {
      const result = await getProductDrillDownPayload(id);
      if (result) {
        setDrillDownData(result);
        setIsModalOpen(true);
        toast.success("Intelligence Data Loaded", { id: t });
      } else {
        toast.error("Failed to fetch drill-down data", { id: t });
      }
    } catch (error) {
      toast.error("Engine Error", { id: t });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50/50 dark:bg-white/5 text-gray-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="p-6 text-left">Product / Intelligence</th>
                <th className="p-6 text-center">Trend Pulse</th>
                <th className="p-6 text-right">Revenue Share</th>
                <th className="p-6 text-center">Return Risk</th>
                <th className="p-6 text-center">Current Stock</th>
                <th className="p-6 text-right">Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-brand-primary/5 transition-all duration-300">
                  
                  {/* 1. Product Info - Clickable for Drill-down */}
                  <td className="p-6 cursor-pointer" onClick={() => handleDrillDown(item.id)}>
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 shadow-sm group-hover:scale-110 transition-transform">
                          {item.image && <Image src={urlFor(item.image).url()} alt="" fill className="object-contain p-1"/>}
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-gray-900 dark:text-white line-clamp-1 uppercase tracking-tight max-w-62.5">{item.name}</p>
                            <MousePointer2 size={10} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest italic">{item.category}</p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Trend (Star vs Falling) */}
                  <td className="p-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                          <div className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full ${
                              item.trend === 'STAR' ? 'bg-green-500/10 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 
                              item.trend === 'FALLING' ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-400'
                          }`}>
                              {item.trend === 'STAR' ? <TrendingUp size={12}/> : item.trend === 'FALLING' ? <TrendingDown size={12}/> : <Minus size={12}/>}
                              {item.growth > 0 ? `+${item.growth}%` : `${item.growth}%`}
                          </div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 opacity-60">{item.currentUnitsSold} units</p>
                      </div>
                  </td>

                  {/* 3. Revenue & Share */}
                  <td className="p-6 text-right">
                      <p className="text-lg font-black text-brand-primary tracking-tighter italic">Rs. {item.revenue.toLocaleString()}</p>
                      <div className="mt-2 flex items-center justify-end gap-2">
                          <div className="w-12 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-primary" style={{ width: `${item.revenueContribution}%` }}></div>
                          </div>
                          <span className="text-[9px] font-black text-gray-400 tracking-tighter">{item.revenueContribution}% share</span>
                      </div>
                  </td>

                  {/* 4. Return Rate */}
                  <td className="p-6 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                          item.returnRate > 15 ? 'text-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'text-gray-400 bg-gray-50 dark:bg-gray-800'
                      }`}>
                          {item.returnRate > 15 && <AlertCircle size={10}/>}
                          {item.returnRate}% <span className="opacity-40 ml-1 italic font-medium lowercase">returns</span>
                      </div>
                  </td>

                  {/* 5. Inventory Risk */}
                  <td className="p-6 text-center">
                      <div className="space-y-1">
                          <p className={`text-sm font-black ${item.currentStock <= 0 ? 'text-red-500 animate-pulse' : 'dark:text-gray-200'}`}>
                              {item.currentStock} <small className="text-[9px] opacity-40 uppercase">pcs</small>
                          </p>
                          {item.trend === 'STAR' && item.currentStock < 10 && (
                              <p className="text-[8px] font-black text-orange-500 uppercase">Risk: High Demand</p>
                          )}
                      </div>
                  </td>

                  {/* 6. Edit Action */}
                  <td className="p-6 text-right">
                    <Link href={`/admin/collections/products/${item.id}`} className="inline-flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-brand-primary/30 hover:text-brand-primary transition-all">
                      <Edit3 size={16}/>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER DRILL-DOWN MODAL */}
      <ProductDrillDownModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={drillDownData} 
      />
    </div>
  );
}