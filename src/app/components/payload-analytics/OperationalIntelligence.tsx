"use client";

import React from 'react';
import { Activity, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  data: {
    limboRevenue: number;
    fulfillmentRate: number;
    leakageRate: number;
    pendingCount: number;
  };
}

export default function OperationalIntelligence({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group">
      <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
        <Activity className="text-brand-primary" size={20}/> Health Monitor
      </h3>

      <div className="space-y-8 flex-1">
        {/* Metric 1: Revenue in Limbo */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
              <Clock size={12}/> Revenue in Limbo
            </p>
            <p className="text-sm font-black dark:text-white">Rs. {data.limboRevenue.toLocaleString()}</p>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase">{data.pendingCount} Orders Awaiting Action</p>
        </div>

        {/* Metric 2: Fulfillment Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-black text-gray-500 uppercase">Fulfillment Rate</p>
            <p className="text-sm font-black text-green-500">{data.fulfillmentRate}%</p>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${data.fulfillmentRate}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Cancellation/Leakage Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
              <ShieldAlert size={12}/> Profit Leakage
            </p>
            <p className="text-sm font-black text-red-500">{data.leakageRate}%</p>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className="h-full bg-red-500" style={{ width: `${data.leakageRate}%` }}></div>
          </div>
          <p className="text-[9px] text-gray-400 italic leading-tight mt-1">Based on cancelled/returned order volume</p>
        </div>
      </div>
    </div>
  );
}