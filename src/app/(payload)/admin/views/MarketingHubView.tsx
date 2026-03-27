
// import { DefaultTemplate } from "@payloadcms/next/templates";
// import {
//   getMarketingIntelligencePayload,
//   getDeepCampaignIntelligence,
//   getAudienceVaultData,
//   getProductFrictionPayload,
// } from "@/app/actions/payloadMarketingActions";

// // Components Imports (As per your Screenshot)
// import LiveRadar from "@/app/components/payload-marketing/LiveRadar";
// import ConversionFunnel from "@/app/components/payload-marketing/ConversionFunnel";
// import RecoveryPulse from "@/app/components/payload-marketing/RecoveryPulse";
// import CampaignSurgeon from "@/app/components/payload-marketing/CampaignSurgeon";
// import AudienceVault from "@/app/components/payload-marketing/AudienceVault";
// import ProductFrictionExplorer from "@/app/components/payload-marketing/ProductFrictionExplorer";
// import MarketPulseChart from "@/app/components/payload-marketing/MarketPulseChart";
// import ConversionPulseChart from "@/app/components/payload-marketing/ConversionPulseChart";
// import RecoveryCommandCenter from "@/app/components/payload-marketing/RecoveryCommandCenter";

// import { ArrowLeft, Rocket, Activity, Target, Zap } from "lucide-react";
// import Link from "next/link";
// import { subDays } from "date-fns";


// export default async function MarketingHubView(props: any) {
//   const { initPageResult, params, searchParams } = props;

//   // Parallel Data Fetching for NASA Speed 🚀
//   const [data, campaignData, vaultData, frictionData] = await Promise.all([
//     getMarketingIntelligencePayload(),
//     getDeepCampaignIntelligence({
//       from: subDays(new Date(), 30),
//       to: new Date(),
//     }),
//     getAudienceVaultData(),
//     getProductFrictionPayload({
//       from: subDays(new Date(), 30),
//       to: new Date(),
//     }),
//   ]);

//   if (!data || !vaultData) {
//     return (
//       <div className="p-20 text-center uppercase font-black opacity-20">
//         Intelligence Engine Offline
//       </div>
//     );
//   }

//   // Mock data for the "Stock Market" charts (Can be connected to DB in next step)
//   const pulseData = [
//     { time: "10am", rate: 1.2 },
//     { time: "12pm", rate: 2.1 },
//     { time: "02pm", rate: 1.8 },
//     { time: "04pm", rate: 2.4 },
//     { time: "06pm", rate: 3.2 },
//     { time: "08pm", rate: 2.9 },
//   ];

//   return (
//     <DefaultTemplate
//       i18n={props.i18n || initPageResult?.req?.i18n}
//       locale={props.locale || initPageResult?.locale}
//       params={params}
//       payload={props.payload || initPageResult?.req?.payload}
//       permissions={props.permissions || initPageResult?.permissions}
//       searchParams={searchParams}
//       user={props.user || initPageResult?.req?.user}
//       visibleEntities={initPageResult?.visibleEntities}
//     >
//       <div className="tw-admin-wrapper p-4 md:p-10 space-y-12 pb-32">
//         {/* SECTION 1: COMMAND HEADER */}
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
//           <div className="space-y-2">
//             <Link
//               href="/admin"
//               className="flex items-center gap-2 text-[10px] font-black text-brand-primary hover:underline uppercase tracking-[0.3em] mb-4"
//             >
//               <ArrowLeft size={12} /> Back to Hub
//             </Link>
//             <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-6 italic">
//               <Rocket size={64} className="text-brand-primary" />
//               Growth Commander
//             </h1>
//             <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.5em] opacity-60">
//               Intelligence & Recovery Command Center v2.0
//             </p>
//           </div>
//         </div>

