// /app/admin/orders/_components/StatusTimeline.tsx
"use client";

import { Check, Package, Truck, Home, XCircle } from 'lucide-react';

// --- Type Definitions ---
interface Status {
  name: string;
  icon: React.ElementType;
}

interface StatusTimelineProps {
  status: string;
  // Optional: Mustaqbil mein har status ki date/time track karne ke liye
  // statusHistory?: { status: string; date: Date }[];
}

// --- Component Data ---
const STATUSES: Status[] = [
  { name: 'Pending', icon: Package },
  { name: 'Processing', icon: Package },
  { name: 'Shipped', icon: Truck },
  { name: 'Delivered', icon: Home },
];

// === Main Component ===
export default function StatusTimeline({ status }: StatusTimelineProps) {
  const currentStatusIndex = STATUSES.findIndex(s => s.name === status);

  // Handle a cancelled order separately for a clear UI
  if (status === 'Cancelled') {
    return (
      <div className="p-4 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-lg flex items-center justify-center gap-3 font-semibold text-center">
        <XCircle size={20} />
        <span>This order has been cancelled.</span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="relative">
        {/* Progress Bar Line */}
        <div className="absolute left-0 top-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="absolute left-0 top-0 h-1 bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (STATUSES.length - 1)) * 100}%` }}
          />
        </div>

        {/* Status Steps */}
        <ol className="relative flex justify-between items-center w-full">
          {STATUSES.map((s, index) => {
            const isActive = index <= currentStatusIndex;
            return (
              <li key={s.name} className="flex flex-col items-center text-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 
                  transition-all duration-300
                  ${isActive 
                    ? 'bg-brand-primary border-brand-primary text-white' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }
                `}>
                  {isActive ? <Check size={18} /> : <s.icon size={16} />}
                </div>
                <p className={`
                  mt-2 text-xs font-semibold whitespace-nowrap
                  ${isActive ? 'text-brand-primary-dark dark:text-brand-primary-light' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  {s.name}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}