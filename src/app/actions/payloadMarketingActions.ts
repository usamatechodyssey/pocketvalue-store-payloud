// "use server";

// import { auth } from "@/app/auth";
// import { headers } from "next/headers";
// import { getPayload } from "payload";
// import configPromise from "@payload-config";
// import connectMongoose from "@/app/lib/mongoose";
// import UserSession from "@/models/UserSession";
// import UserEvent from "@/models/UserEvent";
// import AbandonedCart from "@/models/AbandonedCart";
// import Order from "@/models/Order";
// import { subMinutes, startOfDay } from "date-fns";
// import User from "@/models/User";
// import nodemailer from "nodemailer";

// // ============================================================================
// // 1. STRICT TYPE DEFINITIONS
// // ============================================================================

// // --- TYPES FOR PRODUCT FRICTION ---
// export interface ProductFrictionItem {
//   id: string;
//   name: string;
//   image: string;
//   views: number;
//   atc: number; // Add to Cart
//   orders: number;
//   viewToCartRatio: number; // Interest Level
//   cartToOrderRatio: number; // Closing Level
//   frictionScore: number; // 0 to 100 (Higher means more problems)
//   alert: "LOW_INTEREST" | "PRICE_BARRIER" | "WINNER" | "STABLE";
// }
// // --- TYPES FOR AUDIENCE VAULT ---
// export interface AudienceMember {
//   id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   value: number;
//   itemsCount: number;
//   lastActive: string;
//   type: "ABANDONED" | "HOT_LEAD" | "VIP";
// }

// export interface MarketingHubData {
//   livePulse: {
//     activeUsers: number;
//     lastScan: string;
//   };
//   deviceSplit: { name: string; value: number; fill: string }[];
//   funnel: {
//     label: string;
//     value: number;
//     percentage: number;
//   }[];
//   recoveryStats: {
//     totalAbandonedValue: number;
//     pendingCartCount: number;
//     leadsCaptured: number;
//   };
// }

// // 🔥 NAYE TYPES FOR CAMPAIGN INTELLIGENCE (THE SURGEON)
// export interface CampaignIntelligenceItem {
//   id: string; // Unique key (source_campaign)
//   source: string;
//   campaign: string;
//   visits: number;

//   productViews: number;
//   addCarts: number;
//   checkouts: number;
//   orders: number;
//   revenue: number;
//   aov: number; // Average Order Value
//   conversionRate: number; // (Orders / Visits) * 100
//   cartAbandonment: number; // Percentage of carts that didn't convert
//   checkoutDropoff: number; // Percentage of checkouts that didn't finish
// }

// // ============================================================================
// // 2. INTERNAL SECURITY GUARD
// // ============================================================================

// async function verifyAdminAccess() {
//   const session = await auth();
//   if (
//     session?.user?.role &&
//     ["Super Admin", "Store Manager"].includes(session.user.role)
//   ) {
//     return true;
//   }

//   const payload = await getPayload({ config: configPromise });
//   const { user } = await payload.auth({ headers: await headers() });
//   if (user) return true;

//   throw new Error("Unauthorized: Marketing Intelligence is restricted.");
// }

// // ============================================================================
// // 3. MASTER ACTION 1: GET MARKETING HUB INTELLIGENCE (Radar & Funnel)
// // ============================================================================

// // === 🔥 UPDATED MASTER ACTION: GET MARKETING HUB INTELLIGENCE 🔥 ===
// export async function getMarketingIntelligencePayload(): Promise<MarketingHubData | null> {
//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     const now = new Date();
//     const today = startOfDay(now);

//     // Isay replace karein (45s se wapis 5m par):
//     const activeThreshold = subMinutes(now, 5);

//     // ASYNC DATA HARVESTING (Parallel Performance)
//     const [
//       activeUsers,
//       liveDeviceStats, // 👈 Ab sirf live devices ginega
//       funnelEvents,
//       actualOrdersCount,
//       abandonedCarts,
//     ] = await Promise.all([
//       // 1. Count live sessions (Current online count)
//       UserSession.countDocuments({ lastPulse: { $gte: activeThreshold } }),

//       // 2. LIVE Device Aggregation (Syncing with activeThreshold)
//       UserSession.aggregate([
//         { $match: { lastPulse: { $gte: activeThreshold } } }, // 👈 CRITICAL FIX: Sirf live users ki device uthao
//         { $group: { _id: "$device", count: { $sum: 1 } } },
//       ]),

//       // 3. Funnel events (Today)
//       UserEvent.aggregate([
//         { $match: { createdAt: { $gte: today } } },
//         { $group: { _id: "$eventType", count: { $sum: 1 } } },
//       ]),

//       // 4. Today's actual sales
//       Order.countDocuments({
//         createdAt: { $gte: today },
//         status: { $ne: "Cancelled" },
//       }),

