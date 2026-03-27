// "use client";

// import { Activity, MousePointerClick, ShoppingCart, CreditCard, DollarSign } from 'lucide-react';
// import { CampaignIntelligenceItem } from '@/app/actions/payloadMarketingActions';

// export default function CampaignSurgeon({ data }: { data: CampaignIntelligenceItem[] }) {
//   if (!data || data.length === 0) {
//     return (
//       <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl text-center">
//         <p className="text-gray-500 font-bold uppercase tracking-widest">No Campaign Data Found For This Period.</p>
//       </div>
//     );
//   }

//   // Helper to colorize Platform names
//   const getPlatformStyle = (source: string) => {
//     if (source.includes('FACEBOOK') || source.includes('META')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
//     if (source.includes('GOOGLE')) return 'bg-red-500/10 text-red-500 border-red-500/20';
//     if (source.includes('TIKTOK')) return 'bg-gray-800/10 text-gray-800 dark:bg-gray-100/10 dark:text-gray-100 border-gray-500/20';
//     return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
//   };

//   return (
//     <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">

//       <div className="flex justify-between items-center mb-8">
//         <div>
//             <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
//             <Activity className="text-brand-primary" /> The Campaign Surgeon
//             </h3>
//             <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Deep Sea Attribution Matrix (Last 30 Days)</p>
//         </div>
//       </div>

//       <div className="overflow-x-auto custom-scrollbar pb-4">
//         <table className="w-full text-left border-collapse min-w-250">
//           <thead>
//             <tr className="border-b-2 border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
//               <th className="pb-4 pl-4">Platform / Source</th>
//               <th className="pb-4">Campaign Name</th>
//               <th className="pb-4 text-center">Traffic (Visits)</th>
//               <th className="pb-4 text-center">The Funnel (View » Cart » Checkout)</th>
//               <th className="pb-4 text-center">Conv. Rate</th>
//               <th className="pb-4 text-right">Orders</th>
//               <th className="pb-4 text-right">AOV</th>
//               <th className="pb-4 pr-4 text-right">Net Revenue</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
//             {data.map((item) => (
//               <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">

//                 {/* 1. Platform Source */}
//                 <td className="py-4 pl-4">
//                   <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getPlatformStyle(item.source)}`}>
//                     {item.source}
//                   </span>
//                 </td>

//                 {/* 2. Campaign Name */}
//                 <td className="py-4">
//                   <span className="text-sm font-bold dark:text-white tracking-tight">{item.campaign.replace(/_/g, ' ')}</span>
//                 </td>

//                 {/* 3. Total Traffic */}
//                 <td className="py-4 text-center">
//                   <span className="text-sm font-black text-gray-600 dark:text-gray-300">{item.visits.toLocaleString()}</span>
//                 </td>

//                 {/* 4. The Funnel Visual */}
//                 <td className="py-4">
//                   <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-500">
//                     <span className="flex items-center gap-1" title="Product Views"><MousePointerClick size={14}/> {item.productViews}</span>
//                     <span className="opacity-30">»</span>
//                     <span className={`flex items-center gap-1 ${item.cartAbandonment > 70 ? 'text-red-500' : ''}`} title={`Added to Cart (Abandonment: ${item.cartAbandonment}%)`}>
//                         <ShoppingCart size={14}/> {item.addCarts}
//                     </span>
//                     <span className="opacity-30">»</span>
//                     <span className={`flex items-center gap-1 ${item.checkoutDropoff > 50 ? 'text-red-500' : ''}`} title={`Reached Checkout (Dropoff: ${item.checkoutDropoff}%)`}>
//                         <CreditCard size={14}/> {item.checkouts}
//                     </span>
//                   </div>
//                 </td>

//                 {/* 5. Conversion Rate */}
//                 <td className="py-4 text-center">
//                   <span className={`text-sm font-black ${item.conversionRate > 2 ? 'text-green-500' : 'text-gray-400'}`}>
//                     {item.conversionRate}%
//                   </span>
//                 </td>

//                 {/* 6. Total Orders */}
//                 <td className="py-4 text-right">
//                   <span className="text-sm font-black dark:text-white">{item.orders}</span>
//                 </td>

//                 {/* 7. Average Order Value (AOV) */}
//                 <td className="py-4 text-right">
//                   <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Rs. {item.aov.toLocaleString()}</span>
//                 </td>

//                 {/* 8. Net Revenue */}
//                 <td className="py-4 pr-4 text-right">
//                   <span className="text-lg font-black text-brand-primary flex items-center justify-end gap-1">
//                     <DollarSign size={16} className="opacity-50" />
//                     {item.revenue.toLocaleString()}
//                   </span>
//                 </td>

