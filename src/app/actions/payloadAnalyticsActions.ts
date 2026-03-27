"use server";

import { auth } from "@/app/auth";
import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import {
  startOfDay,
  subDays,
  eachDayOfInterval,
  format,
  differenceInDays,
} from "date-fns";

// --- STRICT TYPE DEFINITIONS ---

export interface ExecutiveSummary {
  revenue: {
    gross: number;
    netProfitEstimate: number;
    growthPercentage: number;
  };
  orders: {
    total: number;
    velocity: number;
    avgOrderValue: number;
  };
  customers: {
    total: number;
    newToday: number;
  };
  inventory: {
    totalVariants: number;
    criticalStockCount: number;
    outOfStockCount: number;
  };
}

interface DateRange {
  from: Date;
  to: Date;
}

// 🔐 Universal Security Guard
async function verifyAdminAccess(): Promise<boolean> {
  const session = await auth();
  if (
    session?.user?.role &&
    ["Super Admin", "Store Manager"].includes(session.user.role)
  )
    return true;

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  if (user) return true;

  throw new Error(
    "Unauthorized: Intelligence access restricted to Admins only.",
  );
}

// === 1. GET EXECUTIVE ANALYTICS (Today vs Yesterday or Range vs Previous Range) ===
export async function getExecutiveAnalyticsPayload(
  range: DateRange,
): Promise<ExecutiveSummary | null> {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });

    const settings = await payload.findGlobal({ slug: "settings" });
    const pricingTiers = settings.pricingLogicTiers || [];
    const lowStockThreshold =
      settings.inventorySettings?.lowStockThreshold ?? 5;

    // Calculate Previous Range for Growth Percentage
    const daysDiff = differenceInDays(range.to, range.from) + 1;
    const prevRangeFrom = subDays(range.from, daysDiff);
    const prevRangeTo = subDays(range.to, daysDiff);

    const [currentOrders, prevOrders, totalUsers, newUsers, payloadProducts] =
      await Promise.all([
        Order.find({
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        }).lean(),
        Order.find({
          createdAt: { $gte: prevRangeFrom, $lte: prevRangeTo },
          status: { $ne: "Cancelled" },
        }).lean(),
        User.countDocuments({ role: "customer" }),
        User.countDocuments({
          createdAt: { $gte: range.from, $lte: range.to },
          role: "customer",
        }),
        payload.find({ collection: "products", limit: 5000, depth: 0 }),
      ]);

    const currentRevenue = currentOrders.reduce(
      (sum, o: any) => sum + (o.totalPrice || 0),
      0,
    );
    const prevRevenue = prevOrders.reduce(
      (sum, o: any) => sum + (o.totalPrice || 0),
      0,
    );

    const growth =
      prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    let pureProfit = 0;
    currentOrders.forEach((order: any) => {
      order.products.forEach((item: any) => {
        const price = item.price || 0;
        const tier =
          pricingTiers.find(
            (t: any) => price >= t.minCost && price <= t.maxCost,
          ) || pricingTiers[0];
        pureProfit +=
          ((price * (tier?.profitPercent || 0)) / 100) * (item.quantity || 0);
      });
    });

    const discounts = currentOrders.reduce(
      (sum, o: any) => sum + (o.coupon?.amount || 0),
      0,
    );

    let totalVariants = 0,
      criticalStock = 0,
      outOfStock = 0;
    payloadProducts.docs.forEach((product: any) => {
      product.variants?.forEach((v: any) => {
        totalVariants++;
        const s = v.stock ?? 0;
        if (s <= 0) outOfStock++;
        else if (s <= lowStockThreshold) criticalStock++;
      });
    });

    return {
      revenue: {
        gross: currentRevenue,
        netProfitEstimate: pureProfit - discounts,
        growthPercentage: Number(growth.toFixed(2)),
      },
      orders: {
        total: currentOrders.length,
        velocity: Number((currentOrders.length / 24).toFixed(2)),
        avgOrderValue:
          currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0,
      },
      customers: { total: totalUsers, newToday: newUsers },
      inventory: {
        totalVariants,
        criticalStockCount: criticalStock,
        outOfStockCount: outOfStock,
      },
    };
  } catch (error: any) {
    console.error("Executive Engine Error:", error.message);
    return null;
  }
}

// === 2. SALES CHART DATA ===
export async function getSalesChartDataPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+05:00",
            },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const allDays = eachDayOfInterval({ start: range.from, end: range.to });
    const dataMap = new Map(result.map((i) => [i._id, i]));

    return allDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayData = dataMap.get(dateStr);
      return {
        date: format(day, "MMM dd"),
        revenue: dayData ? dayData.revenue : 0,
        orders: dayData ? dayData.orders : 0,
      };
    });
  } catch (error: any) {
    console.error("Chart Engine Error:", error.message);
    return [];
  }
}