//       // 5. Abandoned cart pulse
//       AbandonedCart.find({
//         isRecovered: false,
//         lastUpdated: { $gte: today },
//       }).lean(),
//     ]);

//     // DEVICE SPLIT MAPPING
//     const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];
//     const mappedDevices = liveDeviceStats.map((d, i) => ({
//       name: (d._id || "Unknown").toUpperCase(),
//       value: d.count,
//       fill: COLORS[i % COLORS.length],
//     }));

//     // Logic for funnel calculations... (Wahi rahegi)
//     const eventMap = new Map(funnelEvents.map((e) => [e._id, e.count]));
//     const totalSessions = activeUsers + (eventMap.get("page_view") || 0);

//     const funnelSteps = [
//       { label: "Total Visits", value: totalSessions },
//       { label: "Product Views", value: eventMap.get("page_view") || 0 },
//       { label: "Added to Cart", value: eventMap.get("add_to_cart") || 0 },
//       { label: "Checkout Started", value: eventMap.get("checkout_start") || 0 },
//       { label: "Purchased", value: actualOrdersCount },
//     ];

//     return {
//       livePulse: {
//         activeUsers,
//         lastScan: now.toISOString(),
//       },
//       deviceSplit: mappedDevices,
//       funnel: funnelSteps.map((step) => ({
//         ...step,
//         percentage:
//           totalSessions > 0
//             ? Number(((step.value / totalSessions) * 100).toFixed(1))
//             : 0,
//       })),
//       recoveryStats: {
//         totalAbandonedValue: abandonedCarts.reduce(
//           (sum, cart: any) => sum + (cart.subtotal || 0),
//           0,
//         ),
//         pendingCartCount: abandonedCarts.length,
//         leadsCaptured: abandonedCarts.filter(
//           (cart: any) => cart.contactCaptured,
//         ).length,
//       },
//     };
//   } catch (error: any) {
//     console.error("Marketing Intelligence Engine Failure:", error.message);
//     return null;
//   }
// }

// // ============================================================================
// // 4. 🔥 MASTER ACTION 2: THE "DEEP SEA" CAMPAIGN ENGINE 🔥
// // ============================================================================

// export async function getDeepCampaignIntelligence(range: {
//   from: Date;
//   to: Date;
// }): Promise<CampaignIntelligenceItem[]> {
//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     // 1. 🌐 TRAFFIC & FUNNEL AGGREGATION (Jo log aaye aur unhone kya kiya)
//     const trafficData = await UserSession.aggregate([
//       { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
//       {
//         $lookup: {
//           from: "userevents", // Linking to UserEvent Collection
//           let: { sId: "$sessionId" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$sessionId", "$$sId"] } } },
//             { $group: { _id: "$eventType", count: { $sum: 1 } } },
//           ],
//           as: "eventCounts",
//         },
//       },
//       {
//         $project: {
//           source: {
//             $cond: [{ $not: ["$utmSource"] }, "Direct/Organic", "$utmSource"],
//           },
//           campaign: {
//             $cond: [{ $not: ["$utmCampaign"] }, "None", "$utmCampaign"],
//           },
//           events: "$eventCounts",
//         },
//       },
//       {
//         $group: {
//           _id: {
//             source: { $toUpper: "$source" },
//             campaign: { $toUpper: "$campaign" },
//           },
//           visits: { $sum: 1 },
//           // Extracting Funnel Events Array using push
//           events: { $push: "$events" },
//         },
//       },
//     ]);

//     // 2. 💰 REVENUE & ORDERS AGGREGATION (Asal Sale Kahan Se Aayi)
//     const revenueData = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: range.from, $lte: range.to },
//           status: { $ne: "Cancelled" },
//         },
//       },
//       {
//         $group: {
//           _id: {
//             source: {
//               $toUpper: {
//                 $cond: [
//                   { $not: ["$trafficSource.source"] },
//                   "DIRECT/ORGANIC",
//                   "$trafficSource.source",
//                 ],
//               },
//             },
//             campaign: {
//               $toUpper: {
//                 $cond: [
//                   { $not: ["$trafficSource.campaign"] },
//                   "NONE",
//                   "$trafficSource.campaign",
//                 ],
//               },
//             },
//           },
//           ordersCount: { $sum: 1 },
//           totalRevenue: { $sum: "$totalPrice" },
//         },
//       },
//     ]);

//     // 3. 🧠 THE BRAIN: MERGING TRAFFIC & REVENUE DATA IN JAVASCRIPT
//     const campaignMap = new Map<string, CampaignIntelligenceItem>();

//     // Step A: Map Traffic Data
//     trafficData.forEach((t) => {
//       const key = `${t._id.source}_${t._id.campaign}`;

//       let pViews = 0,
//         aCarts = 0,
//         cOuts = 0;

