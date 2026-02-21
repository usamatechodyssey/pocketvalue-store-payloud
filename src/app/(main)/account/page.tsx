
// export default AccountDashboardPage;
import Link from "next/link";
import { auth } from "../../auth";
import {
  Package,
  MapPin,
  ArrowRight,
  CreditCard,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

import connectMongoose from "@/app/lib/mongoose";
import Order, { IOrder } from "@/models/Order";

// --- SERVER DATA FETCHING ---
async function getRecentOrder(userId: string): Promise<IOrder | null> {
  try {
    await connectMongoose();
    const recentOrder = await Order.findOne({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();
    if (!recentOrder) return null;
    return JSON.parse(JSON.stringify(recentOrder));
  } catch (error) {
    console.error("Failed to fetch recent order:", error);
    return null;
  }
}

// --- UTILS ---
const getStatusGradient = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "from-green-500 to-emerald-600 shadow-green-500/30";
    case "cancelled":
      return "from-red-500 to-rose-600 shadow-red-500/30";
    case "shipped":
      return "from-blue-500 to-indigo-600 shadow-blue-500/30";
    default:
      return "from-orange-500 to-amber-600 shadow-orange-500/30";
  }
};

// Progress Width Calculator
const getProgressWidth = (status: string) => {
  switch (status.toLowerCase()) {
    case "placed":
      return "5%";
    case "processing":
      return "50%";
    case "shipped":
      return "75%";
    case "delivered":
      return "100%";
    default:
      return "5%";
  }
};

const AccountDashboardPage = async () => {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "User";

  const recentOrder = session?.user?.id
    ? await getRecentOrder(session.user.id)
    : null;

  return (
    <div className="relative min-h-150 w-full p-1">
      {/* Background Mesh */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl opacity-60 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-orange-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="space-y-8 relative z-10">
        {/* === HERO SECTION (Refined & Themed) === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
          {/* Left Side: Greeting */}
          <div>
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/20 mb-3 backdrop-blur-sm">
              <Sparkles
                size={14}
                className="text-brand-primary fill-brand-primary/20"
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary">
                Premium Member
              </span>
            </div>

            {/* Gradient Text for Name */}
            <h1 className="text-4xl md:text-6xl font-clash font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
              Hello,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
                {firstName}.
              </span>
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg font-medium max-w-md">
              Your personal dashboard is ready. Explore new collections &
              exclusive deals.
            </p>
          </div>

          {/* Right Side: Primary Action Button */}
          {/* Ab ye Button Black nahi, Brand Orange hai jo theme se match karega */}
          <Link
            href="/"
            className="group relative flex items-center gap-3 px-8 py-4 bg-linear-to-r from-brand-primary to-brand-primary-hover text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-[1.02] transition-all duration-300 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Start Shopping</span>
            <ArrowRight
              size={20}
              className="relative z-10 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
        {/* === BENTO GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* --- CARD A: ACTIVE ORDER (Improved Progress Bar) --- */}
          <div className="md:col-span-2 relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-4xl shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="p-8 h-full flex flex-col justify-between">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                    <Package size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {recentOrder ? "Active Order" : "No Active Orders"}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">
                      {recentOrder
                        ? `ID: #${recentOrder.orderId}`
                        : "Your recent purchases will show here."}
                    </p>
                  </div>
                </div>
                {recentOrder && (
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg bg-linear-to-r ${getStatusGradient(recentOrder.status)}`}
                  >
                    {recentOrder.status}
                  </span>
                )}
              </div>

              {/* ✨ UPDATED: Visual Progress Bar with Dots */}
              <div className="mt-8 mb-6">
                {recentOrder ? (
                  <div className="relative pt-2">
                    {/* Track */}
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full">
                      {/* Active Bar */}
                      <div
                        className={`h-full bg-linear-to-r ${getStatusGradient(recentOrder.status)} rounded-full relative transition-all duration-1000 ease-out`}
                        style={{ width: getProgressWidth(recentOrder.status) }}
                      >
                        {/* Glowing Head */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-orange-500 rounded-full shadow-md" />
                      </div>
                    </div>

                    {/* Step Dots (Static Background) */}
                    <div className="absolute top-2 w-full flex justify-between px-px">
                      {/* Dot 1 */}
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
                      {/* Dot 2 */}
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
                      {/* Dot 3 */}
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    </div>

                    {/* Labels (Aligned) */}
                    <div className="flex justify-between mt-4">
                      <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Placed
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Confirmed
                        </span>
                      </div>
                      <div className="flex flex-col items-center -ml-4">
                        <span className="text-xs font-bold text-brand-primary">
                          Processing
                        </span>
                        <span className="text-[10px] text-gray-400 animate-pulse">
                          In Progress
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-gray-400">
                          Delivered
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Est. 3 Days
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
                    <Clock className="text-gray-300 mb-2" size={24} />
                    <span className="text-sm text-gray-400 font-medium">
                      No recent activity
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                  href="/account/orders"
                  className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 hover:gap-3 transition-all group-hover:text-brand-primary"
                >
                  {recentOrder ? "Track Package" : "View Order History"}{" "}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* --- CARD B: ADDRESSES (Refined Interaction) --- */}
          <Link
            href="/account/addresses"
            className="relative overflow-hidden rounded-4xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group"
          >
            {/* 1. Deep Blue Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-[#10589E] to-[#0a3a6b] z-0" />

            {/* 2. Map Pattern Overlay (Permanent Visible) */}
            {/* pointer-events-none lagaya taake hover interfere na kare */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none z-0 mix-blend-overlay"
              style={{
                backgroundImage:
                  "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* 3. Content */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
              <div>
                {/* Icon Box with Glass Effect */}
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/10 shadow-inner">
                  <MapPin size={24} className="text-blue-50" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">Addresses</h3>
                <p className="text-blue-100/80 text-sm mt-1 font-medium">
                  Manage delivery locations
                </p>
              </div>

              <div className="flex items-center justify-between mt-8">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                  Saved Locations
                </span>

                {/* Arrow Button with Rotate Effect */}
                <div className="w-10 h-10 rounded-full bg-white text-[#10589E] flex items-center justify-center shadow-lg shadow-black/10 group-hover:rotate-45 transition-transform duration-300">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </Link>

          {/* --- CARD C: PROFILE --- */}
          <Link
            href="/account/profile"
            className="md:col-span-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-4xl p-8 shadow-sm hover:shadow-lg hover:border-brand-primary/30 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wide">
                  <CheckCircle2 size={12} /> Verified
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Profile Info
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Security & Personal Details
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors">
              Edit Details{" "}
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </div>
          </Link>

          {/* --- CARD D: REFERRAL (Lighter Background Fix) --- */}
          <div className="md:col-span-2 relative overflow-hidden rounded-4xl p-px shadow-sm group">
            {/* Gradient Border */}
            <div className="absolute inset-0 bg-linear-to-r from-orange-200 to-pink-200 dark:from-gray-700 dark:to-gray-600 rounded-4xl" />

            {/* ✨ Inner Content (White Background for Contrast) */}
            <div className="relative h-full bg-white dark:bg-gray-800 rounded-[1.9rem] p-7 flex flex-col md:flex-row md:items-center justify-between overflow-hidden">
              <div className="relative z-10 mb-4 md:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-brand-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                    Referral Program
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Invite & Earn 10%
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm font-medium">
                  Share your link with friends. They save, you earn.
                </p>
              </div>
              <button className="relative z-10 px-6 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:scale-105 transition-transform active:scale-95">
                Copy Link
              </button>

              {/* Subtle Glow, not full background */}
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-linear-to-tr from-brand-primary/20 to-rose-400/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboardPage;
// export default AccountDashboardPage;
// import Link from "next/link";
// import { auth } from "../auth";
// import {
//   ShoppingBag,
//   User,
//   MapPin,
//   ArrowRight,
//   Package,
//   Clock,
//   ShieldCheck,
//   CreditCard,
//   Settings,
//   Truck
// } from "lucide-react";

// // Imports
// import connectMongoose from "@/app/lib/mongoose";
// import Order, { IOrder } from "@/models/Order";

// // --- SERVER DATA FETCHING ---
// async function getRecentOrder(userId: string): Promise<IOrder | null> {
//   try {
//     await connectMongoose();
//     const recentOrder = await Order.findOne({ userId: userId })
//       .sort({ createdAt: -1 })
//       .lean();
//     if (!recentOrder) return null;
//     return JSON.parse(JSON.stringify(recentOrder));
//   } catch (error) {
//     console.error("Failed to fetch recent order:", error);
//     return null;
//   }
// }

// // --- HELPER COMPONENTS ---
// const StatusBadge = ({ status }: { status: string }) => {
//     let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
//     if(status.toLowerCase() === 'delivered') colorClass = "bg-green-100 text-green-700 border-green-200";
//     else if(status.toLowerCase() === 'shipped') colorClass = "bg-blue-100 text-blue-700 border-blue-200";
//     else if(status.toLowerCase() === 'cancelled') colorClass = "bg-red-100 text-red-700 border-red-200";
//     else if(status.toLowerCase() === 'processing') colorClass = "bg-orange-100 text-orange-700 border-orange-200";

//     return (
//         <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>
//             {status}
//         </span>
//     );
// };

// const ActionTile = ({ title, sub, icon: Icon, href, color }: any) => (
//     <Link href={href} className="group relative flex flex-col justify-between p-5 h-32 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-95 overflow-hidden">
//         <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 transition-transform group-hover:scale-110 ${color}`} />
//         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} bg-opacity-10 text-current`}>
//             <Icon size={20} />
//         </div>
//         <div>
//             <h3 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h3>
//             <p className="text-[10px] text-gray-500 font-medium mt-0.5">{sub}</p>
//         </div>
//     </Link>
// );

// // --- MAIN PAGE COMPONENT ---
// const AccountDashboardPage = async () => {
//   const session = await auth();
//   const userName = session?.user?.name?.split(" ")[0] || "User";
//   const userEmail = session?.user?.email;

//   const recentOrder = session?.user?.id ? await getRecentOrder(session.user.id) : null;

//   return (
//     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

//       {/* 1. HERO SECTION (App Header Style) */}
//       <div className="relative">
//         <div className="flex items-center justify-between">
//             <div>
//                 <h1 className="text-3xl font-clash font-bold text-gray-900 dark:text-white">
//                     Hello, {userName}
//                 </h1>
//                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     {userEmail}
//                 </p>
//             </div>
//             {/* Profile Avatar Placeholder */}
//             <div className="h-12 w-12 rounded-full bg-linear-to-tr from-brand-primary to-brand-secondary p-0.5 shadow-lg shadow-brand-primary/20">
//                 <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
//                     {session?.user?.image ? (
//                         <img src={session.user.image} alt={userName} className="h-full w-full object-cover" />
//                     ) : (
//                         <User className="text-brand-primary" size={24} />
//                     )}
//                 </div>
//             </div>
//         </div>
//       </div>

//       {/* 2. ORDER TRACKING WIDGET (Main Focus) */}
//       <section>
//         <div className="flex items-center justify-between mb-4 px-1">
//             <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Active Shipment</h2>
//             <Link href="/account/orders" className="text-xs font-bold text-brand-primary hover:underline">History &rarr;</Link>
//         </div>

//         {recentOrder ? (
//             <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all hover:border-brand-primary/30 group">
//                 {/* Decorative Gradient Bar */}
//                 <div className="h-1.5 w-full bg-linear-to-r from-brand-primary via-orange-400 to-yellow-400" />

//                 <div className="p-6">
//                     <div className="flex justify-between items-start mb-6">
//                         <div>
//                             <div className="flex items-center gap-2 mb-1">
//                                 <Package size={16} className="text-brand-primary" />
//                                 <span className="text-xs font-bold text-brand-primary">LATEST ORDER</span>
//                             </div>
//                             <h3 className="text-lg font-mono font-bold text-gray-900 dark:text-white">#{recentOrder.orderId}</h3>
//                             <p className="text-xs text-gray-500 mt-1">Placed on {new Date(recentOrder.createdAt).toLocaleDateString()}</p>
//                         </div>
//                         <StatusBadge status={recentOrder.status} />
//                     </div>

//                     {/* Progress Visual (Fake for now, adds App Feel) */}
//                     <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
//                         <div className="absolute top-0 left-0 h-full w-1/2 bg-brand-primary rounded-full" />
//                     </div>

//                     <Link
//                         href={`/account/orders/${recentOrder._id.toString()}`}
//                         className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-brand-primary hover:text-white transition-colors group/btn"
//                     >
//                         <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover/btn:text-white">Track Order Details</span>
//                         <div className="bg-white dark:bg-gray-800 rounded-full p-1.5 group-hover/btn:bg-white/20">
//                             <ArrowRight size={14} className="text-gray-900 dark:text-white group-hover/btn:text-white" />
//                         </div>
//                     </Link>
//                 </div>
//             </div>
//         ) : (
//             // Empty State Card
//             <div className="rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
//                 <div className="mx-auto h-12 w-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-400">
//                     <Package size={24} />
//                 </div>
//                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No active shipments</p>
//                 <Link href="/" className="mt-3 inline-block text-xs font-bold text-brand-primary bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
//                     Start Shopping
//                 </Link>
//             </div>
//         )}
//       </section>

//       {/* 3. QUICK ACTIONS GRID (iOS Control Center Style) */}
//       <section>
//         <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 px-1">Quick Actions</h2>
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//             <ActionTile
//                 title="My Orders"
//                 sub="Track & Return"
//                 icon={ShoppingBag}
//                 href="/account/orders"
//                 color="bg-blue-500 text-blue-500"
//             />
//             <ActionTile
//                 title="Profile"
//                 sub="Edit Info"
//                 icon={User}
//                 href="/account/profile"
//                 color="bg-purple-500 text-purple-500"
//             />
//             <ActionTile
//                 title="Addresses"
//                 sub="Shipping info"
//                 icon={MapPin}
//                 href="/account/addresses"
//                 color="bg-orange-500 text-orange-500"
//             />
//             <ActionTile
//                 title="Payment"
//                 sub="Cards & Wallet"
//                 icon={CreditCard}
//                 href="#"
//                 color="bg-green-500 text-green-500"
//             />
//             <ActionTile
//                 title="Settings"
//                 sub="Notifications"
//                 icon={Settings}
//                 href="#"
//                 color="bg-gray-500 text-gray-500"
//             />
//             <ActionTile
//                 title="Support"
//                 sub="Get Help"
//                 icon={ShieldCheck}
//                 href="/contact-us"
//                 color="bg-indigo-500 text-indigo-500"
//             />
//         </div>
//       </section>

//     </div>
//   );
// };

// export default AccountDashboardPage;