// === 3. TOP PRODUCTS ===
export async function getTopProductsPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    return await Order.aggregate([
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
          name: { $first: "$products.name" },
          variantName: { $first: "$products.variant.name" },
          totalSold: { $sum: "$products.quantity" },
          revenue: {
            $sum: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
  } catch (error) {
    return [];
  }
}

// === 4. TRAFFIC ATTRIBUTION (Optimized for Modern Recharts) ===
export async function getTrafficAttributionPayload(range: { from: Date; to: Date }) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    
    // Pocket Value Standard Colors
    const COLORS = ["#D11111", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    
    const attribution = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $ifNull: ["$trafficSource.source", "Direct/Organic"] },
          revenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    return attribution.map((item, index) => ({
      name: item._id.toUpperCase(),
      value: item.revenue,
      orders: item.orderCount,
      // ✅ Key Fix: Color data ke andar shamil hai, is se 'Cell' ki zaroorat nahi rahegi
      fill: COLORS[index % COLORS.length], 
    }));
  } catch (error) {
    console.error("Traffic Engine Failure:", error);
    return [];
  }
}

// === 5. OPERATIONAL INTELLIGENCE ===
export async function getOperationalIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const [total, pending, delivered, cancelled] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: range.from, $lte: range.to } }),
      Order.find({
        createdAt: { $gte: range.from, $lte: range.to },
        status: { $in: ["Pending", "On Hold"] },
      }).lean(),
      Order.countDocuments({
        createdAt: { $gte: range.from, $lte: range.to },
        status: "Delivered",
      }),
      Order.countDocuments({
        createdAt: { $gte: range.from, $lte: range.to },
        status: "Cancelled",
      }),
    ]);
    const limboRevenue = pending.reduce(
      (sum, o: any) => sum + (o.totalPrice || 0),
      0,
    );
    return {
      limboRevenue,
      fulfillmentRate:
        total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0,
      leakageRate:
        total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
      pendingCount: pending.length,
    };
  } catch (error) {
    return null;
  }
}

// === 6. BEHAVIORAL INTELLIGENCE ===
export async function getBehavioralIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });
    const [settings, totalUsers, newUsers] = await Promise.all([
      payload.findGlobal({ slug: "settings" }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({
        role: "customer",
        createdAt: { $gte: range.from, $lte: range.to },
      }),
    ]);
    const categories = await payload.find({
      collection: "categories",
      limit: 10,
      depth: 0,
    });
    const categoryPulse = await Promise.all(
      categories.docs.map(async (cat: any) => {
        const count = await payload.count({
          collection: "products",
          where: { categories: { in: [cat.id] } },
        });
        return { name: cat.name, count: count.totalDocs };
      }),
    );
    return {
      loyaltyIndex:
        totalUsers > 0
          ? Number((((totalUsers - newUsers) / totalUsers) * 100).toFixed(1))
          : 0,
      trendingKeywords:
        settings.searchSettings?.trendingKeywords?.map((k: any) => k.keyword) ||
        [],
      categoryPulse: categoryPulse
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      newCustomerRate:
        totalUsers > 0 ? Number(((newUsers / totalUsers) * 100).toFixed(1)) : 0,
    };
  } catch (error) {
    return null;
  }
}


// === 7. GRANULAR FINANCIALS (THE SURGEON ENGINE) ===
export async function getGranularFinancialsPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: "settings" });

    const totalFixedFeePercent = (settings.globalFixedFees || []).reduce((sum: number, f: any) => sum + (f.percentage || 0), 0);
    const pricingTiers = settings.pricingLogicTiers || [];

    const orders = await Order.find({
      createdAt: { $gte: range.from, $lte: range.to },
      status: { $ne: "Cancelled" },
    }).lean();

    let tCapital = 0, tAds = 0, tFees = 0, tProfit = 0, tRevenue = 0, tShip = 0;

    orders.forEach((o: any) => {
      tRevenue += o.totalPrice || 0;
      tShip += o.shippingCost || 0;

      o.products.forEach((item: any) => {
        const salePrice = item.price || 0;
        const qty = item.quantity || 0;

        // Dynamic Bracket Matching
        const tier = pricingTiers.find((t: any) => salePrice >= t.minCost && salePrice <= t.maxCost) || pricingTiers[0];
        
        // 🧮 Calculations based on Reverse Logic
        const profit = (salePrice * (tier.profitPercent || 0)) / 100;
        const ads = (salePrice * (tier.adSpendPercent || 0)) / 100;
        const fees = (salePrice * totalFixedFeePercent) / 100;
        
        // Asal qimat (Residual)
        const capital = salePrice - profit - ads - fees;

        tProfit += profit * qty;
        tAds += ads * qty;
        tFees += fees * qty;
        tCapital += capital * qty;
      });
    });

    const discounts = orders.reduce((sum, o: any) => sum + (o.coupon?.amount || 0), 0);

    return {
      originalPrice: tCapital,
      adSpend: tAds, // ✅ FIXED: Now returns actual calculated ads
      platformFees: tFees, // ✅ FIXED: Now returns actual calculated fees
      operationalExpenses: tAds + tFees,
      shipping: tShip,
      pureProfit: tProfit - discounts,
      grossTotal: tRevenue,
      marginPercent: tRevenue > 0 ? ((tProfit - discounts) / tRevenue) * 100 : 0,
    };
  } catch (error) {
    console.error("Surgeon Error:", error);
    return null;
  }
}