//       // Loop through nested events array to sum up specific actions
//       t.events.forEach((sessionEvents: any[]) => {
//         sessionEvents.forEach((ev: any) => {
//           if (ev._id === "page_view") pViews += ev.count;
//           if (ev._id === "add_to_cart") aCarts += ev.count;
//           if (ev._id === "checkout_start") cOuts += ev.count;
//         });
//       });

//       campaignMap.set(key, {
//         id: key,
//         source: t._id.source,
//         campaign: t._id.campaign,
//         visits: t.visits,
//         productViews: pViews,
//         addCarts: aCarts,
//         checkouts: cOuts,
//         orders: 0,
//         revenue: 0,
//         aov: 0,
//         conversionRate: 0,
//         cartAbandonment: 0,
//         checkoutDropoff: 0,
//       });
//     });

//     // Step B: Merge Revenue Data into the same Map
//     revenueData.forEach((r) => {
//       const key = `${r._id.source}_${r._id.campaign}`;
//       const existing = campaignMap.get(key);

//       if (existing) {
//         existing.orders = r.ordersCount;
//         existing.revenue = r.totalRevenue;
//       } else {
//         // Agar koi order aisa hai jiska session record miss hogaya, usay alag se record karo
//         campaignMap.set(key, {
//           id: key,
//           source: r._id.source,
//           campaign: r._id.campaign,
//           visits: r.ordersCount, // Fallback
//           productViews: 0,
//           addCarts: 0,
//           checkouts: r.ordersCount,
//           orders: r.ordersCount,
//           revenue: r.totalRevenue,
//           aov: 0,
//           conversionRate: 0,
//           cartAbandonment: 0,
//           checkoutDropoff: 0,
//         });
//       }
//     });

//     // 4. 🧮 DEEP MATH & RATIO CALCULATION (The TripleWhale Magic)
//     const finalIntelligence: CampaignIntelligenceItem[] = Array.from(
//       campaignMap.values(),
//     ).map((data) => {
//       // Conversion Rate % (Orders / Visits)
//       data.conversionRate =
//         data.visits > 0
//           ? Number(((data.orders / data.visits) * 100).toFixed(2))
//           : 0;

//       // Average Order Value (AOV)
//       data.aov =
//         data.orders > 0 ? Number((data.revenue / data.orders).toFixed(0)) : 0;

//       // Cart Abandonment % (Added to Cart but didn't order)
//       if (data.addCarts > 0) {
//         const abandon = ((data.addCarts - data.orders) / data.addCarts) * 100;
//         data.cartAbandonment = abandon > 0 ? Number(abandon.toFixed(1)) : 0;
//       }

//       // Checkout Dropoff % (Reached checkout but ran away)
//       if (data.checkouts > 0) {
//         const dropoff = ((data.checkouts - data.orders) / data.checkouts) * 100;
//         data.checkoutDropoff = dropoff > 0 ? Number(dropoff.toFixed(1)) : 0;
//       }

//       return data;
//     });

//     // Sort by Revenue (Highest Revenue Campaigns on top)
//     return finalIntelligence.sort((a, b) => b.revenue - a.revenue);
//   } catch (error: any) {
//     console.error("Deep Campaign Intelligence Engine Failure:", error.message);
//     return [];
//   }
//   // Add missing closing brace
// }
// // ============================================================================
// // 4. 🔥 AUDIENCE VAULT LOGIC 🔥
// // ============================================================================

// export async function getAudienceVaultData(): Promise<{
//   abandoned: AudienceMember[];
//   hotLeads: AudienceMember[];
//   vips: AudienceMember[];
// }> {
//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     const now = new Date();
//     const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));

//     // 1. Fetch Abandoned Carts & Hot Leads
//     const carts = await AbandonedCart.find({ isRecovered: false })
//       .sort({ lastUpdated: -1 })
//       .limit(100)
//       .lean();

//     // 2. Fetch VIPs
//     const vipOrders = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: thirtyDaysAgo },
//           status: { $ne: "Cancelled" },
//         },
//       },
//       {
//         $group: {
//           _id: "$userId",
//           orderCount: { $sum: 1 },
//           totalSpent: { $sum: "$totalPrice" },
//         },
//       },
//       { $match: { orderCount: { $gte: 2 } } },
//       { $sort: { totalSpent: -1 } },
//       { $limit: 50 },
//     ]);

//     const vipUserIds = vipOrders.map((v) => v._id);
//     // ✅ FIX: Type casting to 'any' for the lean array to allow _id access safely
//     const vipUsers = (await User.find({ _id: { $in: vipUserIds } })
//       .select("name email phone")
//       .lean()) as any[];

//     const abandoned: AudienceMember[] = [];
//     const hotLeads: AudienceMember[] = [];

