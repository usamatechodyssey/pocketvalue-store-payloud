"use client";


import { CalendarClock, CheckCircle2, TrendingDown } from 'lucide-react';

interface ForecastItem {
  name: string;
  variant: string;
  stock: number;
  velocity: string;
  daysLeft: number | string;
  priority: 'CRITICAL' | 'HIGH' | 'LOW';
}

export default function InventoryForecaster({ data }: { data: ForecastItem[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
          <CalendarClock className="text-orange-500" size={22}/> Stock Forecaster
        </h3>
        <div className="px-2 py-1 bg-orange-500/10 rounded-md border border-orange-500/20">
             <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Predictive Logic Active</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {data.map((item, i) => {
          // ✅ INTELLIGENCE FIX: 90 din se zyada wale stock ko 'Stable' dikhana
          const isStable = item.daysLeft === 'Stable' || (typeof item.daysLeft === 'number' && item.daysLeft >= 90);
          
          return (
            <div key={i} className={`p-4 rounded-2xl border transition-all duration-300 ${
              item.priority === 'CRITICAL' ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/30' : 
              item.priority === 'HIGH' ? 'bg-orange-500/5 border-orange-500/10 hover:border-orange-500/30' : 
              'bg-gray-50 dark:bg-gray-800/40 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div className="grow">
                  <p className="text-[11px] font-black dark:text-white line-clamp-1 leading-tight uppercase tracking-tight">
                    {item.name}
                  </p>
                  <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase opacity-60">
                    Variant: {item.variant}
                  </p>
                </div>
                
                <div className="text-right shrink-0">
                  <div className={`text-[10px] font-black tracking-widest uppercase flex items-center justify-end gap-1 ${
                     item.priority === 'CRITICAL' ? 'text-red-500' : 
                     item.priority === 'HIGH' ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {/* Visual Indicator for velocity */}
                    {!isStable && <TrendingDown size={10} className="animate-bounce" />}
                    
                    {/* ✅ DISPLAY LOGIC FIX */}
                    {isStable ? 'STABLE STOCK' : `${item.daysLeft} DAYS LEFT`}
                  </div>
                  <p className="text-[9px] text-gray-400 font-black mt-0.5 uppercase tracking-tighter">
                    {item.stock} Units In Inventory
                  </p>
                </div>
              </div>
              
              {/* PROGRESS BAR INDICATOR */}
              <div className="mt-4 relative h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                 <div 
                   className={`h-full transition-all duration-1000 ease-out rounded-full ${
                      item.priority === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                      item.priority === 'HIGH' ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 
                      'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                   }`} 
                   style={{ width: `${Math.min(100, (item.stock / 25) * 100)}%` }} // 25 units is the safety threshold
                 ></div>
              </div>

              {/* Bottom Velocity Tag */}
              {!isStable && (
                <div className="mt-2 flex items-center gap-1.5 opacity-40">
                   <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                   <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                     Velocity: {item.velocity} items / day
                   </p>
                </div>
              )}
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="text-sm font-black dark:text-white uppercase tracking-widest">All Clear</p>
            <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase">No inventory risks detected based on current sales velocity.</p>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONABLE INSIGHT */}
      <div className="mt-6 pt-4 border-t dark:border-gray-800">
         <p className="text-[9px] text-gray-500 font-bold leading-relaxed italic uppercase tracking-tighter text-center">
            * Predictions based on average daily sales velocity of the last 15 days.
         </p>
      </div>
    </div>
  );
}