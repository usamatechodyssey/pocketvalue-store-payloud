"use client";
import { useState } from 'react';
import { Mail, Send, Eye, ShoppingCart, Users, Zap, ExternalLink } from 'lucide-react';

export default function RecoveryCommandCenter() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState("");
  const [subject, setSubject] = useState("");

  const segments = [
    { id: 'HOT_LEAD', title: 'Hot Leads', icon: <Zap />, color: 'text-orange-500', desc: 'Contact captured but order not placed.' },
    { id: 'ABANDONED', title: 'Anonymous Carts', icon: <ShoppingCart />, color: 'text-blue-500', desc: 'Active carts without login info.' },
    { id: 'VIP', title: 'VIP Repeaters', icon: <Users />, color: 'text-purple-500', desc: 'Customers with 2+ recent orders.' },
    { id: 'WINDOW', title: 'Window Shoppers', icon: <Eye />, color: 'text-green-500', desc: 'Users with high page views today.' }
  ];

  return (
    <div className="space-y-8">
      {/* 4 COMMAND BLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {segments.map((seg) => (
          <div key={seg.id} className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl group hover:scale-[1.02] transition-transform">
            <div className={`p-4 rounded-2xl bg-gray-50 dark:bg-white/5 w-fit mb-6 ${seg.color}`}>
              {seg.icon}
            </div>
            <h4 className="text-xl font-black dark:text-white uppercase tracking-tighter">{seg.title}</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 leading-relaxed">{seg.desc}</p>
            
            <button className="w-full mt-8 py-3 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-brand-primary hover:text-brand-primary transition-all flex justify-center items-center gap-2">
                View Audience <ExternalLink size={12}/>
            </button>
          </div>
        ))}
      </div>

      {/* THE ACTION ENGINE: EMAIL SURGEON */}
      <div className="bg-white dark:bg-gray-950 rounded-[3rem] border border-gray-100 dark:border-gray-900 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 p-10 bg-gray-50 dark:bg-white/5 border-r dark:border-white/5">
            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter italic">Targeting Engine</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Select a segment to begin mass recovery.</p>
            
            <div className="mt-10 space-y-3">
                {segments.map(s => (
                    <button 
                        key={s.id}
                        onClick={() => setSelectedSegment(s.id)}
                        className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedSegment === s.id ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-white/5 text-gray-400'}`}
                    >
                        <span className="text-xs font-black uppercase">{s.title}</span>
                        {selectedSegment === s.id && <Zap size={14} className="animate-pulse" />}
                    </button>
                ))}
            </div>
        </div>

        <div className="lg:col-span-8 p-10">
            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Subject</label>
                    <input 
                        type="text" 
                        placeholder="e.g. 🎁 A special gift for your cart..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full mt-2 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Custom Offer Message</label>
                    <textarea 
                        rows={6}
                        placeholder="Write your recovery offer here. Use {{name}} for personalization..."
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        className="w-full mt-2 p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border-none text-sm font-bold focus:ring-2 focus:ring-brand-primary custom-scrollbar"
                    />
                </div>
                <div className="flex justify-end gap-4">
                    <button className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">Save Template</button>
                    <button className="px-10 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
                        Launch Campaign <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}