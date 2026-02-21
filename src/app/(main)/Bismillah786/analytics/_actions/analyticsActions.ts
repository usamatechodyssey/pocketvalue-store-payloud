
// /app/Bismillah786/analytics/_actions/analyticsActions.ts (UPGRADED TO MONGOOSE)

"use server";

import connectMongoose from "@/app/lib/mongoose"; // <-- FIX: Mongoose connection istemal karein
import Order from "@/models/Order"; // <-- FIX: Order model istemal karein
import User from "@/models/User"; // <-- FIX: User model istemal karein
import { startOfDay, subDays, format } from 'date-fns';

// --- Type definitions (No change) ---
export interface SourceData { source: string; sales: number; orders: number; }
export interface SalesTrendData { name: string; sales: number; }
export interface TopProductData { productId: string; name: string; totalQuantity: number; totalSales: number; }
export interface AnalyticsData {
  salesBySource: SourceData[];
  overall: { totalSales: number; totalOrders: number; averageOrderValue: number; };
  newUsers: number;
  salesTrend: SalesTrendData[];
  topProducts: TopProductData[];
}

export async function getAnalyticsData(days: number = 30): Promise<AnalyticsData> {
  try {
    await connectMongoose(); // Mongoose connection
    
    const endDate = new Date();
    const startDateForPeriod = startOfDay(subDays(endDate, days));
    const startDateForTrend = startOfDay(subDays(endDate, 6));

    const [overallStats, periodAnalytics, newUsers, salesTrendRaw] = await Promise.all([
        // Query 1: Overall stats (Mongoose syntax)
        Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: null, totalSales: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }
        ]),

        // Query 2: Period-specific stats (Mongoose syntax)
        Order.aggregate([
            { $match: { 
                createdAt: { $gte: startDateForPeriod, $lte: endDate }, 
                status: { $ne: "Cancelled" } 
            }},
            { $facet: {
                salesBySource: [
                    { $group: { _id: "$trafficSource.source", totalSales: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } },
                    { $project: { _id: 0, source: { $ifNull: ["$_id", "Direct"] }, sales: "$totalSales", orders: "$totalOrders" } },
                    { $sort: { sales: -1 } }
                ],
                topProducts: [
                    { $unwind: "$products" },
                    { $group: { _id: "$products.productId", name: { $first: "$products.name" }, totalQuantity: { $sum: "$products.quantity" }, totalSales: { $sum: { $multiply: ["$products.price", "$products.quantity"] } } } },
                    { $sort: { totalQuantity: -1 } }, { $limit: 5 },
                    { $project: { _id: 0, productId: "$_id", name: 1, totalQuantity: 1, totalSales: 1 } }
                ]
            }}
        ]),

        // Query 3: New users count (Mongoose syntax)
        User.countDocuments({ createdAt: { $gte: startDateForPeriod } }),

        // Query 4: Sales trend (Mongoose syntax)
        Order.aggregate([
            { $match: { createdAt: { $gte: startDateForTrend }, status: { $ne: "Cancelled" } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, dailySales: { $sum: "$totalPrice" } } },
            { $sort: { _id: 1 } }
        ]),
    ]);

    // --- Process results (No change, but now they are type-safe) ---
    const overallResult = overallStats[0] || { totalSales: 0, totalOrders: 0 };
    const periodResult = periodAnalytics[0] || { salesBySource: [], topProducts: [] };

    const overall = {
        totalSales: overallResult.totalSales,
        totalOrders: overallResult.totalOrders,
        averageOrderValue: overallResult.totalOrders > 0 ? overallResult.totalSales / overallResult.totalOrders : 0,
    };
    
    const salesTrend: SalesTrendData[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateString = format(date, 'yyyy-MM-dd');
        const dayName = format(date, 'EEE');
        const found = salesTrendRaw.find(d => d._id === dateString);
        salesTrend.push({ name: dayName, sales: found?.dailySales || 0 });
    }

    return {
      salesBySource: periodResult.salesBySource,
      overall,
      newUsers,
      salesTrend,
      topProducts: periodResult.topProducts,
    };
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return { salesBySource: [], overall: { totalSales: 0, totalOrders: 0, averageOrderValue: 0 }, newUsers: 0, salesTrend: [], topProducts: [] };
  }
}