//     carts.forEach((c: any) => {
//       const member: AudienceMember = {
//         id: c._id.toString(),
//         name: c.contactCaptured
//           ? c.email || c.phone || "Captured Lead"
//           : "Anonymous Visitor",
//         email: c.email,
//         phone: c.phone,
//         value: c.subtotal || 0,
//         itemsCount: c.items?.length || 0,
//         lastActive: c.lastUpdated.toISOString(),
//         type: c.contactCaptured ? "HOT_LEAD" : "ABANDONED",
//       };
//       if (c.contactCaptured) hotLeads.push(member);
//       else abandoned.push(member);
//     });

//     const vips: AudienceMember[] = vipOrders.map((v) => {
//       const user = vipUsers.find((u) => u._id.toString() === v._id.toString());
//       return {
//         id: v._id.toString(),
//         name: user?.name || "VIP Customer",
//         email: user?.email,
//         phone: user?.phone,
//         value: v.totalSpent,
//         itemsCount: v.orderCount,
//         lastActive: now.toISOString(),
//         type: "VIP",
//       };
//     });

//     return { abandoned, hotLeads, vips };
//   } catch (e) {
//     return { abandoned: [], hotLeads: [], vips: [] };
//   }
// }

// export async function sendBulkRecoveryOffer(ids: string[], offerType: string) {
//   try {
//     await verifyAdminAccess();
//     console.log(`Sending ${offerType} to ${ids.length} customers...`);
//     return {
//       success: true,
//       message: `Offer dispatched to ${ids.length} customers.`,
//     };
//   } catch (e) {
//     return { success: false, message: "Action failed" };
//   }
// }

// // === ACTION: GET PRODUCT FRICTION DATA ===
// export async function getProductFrictionPayload(range: {
//   from: Date;
//   to: Date;
// }): Promise<ProductFrictionItem[]> {
//   try {
//     await verifyAdminAccess();
//     await connectMongoose();
//     const payload = await getPayload({ config: configPromise });

//     // 1. Get Product View & ATC Events
//     const events = await UserEvent.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: range.from, $lte: range.to },
//           eventType: { $in: ["page_view", "add_to_cart"] },
//         },
//       },
//       {
//         $group: {
//           _id: { productId: "$metadata.productId", type: "$eventType" },
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // 2. Get Successful Orders for these products
//     const sales = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: range.from, $lte: range.to },
//           status: { $ne: "Cancelled" },
//         },
//       },
//       { $unwind: "$products" },
//       {
//         $group: {
//           _id: "$products.productId",
//           orderCount: { $sum: "$products.quantity" },
//         },
//       },
//     ]);

//     const salesMap = new Map(sales.map((s) => [s._id, s.orderCount]));
//     const productStats = new Map<string, { views: number; atc: number }>();

//     events.forEach((e) => {
//       const pId = e._id.productId;
//       if (!pId) return;
//       const current = productStats.get(pId) || { views: 0, atc: 0 };
//       if (e._id.type === "page_view") current.views = e.count;
//       if (e._id.type === "add_to_cart") current.atc = e.count;
//       productStats.set(pId, current);
//     });

//     // 3. Fetch Product Details from Payload for UI
//     const productIds = Array.from(productStats.keys());
//     const productsRes = await payload.find({
//       collection: "products",
//       where: { id: { in: productIds } },
//       depth: 1,
//     });

//     const finalData: ProductFrictionItem[] = productsRes.docs.map((p: any) => {
//       const stats = productStats.get(p.id) || { views: 0, atc: 0 };
//       const orders = salesMap.get(p.id) || 0;

//       const v2c = stats.views > 0 ? (stats.atc / stats.views) * 100 : 0;
//       const c2o = stats.atc > 0 ? (orders / stats.atc) * 100 : 0;

//       // Friction Logic:
//       // Agar views bohat hain par ATC kam -> Low Interest (Alert)
//       // Agar ATC bohat hain par Order kam -> Price/Shipping Barrier (Alert)
//       let alert: any = "STABLE";
//       let friction = 0;

//       if (stats.views > 50 && v2c < 5) {
//         alert = "LOW_INTEREST";
//         friction = 80;
//       } else if (stats.atc > 10 && c2o < 10) {
//         alert = "PRICE_BARRIER";
//         friction = 90;
//       } else if (v2c > 15 && c2o > 20) {
//         alert = "WINNER";
//         friction = 10;
//       }

//       return {
//         id: p.id,
//         name: p.title,
//         image: p.variants?.[0]?.images?.[0]?.url || "",
//         views: stats.views,
//         atc: stats.atc,
//         orders: orders,
//         viewToCartRatio: Number(v2c.toFixed(1)),
//         cartToOrderRatio: Number(c2o.toFixed(1)),
//         frictionScore: friction,
//         alert,
//       };
//     });

//     return finalData.sort((a, b) => b.views - a.views).slice(0, 15);
//   } catch (e) {
//     return [];
//   }
// }
// // === ACTION: SEND CUSTOM BULK EMAIL ===
// export async function sendBulkMarketingEmail(
//   recipientIds: string[],
//   subject: string,
//   htmlContent: string,
// ) {
//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     // 1. Re-fetch details of these specific leads/carts
//     const leads = await AbandonedCart.find({
//       _id: { $in: recipientIds },
//     }).lean();

