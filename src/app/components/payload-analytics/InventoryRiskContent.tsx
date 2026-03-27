"use client";

import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle, Edit3, PackageSearch } from 'lucide-react';

export default function InventoryRiskContent({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-4 text-left">Product / Variant</th>
              <th className="p-4 text-left">SKU</th>
              <th className="p-4 text-center">Current Stock</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.length > 0 ? data.map((item, i) => (
              <tr key={i} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                        {item.image && <Image src={item.image} alt="" fill className="object-contain p-1"/>}
                    </div>
                    <div>
                        <p className="font-bold dark:text-white line-clamp-1">{item.productTitle}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{item.variantName}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs opacity-60">{item.sku}</td>
                <td className="p-4 text-center">
                   <span className="text-lg font-black text-red-600">{item.currentStock}</span>
                   <span className="text-[10px] text-gray-400 ml-1">PCS</span>
                </td>
                <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[9px] font-black uppercase">
                        <AlertTriangle size={10}/> Stock Critical
                    </div>
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/collections/products/${item.productId}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-xs font-bold text-brand-primary hover:shadow-md transition-all">
                    <Edit3 size={14}/> Update Stock
                  </Link>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={5} className="py-20 text-center">
                        <PackageSearch size={48} className="mx-auto opacity-10 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">All inventory levels are safe.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}