//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
"use client";

import {
  Activity,
  MousePointerClick,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import { CampaignIntelligenceItem } from "@/app/actions/payloadMarketingActions";

export default function CampaignSurgeon({
  data,
}: {
  data: CampaignIntelligenceItem[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl text-center">
        <p className="text-gray-500 font-bold uppercase tracking-widest">
          No Campaign Data Found For This Period.
        </p>
      </div>
    );
  }

  // Helper to colorize Platform names
  const getPlatformStyle = (source: string) => {
    const s = source.toUpperCase();
    if (s.includes("FACEBOOK") || s.includes("META"))
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (s.includes("GOOGLE"))
      return "bg-red-500/10 text-red-500 border-red-500/20";
    if (s.includes("TIKTOK"))
      return "bg-gray-800/10 text-gray-800 dark:bg-gray-100/10 dark:text-gray-100 border-gray-500/20";
    return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-brand-primary" /> The Campaign Surgeon
          </h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
            Deep Sea Attribution Matrix (Last 30 Days)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="w-full text-left border-collapse min-w-275">
          <thead>
            <tr className="border-b-2 border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="pb-4 pl-4">Platform / Source</th>
              <th className="pb-4">Campaign Name</th>
              <th className="pb-4 text-center">Traffic (Visits)</th>
              <th className="pb-4 text-center text-brand-primary">
                Unique People
              </th>
              {/* 👈 NAYA COLUMN */}
              <th className="pb-4 text-center">
                The Funnel (View » Cart » Checkout)
              </th>
              <th className="pb-4 text-center">Conv. Rate</th>
              <th className="pb-4 text-right">Orders</th>
              <th className="pb-4 text-right">AOV</th>
              <th className="pb-4 pr-4 text-right">Net Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
              >
                {/* 1. Platform Source */}
                <td className="py-4 pl-4">
                  <span
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${getPlatformStyle(item.source)}`}
                  >
                    {item.source}
                  </span>
                </td>

                {/* 2. Campaign Name */}
                <td className="py-4">
                  <span className="text-sm font-bold dark:text-white tracking-tight">
                    {item.campaign.replace(/_/g, " ")}
                  </span>
                </td>

                {/* 3. Total Traffic (Sessions) */}
                <td className="py-4 text-center">
                  <span className="text-sm font-black text-gray-600 dark:text-gray-300">
                    {item.visits.toLocaleString()}
                  </span>
                </td>

                {/* 3.5. Unique People (The Persons) 👈 NAYA */}
                <td className="py-4 text-center">
                  <span className="text-sm font-black text-brand-primary flex items-center justify-center gap-1">
                    <Users size={14} className="opacity-50" />{" "}
                    {item.uniqueVisitors?.toLocaleString() || 0}
                  </span>
                </td>

                {/* 4. The Funnel Visual */}
                <td className="py-4">
                  <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-500">
                    <span
                      className="flex items-center gap-1"
                      title="Product Views"
                    >
                      <MousePointerClick size={14} /> {item.productViews}
                    </span>
                    <span className="opacity-30">»</span>
                    <span
                      className={`flex items-center gap-1 ${item.cartAbandonment > 70 ? "text-red-500" : ""}`}
                      title={`Added to Cart (Abandonment: ${item.cartAbandonment}%)`}
                    >
                      <ShoppingCart size={14} /> {item.addCarts}
                    </span>
                    <span className="opacity-30">»</span>
                    <span
                      className={`flex items-center gap-1 ${item.checkoutDropoff > 50 ? "text-red-500" : ""}`}
                      title={`Reached Checkout (Dropoff: ${item.checkoutDropoff}%)`}
                    >
                      <CreditCard size={14} /> {item.checkouts}
                    </span>
                  </div>
                </td>

                {/* 5. Conversion Rate */}
                <td className="py-4 text-center">
                  <span
                    className={`text-sm font-black ${item.conversionRate > 2 ? "text-green-500" : "text-gray-400"}`}
                  >
                    {item.conversionRate}%
                  </span>
                </td>

                {/* 6. Total Orders */}
                <td className="py-4 text-right">
                  <span className="text-sm font-black dark:text-white">
                    {item.orders}
                  </span>
                </td>

                {/* 7. Average Order Value (AOV) */}
                <td className="py-4 text-right">
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    Rs. {item.aov.toLocaleString()}
                  </span>
                </td>

                {/* 8. Net Revenue */}
                <td className="py-4 pr-4 text-right">
                  <span className="text-lg font-black text-brand-primary flex items-center justify-end gap-1">
                    <DollarSign size={16} className="opacity-50" />
                    {item.revenue.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
