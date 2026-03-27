"use client";

import { useState } from 'react';
import { Users, Mail, Phone, ShoppingBag, Zap, Gift, ChevronRight } from 'lucide-react';
import { AudienceMember } from '@/app/actions/payloadMarketingActions';
import { formatDistanceToNow } from 'date-fns';

export default function AudienceVault({ data }: { data: { abandoned: AudienceMember[], hotLeads: AudienceMember[], vips: AudienceMember[] } }) {
  const [activeTab, setActiveTab] = useState<'HOT_LEAD' | 'ABANDONED' | 'VIP'>('HOT_LEAD');

  const currentList = activeTab === 'HOT_LEAD' ? data.hotLeads : activeTab === 'ABANDONED' ? data.abandoned : data.vips;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-8 border-b dark:border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <Users className="text-brand-primary" /> The Audience Vault
            </h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Smart Segmentation & Retargeting</p>
          </div>
          
          <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-2xl border dark:border-white/5">
            {[
              { id: 'HOT_LEAD', label: 'Hot Leads', count: data.hotLeads.length },
              { id: 'ABANDONED', label: 'Abandoned', count: data.abandoned.length },
              { id: 'VIP', label: 'VIPs', count: data.vips.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white dark:bg-gray-800 shadow-sm text-brand-primary' 
                  : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-4 bg-brand-primary/5 flex justify-between items-center">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
            {currentList.length} Customers Found
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 transition-transform">
             <Gift size={14} /> Send 10% Discount Coupon to All
          </button>
      </div>

      {/* List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b dark:border-white/5">
              <th className="p-6">Customer Info</th>
              <th className="p-6">Cart/Life Value</th>
              <th className="p-6">Items</th>
              <th className="p-6">Last Pulse</th>
              <th className="p-6 text-right">Direct Action</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-white/5">
            {currentList.map((member) => (
              <tr key={member.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center font-black text-brand-primary">
                        {member.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-black dark:text-white">{member.name}</p>
                        <div className="flex gap-2 mt-1">
                            {member.email && <Mail size={12} className="text-gray-400" />}
                            {member.phone && <Phone size={12} className="text-gray-400" />}
                        </div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                    <span className="text-sm font-black text-green-600">Rs. {member.value.toLocaleString()}</span>
                </td>
                <td className="p-6 text-sm font-bold dark:text-gray-400">
                    {member.itemsCount} Products
                </td>
                <td className="p-6 text-xs font-medium text-gray-500">
                    {formatDistanceToNow(new Date(member.lastActive))} ago
                </td>
                <td className="p-6 text-right">
                    <button className="p-2 hover:bg-brand-primary/10 rounded-lg text-brand-primary transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}