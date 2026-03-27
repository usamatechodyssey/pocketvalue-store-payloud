"use client";


import { 
  Wallet, 
  TrendingUp, 
  Calculator, 
  Truck, 
  BadgePercent, 
  Landmark, 
  Target, 
  CheckCircle2 
} from 'lucide-react';

interface Props {
  data: {
    originalPrice: number;
    adSpend: number;
    platformFees: number;
    shipping: number;
    pureProfit: number;
    grossTotal: number;
    marginPercent: number;
  };
}

export default function PriceAnatomySurgeon({ data }: Props) {
  if (!data) return null;

  const total = data.grossTotal || 1;
  const costP = (data.originalPrice / total) * 100;
  const adsP = (data.adSpend / total) * 100;
  const feesP = (data.platformFees / total) * 100;
  const shipP = (data.shipping / total) * 100;
  const profitP = (data.pureProfit / total) * 100;

  const totalMarkupAndOperations = data.pureProfit + data.adSpend + data.platformFees + data.shipping;
  const grandTotalVerification = data.originalPrice + totalMarkupAndOperations;

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 lg:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl h-full flex flex-col group transition-all animate-in fade-in duration-1000">
      
      {/* HEADER - Responsive Flex */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h3 className="text-lg lg:text-xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Target className="text-brand-primary" size={24}/> FINANCIAL SURGEON
        </h3>
        <div className="text-[10px] font-black text-gray-500 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
            MODE: 5-BUCKET FULL AUDIT
        </div>
      </div>

      {/* --- WATERFALL VISUALIZER --- */}
      <div className="mb-10 overflow-hidden">
        <div className="flex justify-between text-[8px] sm:text-[9px] font-black mb-3 uppercase tracking-widest opacity-60">
            <span>Capital</span>
            <span>Ads</span>
            <span>Fees</span>
            <span>Ship</span>
            <span className="text-green-500 font-black">Gain</span>
        </div>
        <div className="h-10 sm:h-12 w-full bg-gray-100 dark:bg-gray-900 rounded-2xl flex overflow-hidden border-2 sm:border-4 border-white dark:border-gray-950 shadow-inner">
            <div className="h-full bg-gray-400 dark:bg-gray-700" style={{ width: `${costP}%` }}></div>
            <div className="h-full bg-blue-500" style={{ width: `${adsP}%` }}></div>
            <div className="h-full bg-purple-500" style={{ width: `${feesP}%` }}></div>
            <div className="h-full bg-orange-500" style={{ width: `${shipP}%` }}></div>
            <div className="h-full bg-green-500 relative" style={{ width: `${profitP}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
        </div>
      </div>

      {/* --- DATA BUCKETS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* 1. PURE NET PROFIT (Always Full Width) */}
        <div className="sm:col-span-2 lg:col-span-4 p-6 bg-green-500/5 dark:bg-green-500/10 rounded-[2.5rem] border-2 border-green-500/20 shadow-lg relative overflow-hidden group-hover:scale-[1.01] transition-transform">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
            <p className="text-[10px] sm:text-[11px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <TrendingUp size={14}/> PURE NET PROFIT (POCKET MONEY)
            </p>
            <div className="flex justify-between items-center flex-wrap gap-2">
                <h4 className="text-3xl sm:text-4xl lg:text-5xl font-black text-green-700 dark:text-green-500 tracking-tighter">Rs. {data.pureProfit.toLocaleString()}</h4>
                <div className="text-right">
                    <p className="text-[9px] font-black text-green-600/50 uppercase tracking-widest">Net Margin</p>
                    <p className="text-lg sm:text-xl font-black text-green-600">{data.marginPercent.toFixed(1)}%</p>
                </div>
            </div>
        </div>

        {/* 2. ORIGINAL COST */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-[9px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-3"><Wallet size={12}/> ORIGINAL COST</p>
            <h4 className="text-lg font-black dark:text-white leading-none">Rs. {data.originalPrice.toLocaleString()}</h4>
            <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">{costP.toFixed(1)}% OF REVENUE</p>
        </div>

        {/* 3. AD SPEND */}
        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <p className="text-[9px] font-bold text-blue-500 uppercase flex items-center gap-2 mb-3"><BadgePercent size={12}/> AD SPEND</p>
            <h4 className="text-lg font-black text-blue-600 leading-none">Rs. {data.adSpend.toLocaleString()}</h4>
            <p className="text-[9px] text-blue-400 mt-2 font-bold uppercase tracking-tighter">{adsP.toFixed(1)}% OF REVENUE</p>
        </div>

        {/* 4. PLATFORM FEES */}
        <div className="p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
            <p className="text-[9px] font-bold text-purple-400 uppercase flex items-center gap-2 mb-3"><Landmark size={12}/> BANK/PLATFORM</p>
            <h4 className="text-lg font-black text-purple-600 leading-none">Rs. {data.platformFees.toLocaleString()}</h4>
            <p className="text-[9px] text-purple-400 mt-2 font-bold uppercase tracking-tighter">{feesP.toFixed(1)}% OF REVENUE</p>
        </div>

        {/* 5. SHIPPING INCOME */}
        <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
            <p className="text-[9px] font-bold text-orange-400 uppercase flex items-center gap-2 mb-3"><Truck size={12}/> SHIPPING IN</p>
            <h4 className="text-lg font-black text-orange-600 leading-none">Rs. {data.shipping.toLocaleString()}</h4>
            <p className="text-[9px] text-orange-400 mt-2 font-bold uppercase tracking-tighter">{shipP.toFixed(1)}% OF REVENUE</p>
        </div>

        {/* 6. OPERATIONAL MARKUP (Responsive 2 cols) */}
        <div className="sm:col-span-4 p-5 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col justify-center gap-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TOTAL ADDED VALUE</p>
            <div className="flex items-end justify-between">
                <h4 className="text-xl sm:text-2xl font-black dark:text-white leading-none">Rs. {totalMarkupAndOperations.toLocaleString()}</h4>
                <p className="text-[8px] text-gray-400 font-bold uppercase italic">(EXCLUDING COST)</p>
            </div>
        </div>

        {/* 7. GRAND RECONCILIATION CELL (Responsive 2 cols) */}
        <div className="sm:col-span-4 p-5 bg-gray-900 dark:bg-black rounded-3xl border border-gray-800 shadow-2xl flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl text-brand-primary border border-white/5 shrink-0">
                <Calculator size={24}/>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] truncate">GRAND RECONCILIATION</p>
                <p className="text-[8px] text-gray-600 font-bold uppercase truncate mt-0.5">(COST + GAIN + DRAIN + SHIP)</p>
            </div>
            <div className="text-right shrink-0">
                <h4 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tighter">Rs. {grandTotalVerification.toLocaleString()}</h4>
                <div className="mt-2 flex items-center justify-end gap-1 text-green-500">
                    <CheckCircle2 size={10} />
                    <span className="text-[8px] font-black uppercase whitespace-nowrap">VERIFIED VS REVENUE</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}