//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST!,
//       port: Number(process.env.SMTP_PORT!),
//       auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
//     });

//     // 2. Loop through and send (Personalized)
//     const sendPromises = leads.map((lead) => {
//       if (!lead.email) return Promise.resolve();

//       // Dynamic Tag Replacement logic
//       let personalizedHtml = htmlContent
//         .replace(/{{name}}/g, lead.email.split("@")[0])
//         .replace(/{{value}}/g, `Rs. ${lead.subtotal.toLocaleString()}`);

//       return transporter.sendMail({
//         from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
//         to: lead.email,
//         subject: subject,
//         html: personalizedHtml,
//       });
//     });

//     await Promise.all(sendPromises);
//     return {
//       success: true,
//       message: `Successfully sent ${leads.length} emails.`,
//     };
//   } catch (e: any) {
//     return { success: false, message: e.message };
//   }
// }

// // === ACTION: GET PAGINATED SEGMENT DATA ===
// export async function getPaginatedSegment(
//   type: "ABANDONED" | "HOT_LEAD" | "VIP",
//   page: number = 1,
//   limit: number = 10,
// ) {
//   try {
//     await verifyAdminAccess();
//     await connectMongoose();
//     const skip = (page - 1) * limit;

//     let data = [];
//     let total = 0;

//     if (type === "VIP") {
//       const thirtyDaysAgo = new Date(
//         new Date().setDate(new Date().getDate() - 30),
//       );
//       const vips = await Order.aggregate([
//         {
//           $match: {
//             createdAt: { $gte: thirtyDaysAgo },
//             status: { $ne: "Cancelled" },
//           },
//         },
//         {
//           $group: {
//             _id: "$userId",
//             totalSpent: { $sum: "$totalPrice" },
//             count: { $sum: 1 },
//           },
//         },
//         { $match: { count: { $gte: 2 } } },
//         { $sort: { totalSpent: -1 } },
//         { $skip: skip },
//         { $limit: limit },
//       ]);
//       total =
//         (
//           await Order.aggregate([
//             { $match: { createdAt: { $gte: thirtyDaysAgo } } },
//             { $group: { _id: "$userId", count: { $sum: 1 } } },
//             { $match: { count: { $gte: 2 } } },
//             { $count: "total" },
//           ])
//         )[0]?.total || 0;
//       data = vips;
//     } else {
//       const query =
//         type === "HOT_LEAD"
//           ? { contactCaptured: true, isRecovered: false }
//           : { contactCaptured: false, isRecovered: false };
//       [data, total] = await Promise.all([
//         AbandonedCart.find(query)
//           .sort({ lastUpdated: -1 })
//           .skip(skip)
//           .limit(limit)
//           .lean(),
//         AbandonedCart.countDocuments(query),
//       ]);
//     }

//     return {
//       data: JSON.parse(JSON.stringify(data)),
//       totalPages: Math.ceil(total / limit),
//       totalDocs: total,
//     };
//   } catch (e) {
//     return { data: [], totalPages: 0, totalDocs: 0 };
//   }
// }

// // === ACTION: SEND BULK CAMPAIGN ===
// export async function sendBulkCampaign(
//   ids: string[],
//   subject: string,
//   message: string,
// ) {
//   try {
//     await verifyAdminAccess();
//     // Yahan aapka Nodemailer logic aayega jo pehle discuss hua tha
//     console.log(
//       `Sending Bulk Email to ${ids.length} users. Subject: ${subject}`,
//     );
//     return {
//       success: true,
//       message: `Campaign dispatched to ${ids.length} users.`,
//     };
//   } catch (e: any) {
//     return { success: false, message: e.message };
//   }
// }
"use server";

import { auth } from "@/app/auth";
import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import connectMongoose from "@/app/lib/mongoose";
import UserSession from "@/models/UserSession";
import UserEvent from "@/models/UserEvent";
import AbandonedCart from "@/models/AbandonedCart";
import Order from "@/models/Order";
import User from "@/models/User";
import nodemailer from "nodemailer";
import {
  subMinutes,
  startOfDay,
  subDays,
  eachHourOfInterval,
  format,
} from "date-fns";

// ============================================================================
// 1. FINALIZED STRICT TYPE DEFINITIONS
// ============================================================================

export interface MarketingHubData {
  livePulse: { activeUsers: number; lastScan: string };
  deviceSplit: { name: string; value: number; fill: string }[];
  funnel: { label: string; value: number; percentage: number }[];
  recoveryStats: {
    totalAbandonedValue: number;
    pendingCartCount: number;
    leadsCaptured: number;
  };
  hourlyPulse: { time: string; rate: number }[];
}