//         {/* SECTION 2: THE MARKET PULSE (NEW STOCK MARKET FEEL) */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
//           <div className="lg:col-span-8">
//             <MarketPulseChart data={pulseData} />
//           </div>
//           <div className="lg:col-span-4">
//             <ConversionPulseChart data={pulseData} />
//           </div>
//         </div>

//         {/* SECTION 3: REAL-TIME RADAR & GLOBAL FUNNEL */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <LiveRadar
//             activeCount={data.livePulse.activeUsers}
//             deviceData={data.deviceSplit}
//           />
//           <ConversionFunnel steps={data.funnel} />
//           <RecoveryPulse stats={data.recoveryStats} />
//         </div>

//         {/* SECTION 4: DIAGNOSTIC CENTER (Campaign Surgeon & Product Friction) */}
//         <div className="space-y-10">
//           <div className="flex items-center gap-4">
//             <Activity className="text-brand-primary" />
//             <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic">
//               Diagnostic Center
//             </h2>
//             <div className="h-0.5 flex-1 bg-gray-100 dark:bg-white/5"></div>
//           </div>
//           <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
//             <CampaignSurgeon data={campaignData} />
//             <ProductFrictionExplorer data={frictionData} />
//           </div>
//         </div>

//         {/* SECTION 5: ACTION SUITE (Recovery Command & Audience Vault) */}
//         <div className="space-y-10 pt-10">
//           <div className="flex items-center gap-4">
//             <Zap className="text-brand-primary fill-brand-primary" />
//             <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic">
//               Action Suite
//             </h2>
//             <div className="h-0.5 flex-1 bg-gray-100 dark:bg-white/5"></div>
//           </div>
//           <RecoveryCommandCenter />
//           <AudienceVault data={vaultData} />
//         </div>

//         {/* STRATEGIC FOOTER */}
//         <div className="p-16 bg-gray-900 dark:bg-brand-primary/5 rounded-[4rem] border border-white/5 relative overflow-hidden text-center">
//           <div className="relative z-10">
//             <h4 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter italic">
//               "Data is the new oil. Tracking is the refinery."
//             </h4>
//             <p className="text-xs text-brand-primary font-black uppercase mt-6 tracking-[0.6em]">
//               Pocket Value CRM Neural Engine — Active & Scanning
//             </p>
//           </div>
//           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
//             <Activity className="w-full h-full text-white" />
//           </div>
//         </div>
//       </div>
//     </DefaultTemplate>
//   );
// }
import { DefaultTemplate } from "@payloadcms/next/templates";
import {
  getMarketingIntelligencePayload,
  getDeepCampaignIntelligence,
  getAudienceVaultData,
  getProductFrictionPayload
} from "@/app/actions/payloadMarketingActions";

import LiveRadar from "@/app/components/payload-marketing/LiveRadar";
import ConversionFunnel from "@/app/components/payload-marketing/ConversionFunnel";
import RecoveryPulse from "@/app/components/payload-marketing/RecoveryPulse";
import CampaignSurgeon from "@/app/components/payload-marketing/CampaignSurgeon";
import AudienceVault from "@/app/components/payload-marketing/AudienceVault";
import ProductFrictionExplorer from "@/app/components/payload-marketing/ProductFrictionExplorer";
import MarketPulseChart from "@/app/components/payload-marketing/MarketPulseChart";
import ConversionPulseChart from "@/app/components/payload-marketing/ConversionPulseChart";
import RecoveryCommandCenter from "@/app/components/payload-marketing/RecoveryCommandCenter";

