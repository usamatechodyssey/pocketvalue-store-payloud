"use client";


import { ShoppingCart, Users, BadgeDollarSign, ArrowUpRight } from 'lucide-react';

export default function RecoveryPulse({ stats }: { stats: any }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl h-full flex flex-col group">
      <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-2">
        <ShoppingCart className="text-brand-primary" size={24}/> Recovery Pulse
      </h3>

      <div className="space-y-6 flex-1">
        <div className="p-6 bg-brand-primary/5 rounded-4xl border border-brand-primary/10 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
            <div className="absolute -right-4 -top-4 opacity-5"><BadgeDollarSign size={80}/></div>
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Potential Revenue at Risk</p>
            <h4 className="text-3xl font-black dark:text-white">Rs. {stats.totalAbandonedValue.toLocaleString()}</h4>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/10">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Abandoned Carts</p>
                <p className="text-xl font-black dark:text-gray-200 mt-1">{stats.pendingCartCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/10">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Hot Leads (Captured)</p>
                <p className="text-xl font-black text-green-500 mt-1">{stats.leadsCaptured}</p>
            </div>
        </div>
      </div>

      <button className="w-full mt-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:opacity-90 transition-all flex justify-center items-center gap-2">
        Open Recovery CRM <ArrowUpRight size={14}/>
      </button>
    </div>
  );
}