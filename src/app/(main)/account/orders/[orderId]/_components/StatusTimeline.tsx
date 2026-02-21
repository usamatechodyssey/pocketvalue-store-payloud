// /src/app/account/orders/[orderId]/_components/StatusTimeline.tsx
"use client"; // This component is purely presentational, but can be a client component

import { Check, X, Package, Truck, Home } from "lucide-react";

export default function StatusTimeline({ status }: { status: string }) {
  const statuses = [
    { name: "Pending", icon: Package },
    { name: "Processing", icon: Package },
    { name: "Shipped", icon: Truck },
    { name: "Delivered", icon: Home },
  ];
  const currentStatusIndex = statuses.findIndex(s => s.name === status);

  if (status === "Cancelled") {
    return (
      <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-center font-semibold flex items-center justify-center gap-2">
        <X size={18} /> This order was cancelled.
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-8 py-4">
      <div className="relative">
        <div className="absolute left-0 top-4 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="absolute left-0 top-0 h-1 bg-brand-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
          />
        </div>
        <ol className="relative flex justify-between items-center w-full">
          {statuses.map((s, index) => {
            const isActive = index <= currentStatusIndex;
            return (
              <li key={s.name} className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${isActive ? "bg-brand-primary border-brand-primary text-white" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"}`}>
                  {isActive ? <Check size={18} /> : <s.icon size={16} />}
                </div>
                <p className={`mt-2 text-xs font-semibold whitespace-nowrap ${isActive ? "text-brand-primary" : "text-gray-500"}`}>
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