import { ArrowLeft, Rocket, Activity, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";
import { subDays } from "date-fns";
// Note: Manual refresh ke liye client component logic header mein dalni hogi, 
// isliye hum simply server component rakhte hain aur user F5 ya Header link use karega.

export default async function MarketingHubView(props: any) {
  const { initPageResult, params, searchParams } = props;

  const [data, campaignData, vaultData, frictionData] = await Promise.all([
    getMarketingIntelligencePayload(),
    getDeepCampaignIntelligence({ from: subDays(new Date(), 30), to: new Date() }),
    getAudienceVaultData(),
    getProductFrictionPayload({ from: subDays(new Date(), 30), to: new Date() })
  ]);

  if (!data || !vaultData) {
    return <div className="p-20 text-center uppercase font-black opacity-20">Intelligence Engine Offline</div>;
  }

  // Stock Market Graphs ke liye dummy data (Asal data baad mein connect karenge)
  const pulseData = [
    { time: '10am', rate: 1.2 }, { time: '12pm', rate: 2.1 }, { time: '02pm', rate: 1.8 },
    { time: '04pm', rate: 2.4 }, { time: '06pm', rate: 3.2 }, { time: '08pm', rate: 2.9 }
  ];

  return (
    <DefaultTemplate
      i18n={props.i18n || initPageResult?.req?.i18n}
      locale={props.locale || initPageResult?.locale}
      params={params}
      payload={props.payload || initPageResult?.req?.payload}
      permissions={props.permissions || initPageResult?.permissions}
      searchParams={searchParams}
      user={props.user || initPageResult?.req?.user}
      visibleEntities={initPageResult?.visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 md:p-10 space-y-12 pb-32">
        
        {/* SECTION 1: COMMAND HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <Link href="/admin" className="flex items-center gap-2 text-[10px] font-black text-brand-primary hover:underline uppercase tracking-[0.3em] mb-4">
              <ArrowLeft size={12} /> Back to Hub
            </Link>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-6 italic">
              <Rocket size={64} className="text-brand-primary" />
              Growth Commander
            </h1>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.5em] opacity-60">
              Intelligence & Recovery Command Center v2.0
            </p>
          </div>

          {/* 🔄 MANUAL REFRESH INDICATOR */}
          <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-4 rounded-3xl border dark:border-white/10">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase">Last Audit</p>
                <p className="text-xs font-bold dark:text-white">{new Date().toLocaleTimeString()}</p>
              </div>
              <Link href="/admin/marketing-hub" className="p-3 bg-brand-primary text-white rounded-2xl hover:rotate-180 transition-transform duration-500">
                <RefreshCw size={20} />
              </Link>
          </div>
        </div>

        {/* Baki saare components wese hi rahenge... */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8"><MarketPulseChart data={pulseData} /></div>
            <div className="lg:col-span-4"><ConversionPulseChart data={pulseData} /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <LiveRadar activeCount={data.livePulse.activeUsers} deviceData={data.deviceSplit} />
            <ConversionFunnel steps={data.funnel} />
            <RecoveryPulse stats={data.recoveryStats} />
        </div>

        <div className="space-y-10">
            <div className="flex items-center gap-4">
                <Activity className="text-brand-primary" />
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic">Diagnostic Center</h2>
                <div className="h-0.5 flex-1 bg-gray-100 dark:bg-white/5"></div>
            </div>
            <CampaignSurgeon data={campaignData} />
            <ProductFrictionExplorer data={frictionData} />
        </div>

        <div className="space-y-10 pt-10">
            <div className="flex items-center gap-4">
                <Zap className="text-brand-primary fill-brand-primary" />
                <h2 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic">Action Suite</h2>
                <div className="h-0.5 flex-1 bg-gray-100 dark:bg-white/5"></div>
            </div>
            <RecoveryCommandCenter />
            <AudienceVault data={vaultData} />
        </div>

        {/* Footer... */}
        <div className="p-16 bg-gray-900 dark:bg-brand-primary/5 rounded-[4rem] border border-white/5 text-center">
            <h4 className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tighter italic">"Data is the new oil. Tracking is the refinery."</h4>
            <p className="text-xs text-brand-primary font-black uppercase mt-6 tracking-[0.6em]">Manual Audit Mode — Ready</p>
        </div>

      </div>
    </DefaultTemplate>
  );
}