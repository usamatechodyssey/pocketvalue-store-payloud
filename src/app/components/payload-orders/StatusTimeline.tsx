"use client";
import { Check, Package, Truck, Home, XCircle } from 'lucide-react';

const STATUSES = [
  { name: 'Pending', icon: Package },
  { name: 'Processing', icon: Package },
  { name: 'Shipped', icon: Truck },
  { name: 'Delivered', icon: Home },
];

export default function StatusTimeline({ status }: { status: string }) {
  const currentStatusIndex = STATUSES.findIndex(s => s.name === status);

  if (status === 'Cancelled') {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-center justify-center gap-3 font-bold text-sm">
        <XCircle size={20} /> Order has been cancelled.
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between">
        <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200 dark:bg-gray-700 z-0">
          <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${Math.max(0, (currentStatusIndex / (STATUSES.length - 1)) * 100)}%` }} />
        </div>
        {STATUSES.map((s, index) => {
          const isActive = index <= currentStatusIndex;
          return (
            <div key={s.name} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                {isActive ? <Check size={18} /> : <s.icon size={16} />}
              </div>
              <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-brand-primary' : 'text-gray-400'}`}>{s.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}