export interface CampaignIntelligenceItem {
  id: string;
  source: string;
  campaign: string;
  visits: number;
  uniqueVisitors: number;
  productViews: number;
  addCarts: number;
  checkouts: number;
  orders: number;
  revenue: number;
  aov: number;
  conversionRate: number;
  cartAbandonment: number;
  checkoutDropoff: number;
}

export interface AudienceMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  value: number;
  itemsCount: number;
  lastActive: string;
  type: "ABANDONED" | "HOT_LEAD" | "VIP";
}

export interface ProductFrictionItem {
  id: string;
  name: string;
  image: string;
  views: number;
  atc: number;
  orders: number;
  viewToCartRatio: number;
  cartToOrderRatio: number;
  frictionScore: number;
  alert: "LOW_INTEREST" | "PRICE_BARRIER" | "WINNER" | "STABLE";
}

// ============================================================================
// 2. SECURITY GUARD
// ============================================================================

async function verifyAdminAccess() {
  const session = await auth();
  if (
    session?.user?.role &&
    ["Super Admin", "Store Manager"].includes(session.user.role)
  )
    return true;
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  if (user) return true;
  throw new Error("UNAUTHORIZED: Admin Access Only.");
}

// ============================================================================
// 3. MASTER ACTION 1: MARKETING HUB INTELLIGENCE (Radar, Funnel, Stock Chart)
// ============================================================================

