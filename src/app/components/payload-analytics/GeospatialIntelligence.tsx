"use client";

import { MapPin, Navigation, Globe } from 'lucide-react';

export default function GeospatialIntelligence({ data }: { data: any[] }) {
  const maxRevenue = data.length > 0 ? data[0].revenue : 1;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            <Globe className="text-blue-500" size={20}/> Regional Intelligence
        </h3>
        <span className="text-[9px] font-black text-gray-400 border border-gray-100 dark:border-gray-800 px-2 py-1 rounded-md uppercase">Top Cities</span>
      </div>

      <div className="space-y-5 flex-1">
        {data.map((item, i) => (
          <div key={i} className="relative space-y-1.5">
            <div className="flex justify-between items-end relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 italic">#{i+1}</span>
                <p className="text-xs font-bold dark:text-white uppercase tracking-tight">{item.city}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-brand-primary">Rs. {item.revenue.toLocaleString()}</p>
                <p className="text-[9px] text-gray-500 font-bold uppercase">{item.orders} Orders</p>
              </div>
            </div>

            {/* Visual Strength Bar */}
            <div className="h-1.5 w-full bg-gray-50 dark:bg-gray-800/50 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-linear-to-r from-blue-500 to-brand-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                 style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
               ></div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
             <Navigation size={40} />
             <p className="text-xs font-bold mt-2 uppercase tracking-widest">No Geo Data Map available</p>
           </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t dark:border-gray-800 flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><MapPin size={14}/></div>
          <p className="text-[9px] text-gray-500 font-medium leading-relaxed italic">
            Visualizing demand clusters across Pakistan. Use this data to optimize shipping routes and ad targeting.
          </p>
      </div>
    </div>
  );
}