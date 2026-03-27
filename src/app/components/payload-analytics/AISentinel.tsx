"use client";

import React from 'react';
import { ShieldCheck, ShieldAlert, Radio, Activity, Clock } from 'lucide-react';

export default function AISentinel({ data }: { data: any }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
            {data.status === 'SECURE' ? <ShieldCheck className="text-green-500" /> : <ShieldAlert className="text-red-500 animate-pulse" />}
            AI Sentinel
        </h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
            data.status === 'SECURE' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
        }`}>
            <Radio size={10} className="animate-ping" />
            <span className="text-[9px] font-black uppercase tracking-widest">{data.status}</span>
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {data.alerts.map((alert: any, i: number) => (
          <div key={i} className={`p-3 rounded-2xl border flex gap-3 items-start transition-all ${
            alert.type === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 
            alert.type === 'WARNING' ? 'bg-orange-500/5 border-orange-500/20' : 
            'bg-blue-500/5 border-blue-500/20'
          }`}>
            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                alert.type === 'CRITICAL' ? 'bg-red-500' : alert.type === 'WARNING' ? 'bg-orange-500' : 'bg-blue-500'
            }`}></div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black dark:text-white leading-none">{alert.title}</p>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">{alert.message}</p>
                <p className="text-[8px] text-gray-400 mt-2 font-bold uppercase flex items-center gap-1">
                    <Clock size={8}/> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
          </div>
        ))}

        {data.alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-10 opacity-30">
            <ShieldCheck size={40} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-center">No threats or anomalies detected.<br/>System is nominal.</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t dark:border-gray-800 flex items-center justify-between">
          <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Neural Scan Active</p>
          <div className="flex items-center gap-1.5 text-[8px] font-black text-brand-primary uppercase">
            <Activity size={10} /> {new Date(data.lastScan).toLocaleTimeString()}
          </div>
      </div>
    </div>
  );
}