// === 8. INVENTORY FORECASTER ===
export async function getInventoryForecasterPayload() {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });
    const fifteenDaysAgo = subDays(new Date(), 15);
    const [orders, productsRes] = await Promise.all([
      Order.find({
        createdAt: { $gte: fifteenDaysAgo },
        status: { $nin: ["Cancelled"] },
      }).lean(),
      payload.find({ collection: "products", limit: 5000, depth: 0 }),
    ]);
    const salesMap = new Map<string, number>();
    orders.forEach((o: any) =>
      o.products.forEach((p: any) => {
        const vId = p.variant?._key || p.variant?.id;
        salesMap.set(vId, (salesMap.get(vId) || 0) + (p.quantity || 0));
      }),
    );
    const predictions: any[] = [];
    productsRes.docs.forEach((p: any) =>
      p.variants?.forEach((v: any) => {
        const sold = salesMap.get(v.id) || salesMap.get(v._key) || 0;
        const velocity = sold / 15;
        const stock = v.stock || 0;
        const daysLeft = velocity > 0 ? Math.floor(stock / velocity) : Infinity;
        if (sold > 0 || stock < 10)
          predictions.push({
            name: p.title,
            variant: v.name,
            stock,
            velocity: velocity.toFixed(2),
            daysLeft: daysLeft === Infinity ? "Stable" : daysLeft,
            priority: daysLeft < 3 ? "CRITICAL" : daysLeft < 7 ? "HIGH" : "LOW",
          });
      }),
    );
    return predictions
      .sort((a, b) =>
        typeof a.daysLeft === "string"
          ? 1
          : typeof b.daysLeft === "string"
            ? -1
            : a.daysLeft - b.daysLeft,
      )
      .slice(0, 6);
  } catch (error) {
    return [];
  }
}

// === 9. GEOSPATIAL INTELLIGENCE ===
export async function getGeospatialIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const cityData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $toUpper: "$shippingAddress.city" },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
    ]);
    return cityData.map((item) => ({
      city: item._id,
      revenue: item.revenue,
      orders: item.orders,
    }));
  } catch (error) {
    return [];
  }
}

// === 10. AI SENTINEL ===
export async function getAISentinelPayload() {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const now = new Date();
    const [recent, highValue, hourly] = await Promise.all([
      Order.find({ createdAt: { $gte: subDays(now, 1) } }).lean(),
      Order.find({ totalPrice: { $gt: 10000 }, status: "Pending" })
        .limit(3)
        .lean(),
      Order.countDocuments({ createdAt: { $gte: subDays(now, 1) } }),
    ]);
    const alerts: any[] = [];
    if (recent.length === 0)
      alerts.push({
        type: "CRITICAL",
        title: "Zero Activity",
        message: "No orders recently. Check flow.",
        timestamp: now.toISOString(),
      });
    highValue.forEach((o: any) =>
      alerts.push({
        type: "WARNING",
        title: "High Value Order",
        message: `Order #${o.orderId} is large. Verify.`,
        timestamp: o.createdAt.toISOString(),
      }),
    );
    return {
      status: alerts.length > 0 ? "ATTENTION" : "SECURE",
      alerts: alerts.slice(0, 4),
      lastScan: now.toISOString(),
    };
  } catch (error) {
    return { status: "ERROR", alerts: [], lastScan: new Date().toISOString() };
  }
}

export async function getLoyaltyIntelligencePayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const thirtyDaysAgo = subDays(new Date(), 30);
    const customerStats = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
    ]);
    let champions = 0,
      atRisk = 0,
      newbies = 0;
    customerStats.forEach((c) => {
      const isDormant = new Date(c.lastOrderDate) < thirtyDaysAgo;
      if (c.orderCount >= 3 && c.totalSpent > 5000) champions++;
      if (isDormant) atRisk++;
      if (c.orderCount === 1 && !isDormant) newbies++;
    });
    const total = customerStats.length;
    return {
      retentionRate:
        total > 0 ? Number((((total - atRisk) / total) * 100).toFixed(1)) : 0,
      churnRate: total > 0 ? Number(((atRisk / total) * 100).toFixed(1)) : 0,
      segments: { champions, atRisk, newbies },
      totalActiveBase: total,
    };
  } catch (error) {
    return null;
  }
}