export async function getMarketingIntelligencePayload(): Promise<MarketingHubData | null> {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const now = new Date();
    const todayStart = startOfDay(now);
    const activeThreshold = subMinutes(now, 5);

    const [
      activeUsers,
      liveDeviceStats,
      funnelEvents,
      todayOrders,
      abandonedCarts,
      hourlyStats,
    ] = await Promise.all([
      UserSession.countDocuments({ lastPulse: { $gte: activeThreshold } }),
      UserSession.aggregate([
        { $match: { lastPulse: { $gte: activeThreshold } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
      ]),
      UserEvent.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
      Order.find({
        createdAt: { $gte: todayStart },
        status: { $ne: "Cancelled" },
      }).lean(),
      AbandonedCart.find({
        isRecovered: false,
        lastUpdated: { $gte: todayStart },
      }).lean(),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        {
          $group: {
            _id: { hour: { $hour: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const hours = eachHourOfInterval({ start: todayStart, end: now });
    const eventMap = new Map(funnelEvents.map((e) => [e._id, e.count]));
    const totalVisits = activeUsers + (eventMap.get("page_view") || 0);

    return {
      livePulse: { activeUsers, lastScan: now.toISOString() },
      deviceSplit: liveDeviceStats.map((d, i) => ({
        name: (d._id || "Desktop").toUpperCase(),
        value: d.count,
        fill: ["#3b82f6", "#10b981", "#f59e0b"][i % 3],
      })),
      funnel: [
        { label: "Total Visits", value: totalVisits, percentage: 100 },
        {
          label: "Product Views",
          value: eventMap.get("page_view") || 0,
          percentage:
            totalVisits > 0
              ? Number(
                  (
                    ((eventMap.get("page_view") || 0) / totalVisits) *
                    100
                  ).toFixed(1),
                )
              : 0,
        },
        {
          label: "Added to Cart",
          value: eventMap.get("add_to_cart") || 0,
          percentage:
            totalVisits > 0
              ? Number(
                  (
                    ((eventMap.get("add_to_cart") || 0) / totalVisits) *
                    100
                  ).toFixed(1),
                )
              : 0,
        },
        {
          label: "Checkout Started",
          value: eventMap.get("checkout_start") || 0,
          percentage:
            totalVisits > 0
              ? Number(
                  (
                    ((eventMap.get("checkout_start") || 0) / totalVisits) *
                    100
                  ).toFixed(1),
                )
              : 0,
        },
        {
          label: "Purchased",
          value: todayOrders.length,
          percentage:
            totalVisits > 0
              ? Number(((todayOrders.length / totalVisits) * 100).toFixed(1))
              : 0,
        },
      ],
      recoveryStats: {
        totalAbandonedValue: abandonedCarts.reduce(
          (sum, c: any) => sum + (c.subtotal || 0),
          0,
        ),
        pendingCartCount: abandonedCarts.length,
        leadsCaptured: abandonedCarts.filter((c: any) => c.contactCaptured)
          .length,
      },
      hourlyPulse: hours.map((h) => ({
        time: format(h, "HH:mm"),
        rate: hourlyStats.find((s) => s._id.hour === h.getHours())?.count || 0,
      })),
    };
  } catch (e) {
    return null;
  }
}

// ============================================================================
// 4. MASTER ACTION 2: THE CAMPAIGN SURGEON (Deep Attribution)
// ============================================================================

export async function getDeepCampaignIntelligence(range: {
  from: Date;
  to: Date;
}): Promise<CampaignIntelligenceItem[]> {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    const [traffic, sales, events] = await Promise.all([
      UserSession.aggregate([
        { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
        {
          $group: {
            _id: {
              s: { $toUpper: { $ifNull: ["$utmSource", "DIRECT"] } },
              c: { $toUpper: { $ifNull: ["$utmCampaign", "NONE"] } },
            },
            visits: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $ne: "Cancelled" },
          },
        },
        {
          $group: {
            _id: {
              s: { $toUpper: { $ifNull: ["$trafficSource.source", "DIRECT"] } },
              c: { $toUpper: { $ifNull: ["$trafficSource.campaign", "NONE"] } },
            },
            count: { $sum: 1 },
            rev: { $sum: "$totalPrice" },
          },
        },
      ]),
      UserEvent.aggregate([
        { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
        {
          $lookup: {
            from: "usersessions",
            localField: "sessionId",
            foreignField: "sessionId",
            as: "session",
          },
        },
        { $unwind: "$session" },
        {
          $group: {
            _id: {
              s: { $toUpper: { $ifNull: ["$session.utmSource", "DIRECT"] } },
              c: { $toUpper: { $ifNull: ["$session.utmCampaign", "NONE"] } },
              t: "$eventType",
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const masterMap = new Map<string, CampaignIntelligenceItem>();

    // Step 1: Initialize from Traffic
    traffic.forEach((t) => {
      const key = `${t._id.s}_${t._id.c}`;
      masterMap.set(key, {
        id: key,
        source: t._id.s,
        campaign: t._id.c,
        visits: t.visits,
        uniqueVisitors: t.visitors.length,
        productViews: 0,
        addCarts: 0,
        checkouts: 0,
        orders: 0,
        revenue: 0,
        aov: 0,
        conversionRate: 0,
        cartAbandonment: 0,
        checkoutDropoff: 0,
      });
    });

    // Step 2: Map Events (Cart/Checkout)
    events.forEach((e) => {
      const entry = masterMap.get(`${e._id.s}_${e._id.c}`);
      if (entry) {
        if (e._id.t === "page_view") entry.productViews = e.count;
        if (e._id.t === "add_to_cart") entry.addCarts = e.count;
        if (e._id.t === "checkout_start") entry.checkouts = e.count;
      }
    });

    // Step 3: Map Orders (Revenue)
    sales.forEach((s) => {
      const key = `${s._id.s}_${s._id.c}`;
      let entry = masterMap.get(key);
      if (!entry) {
        // Fallback if session data is missing but order exists
        entry = {
          id: key,
          source: s._id.s,
          campaign: s._id.c,
          visits: s.count,
          uniqueVisitors: 1,
          productViews: 0,
          addCarts: s.count,
          checkouts: s.count,
          orders: 0,
          revenue: 0,
          aov: 0,
          conversionRate: 0,
          cartAbandonment: 0,
          checkoutDropoff: 0,
        };
        masterMap.set(key, entry);
      }
      entry.orders = s.count;
      entry.revenue = s.rev;
    });

    return Array.from(masterMap.values())
      .map((d) => ({
        ...d,
        aov: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
        conversionRate:
          d.visits > 0 ? Number(((d.orders / d.visits) * 100).toFixed(1)) : 0,
        cartAbandonment:
          d.addCarts > 0
            ? Number((((d.addCarts - d.orders) / d.addCarts) * 100).toFixed(1))
            : 0,
        checkoutDropoff:
          d.checkouts > 0
            ? Number(
                (((d.checkouts - d.orders) / d.checkouts) * 100).toFixed(1),
              )
            : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  } catch (e) {
    return [];
  }
}

// ============================================================================
// 5. CRM & AUDIENCE (Vault, Segments, Bulk Email)
// ============================================================================

export async function getAudienceVaultData() {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const thirtyDaysAgo = subDays(new Date(), 30);
    const [carts, vips] = await Promise.all([
      AbandonedCart.find({ isRecovered: false })
        .sort({ lastUpdated: -1 })
        .limit(100)
        .lean(),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: "Cancelled" },
          },
        },
        {
          $group: {
            _id: "$userId",
            total: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gte: 2 } } },
      ]),
    ]);
    const vipUsers = (await User.find({ _id: { $in: vips.map((v) => v._id) } })
      .select("name email phone")
      .lean()) as any[];
    const abandoned: AudienceMember[] = [];
    const hotLeads: AudienceMember[] = [];
    carts.forEach((c: any) => {
      const m: AudienceMember = {
        id: c._id.toString(),
        name: c.contactCaptured ? c.email || c.phone : "Guest",
        email: c.email,
        phone: c.phone,
        value: c.subtotal || 0,
        itemsCount: c.items?.length || 0,
        lastActive: c.lastUpdated.toISOString(),
        type: c.contactCaptured ? "HOT_LEAD" : "ABANDONED",
      };
      c.contactCaptured ? hotLeads.push(m) : abandoned.push(m);
    });
    return {
      abandoned,
      hotLeads,
      vips: vips.map((v) => ({
        id: v._id.toString(),
        name:
          vipUsers.find((u) => u._id.toString() === v._id.toString())?.name ||
          "VIP",
        email: vipUsers.find((u) => u._id.toString() === v._id.toString())
          ?.email,
        phone: vipUsers.find((u) => u._id.toString() === v._id.toString())
          ?.phone,
        value: v.total,
        itemsCount: v.count,
        lastActive: new Date().toISOString(),
        type: "VIP",
      })) as AudienceMember[],
    };
  } catch (e) {
    return { abandoned: [], hotLeads: [], vips: [] };
  }
}

export async function getPaginatedSegment(
  type: "ABANDONED" | "HOT_LEAD" | "VIP",
  page: number = 1,
  limit: number = 10,
) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const skip = (page - 1) * limit;
    let data = [];
    let total = 0;
    if (type === "VIP") {
      const vips = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: subDays(new Date(), 30) },
            status: { $ne: "Cancelled" },
          },
        },
        {
          $group: {
            _id: "$userId",
            total: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gte: 2 } } },
        { $sort: { total: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      data = vips;
      total = vips.length;
    } else {
      const q =
        type === "HOT_LEAD"
          ? { contactCaptured: true, isRecovered: false }
          : { contactCaptured: false, isRecovered: false };
      [data, total] = await Promise.all([
        AbandonedCart.find(q)
          .sort({ lastUpdated: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AbandonedCart.countDocuments(q),
      ]);
    }
    return {
      data: JSON.parse(JSON.stringify(data)),
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
    };
  } catch (e) {
    return { data: [], totalPages: 0, totalDocs: 0 };
  }
}

export async function sendBulkCampaign(
  ids: string[],
  subject: string,
  html: string,
) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const leads = await AbandonedCart.find({ _id: { $in: ids } }).lean();
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });
    await Promise.all(
      leads.map((l) =>
        l.email
          ? transporter.sendMail({
              from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
              to: l.email,
              subject,
              html: html
                .replace(/{{name}}/g, l.email.split("@")[0])
                .replace(/{{value}}/g, `Rs. ${l.subtotal.toLocaleString()}`),
            })
          : Promise.resolve(),
      ),
    );
    return { success: true, message: "Campaign Dispatched." };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

// ============================================================================
// 6. DIAGNOSTICS: PRODUCT FRICTION MATRIX
// ============================================================================

export async function getProductFrictionPayload(range: {
  from: Date;
  to: Date;
}): Promise<ProductFrictionItem[]> {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });
    const [events, sales] = await Promise.all([
      UserEvent.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            eventType: { $in: ["page_view", "add_to_cart"] },
          },
        },
        {
          $group: {
            _id: { pId: "$metadata.productId", type: "$eventType" },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.from, $lte: range.to },
            status: { $ne: "Cancelled" },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            count: { $sum: "$products.quantity" },
          },
        },
      ]),
    ]);
    const salesMap = new Map(sales.map((s) => [s._id, s.count]));
    const statMap = new Map<string, { v: number; a: number }>();
    events.forEach((e) => {
      if (!e._id.pId) return;
      const cur = statMap.get(e._id.pId) || { v: 0, a: 0 };
      e._id.type === "page_view" ? (cur.v = e.count) : (cur.a = e.count);
      statMap.set(e._id.pId, cur);
    });
    const products = await payload.find({
      collection: "products",
      where: { id: { in: Array.from(statMap.keys()) } },
      depth: 1,
    });
    return products.docs
      .map((p: any) => {
        const st = statMap.get(p.id) || { v: 0, a: 0 };
        const ord = salesMap.get(p.id) || 0;
        const v2c = st.v > 0 ? (st.a / st.v) * 100 : 0;
        const c2o = st.a > 0 ? (ord / st.a) * 100 : 0;
        let alert: any = "STABLE";
        let score = 0;
        if (st.v > 20 && v2c < 5) {
          alert = "LOW_INTEREST";
          score = 80;
        } else if (st.a > 3 && c2o < 10) {
          alert = "PRICE_BARRIER";
          score = 90;
        } else if (v2c > 15 && c2o > 20) {
          alert = "WINNER";
          score = 10;
        }
        return {
          id: p.id,
          name: p.title,
          image: p.variants?.[0]?.images?.[0]?.url || "",
          views: st.v,
          atc: st.a,
          orders: ord,
          viewToCartRatio: Number(v2c.toFixed(1)),
          cartToOrderRatio: Number(c2o.toFixed(1)),
          frictionScore: score,
          alert,
        };
      })
      .sort((a, b) => b.views - a.views);
  } catch (e) {
    return [];
  }
}
