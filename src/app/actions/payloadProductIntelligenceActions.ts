// "use server";

// import { getPayload } from "payload";
// import configPromise from "@payload-config";
// import connectMongoose from "@/app/lib/mongoose";
// import Order from "@/models/Order";
// import { subDays, differenceInDays } from "date-fns";

// export interface ProductIntelItem {
//   id: string;
//   name: string;
//   image: string | null;
//   category: string;
//   currentUnitsSold: number;
//   previousUnitsSold: number;
//   growth: number;
//   revenue: number;
//   revenueContribution: number;
//   returnRate: number;
//   currentStock: number;
//   trend: 'STAR' | 'FALLING' | 'STABLE';
// }

// export async function getProductIntelligencePayload(
//   range: { from: Date; to: Date },
//   page = 1,
//   limit = 50,
//   filters: { categoryId?: string; trend?: string } = {}
// ) {
//   try {
//     await connectMongoose();
//     const payload = await getPayload({ config: configPromise });

//     // 1. Timeframe Logic: Compare [Current Range] with [Equivalent Previous Range]
//     const daysDiff = differenceInDays(range.to, range.from) + 1;
//     const prevFrom = subDays(range.from, daysDiff);
//     const prevTo = subDays(range.to, daysDiff);

//     // 2. Fetch Base Data (Revenue for Contribution %)
//     const totalRevRes = await Order.aggregate([
//       { $match: { createdAt: { $gte: range.from, $lte: range.to }, status: { $ne: 'Cancelled' } } },
//       { $group: { _id: null, total: { $sum: "$totalPrice" } } }
//     ]);
//     const totalStoreRevenue = totalRevRes[0]?.total || 1;

//     // 3. Current Period (Units & Revenue)
//     const currentStats = await Order.aggregate([
//       { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
//       { $unwind: "$products" },
//       {
//         $group: {
//           _id: "$products.productId",
//           name: { $first: "$products.name" },
//           revenue: { $sum: { $cond: [{ $ne: ["$status", "Cancelled"] }, { $multiply: ["$products.price", "$products.quantity"] }, 0] } },
//           units: { $sum: "$products.quantity" },
//           cancelledUnits: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, "$products.quantity", 0] } }
//         }
//       }
//     ]);

//     // 4. Previous Period (Trend Compare)
//     const prevStats = await Order.aggregate([
//       { $match: { createdAt: { $gte: prevFrom, $lte: prevTo }, status: { $ne: 'Cancelled' } } },
//       { $unwind: "$products" },
//       { $group: { _id: "$products.productId", units: { $sum: "$products.quantity" } } }
//     ]);
//     const prevMap = new Map(prevStats.map(i => [i._id, i.units]));

//     // 5. Payload Data (Stock & Category)
//     const payloadProducts = await payload.find({ collection: 'products', limit: 5000, depth: 1 });
//     const payloadMap = new Map(payloadProducts.docs.map((p: any) => [p.id, p]));

//     // 6. Primary Mapping
//     let finalIntel: ProductIntelItem[] = currentStats.map(item => {
//       const pDoc = payloadMap.get(item._id);
//       const pUnits = prevMap.get(item._id) || 0;
//       const cUnits = item.units || 0;
//       const growth = pUnits > 0 ? ((cUnits - pUnits) / pUnits) * 100 : (cUnits > 0 ? 100 : 0);

//       let trend: 'STAR' | 'FALLING' | 'STABLE' = 'STABLE';
//       if (growth > 15) trend = 'STAR';
//       else if (growth < -15) trend = 'FALLING';

//       return {
//         id: item._id,
//         name: item.name,
//         image: pDoc?.variants?.[0]?.images?.[0]?.url || null,
//         category: pDoc?.categories?.[0]?.name || 'No Category',
//         currentUnitsSold: cUnits,
//         previousUnitsSold: pUnits,
//         growth: Number(growth.toFixed(1)),
//         revenue: item.revenue,
//         revenueContribution: Number(((item.revenue / totalStoreRevenue) * 100).toFixed(1)),
//         returnRate: cUnits > 0 ? Number(((item.cancelledUnits / cUnits) * 100).toFixed(1)) : 0,
//         currentStock: pDoc?.variants?.reduce((s: number, v: any) => s + (v.stock || 0), 0) || 0,
//         trend
//       };
//     });

//     // 7. 🔥 APPLY FILTERS
//     if (filters.categoryId) {
//         finalIntel = finalIntel.filter(item => {
//             const doc = payloadMap.get(item.id);
//             return doc?.categories?.some((c: any) => (typeof c === 'string' ? c : c.id) === filters.categoryId);
//         });
//     }

//     if (filters.trend) {
//         if (filters.trend === 'STAR') finalIntel = finalIntel.filter(i => i.trend === 'STAR');
//         else if (filters.trend === 'FALLING') finalIntel = finalIntel.filter(i => i.trend === 'FALLING');
//         else if (filters.trend === 'OOS') finalIntel = finalIntel.filter(i => i.currentStock <= 0);
//     }

//     const sorted = finalIntel.sort((a, b) => b.revenue - a.revenue);

//     return {
//       data: sorted.slice((page - 1) * limit, page * limit),
//       totalDocs: sorted.length,
//       totalPages: Math.ceil(sorted.length / limit)
//     };
//   } catch (error: any) {
//     console.error("Intelligence Action Failure:", error.message);
//     return { data: [], totalDocs: 0, totalPages: 0 };
//   }
// }

// export async function getProductDrillDownPayload(productId: string) {
//   try {
//     await connectMongoose();
//     const payload = await getPayload({ config: configPromise });

//     // 1. Fetch Product Details
//     const product = await payload.findByID({
//       collection: 'products',
//       id: productId,
//       depth: 1
//     });

//     // 2. Fetch Recent Orders for this specific product
//     const recentOrders = await Order.find({
//       "products.productId": productId
//     })
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .select('orderId shippingAddress.fullName totalPrice status createdAt')
//     .lean();

//     return {
//       product: JSON.parse(JSON.stringify(product)),
//       recentOrders: JSON.parse(JSON.stringify(recentOrders))
//     };
//   } catch (error: any) {
//     console.error("Drill-down Engine Error:", error.message);
//     return null;
//   }
// }
"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { subDays, differenceInDays } from "date-fns";
import { verifyStaff } from "@/lib/payloadAuth"; // ✅ Naya Universal Guard

// --- TYPES (DTOs for Frontend Compatibility) ---
export interface ProductIntelItem {
  id: string;
  name: string;
  image: string | null;
  category: string;
  currentUnitsSold: number;
  previousUnitsSold: number;
  growth: number;
  revenue: number;
  revenueContribution: number;
  returnRate: number;
  currentStock: number;
  trend: "STAR" | "FALLING" | "STABLE";
}

/**
 * 🧠 GET PRODUCT INTELLIGENCE (The Comparison Engine)
 * Compares current range sales vs previous equivalent range sales.
 */
export async function getProductIntelligencePayload(
  range: { from: Date; to: Date },
  page = 1,
  limit = 50,
  filters: { categoryId?: string; trend?: string } = {},
) {
  try {
    // 🛡️ SECURITY LOCK: Staff access required
    await verifyStaff(["admin", "manager", "editor"]);

    await connectMongoose();
    const payload = await getPayload({ config: configPromise });

    // 1. Timeframe Logic: Compare [Current Range] with [Equivalent Previous Range]
    const daysDiff = differenceInDays(range.to, range.from) + 1;
    const prevFrom = subDays(range.from, daysDiff);
    const prevTo = subDays(range.to, daysDiff);

    // 2. Fetch Total Store Revenue for Contribution %
    const totalRevRes = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          status: { $ne: "Cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalStoreRevenue = totalRevRes[0]?.total || 1;

    // 3. Current Period Aggregation (Units & Revenue by Product)
    const currentStats = await Order.aggregate([
      { $match: { createdAt: { $gte: range.from, $lte: range.to } } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          name: { $first: "$products.name" },
          revenue: {
            $sum: {
              $cond: [
                { $ne: ["$status", "Cancelled"] },
                { $multiply: ["$products.price", "$products.quantity"] },
                0,
              ],
            },
          },
          units: { $sum: "$products.quantity" },
          cancelledUnits: {
            $sum: {
              $cond: [
                { $eq: ["$status", "Cancelled"] },
                "$products.quantity",
                0,
              ],
            },
          },
        },
      },
    ]);

    // 4. Previous Period Aggregation (For Trend Comparison)
    const prevStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevFrom, $lte: prevTo },
          status: { $ne: "Cancelled" },
        },
      },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          units: { $sum: "$products.quantity" },
        },
      },
    ]);
    const prevMap = new Map(prevStats.map((i) => [i._id, i.units]));

    // 5. Fetch Product Data from Payload (Stock & Categories)
    const payloadProducts = await payload.find({
      collection: "products",
      limit: 5000,
      depth: 1,
    });
    const payloadMap = new Map(payloadProducts.docs.map((p: any) => [p.id, p]));

    // 6. Data Mapping and Trend Logic
    let finalIntel: ProductIntelItem[] = currentStats.map((item) => {
      const pDoc = payloadMap.get(item._id);
      const pUnits = prevMap.get(item._id) || 0;
      const cUnits = item.units || 0;

      // Calculate Growth %
      const growth =
        pUnits > 0 ? ((cUnits - pUnits) / pUnits) * 100 : cUnits > 0 ? 100 : 0;

      let trend: "STAR" | "FALLING" | "STABLE" = "STABLE";
      if (growth > 15) trend = "STAR";
      else if (growth < -15) trend = "FALLING";

      return {
        id: item._id,
        name: item.name,
        image: pDoc?.variants?.[0]?.images?.[0]?.url || null,
        category: pDoc?.categories?.[0]?.name || "No Category",
        currentUnitsSold: cUnits,
        previousUnitsSold: pUnits,
        growth: Number(growth.toFixed(1)),
        revenue: item.revenue,
        revenueContribution: Number(
          ((item.revenue / totalStoreRevenue) * 100).toFixed(1),
        ),
        returnRate:
          cUnits > 0
            ? Number(((item.cancelledUnits / cUnits) * 100).toFixed(1))
            : 0,
        currentStock:
          pDoc?.variants?.reduce(
            (s: number, v: any) => s + (v.stock || 0),
            0,
          ) || 0,
        trend,
      };
    });

    // 7. Apply Dynamic Filters
    if (filters.categoryId) {
      finalIntel = finalIntel.filter((item) => {
        const doc = payloadMap.get(item.id);
        return doc?.categories?.some(
          (c: any) => (typeof c === "string" ? c : c.id) === filters.categoryId,
        );
      });
    }

    if (filters.trend) {
      if (filters.trend === "STAR")
        finalIntel = finalIntel.filter((i) => i.trend === "STAR");
      else if (filters.trend === "FALLING")
        finalIntel = finalIntel.filter((i) => i.trend === "FALLING");
      else if (filters.trend === "OOS")
        finalIntel = finalIntel.filter((i) => i.currentStock <= 0);
    }

    // Sort by Revenue by default
    const sorted = finalIntel.sort((a, b) => b.revenue - a.revenue);

    return {
      data: sorted.slice((page - 1) * limit, page * limit),
      totalDocs: sorted.length,
      totalPages: Math.ceil(sorted.length / limit),
    };
  } catch (error: any) {
    console.error("Payload Product Intelligence Engine Error:", error.message);
    return { data: [], totalDocs: 0, totalPages: 0 };
  }
}

/**
 * 🔍 GET PRODUCT DRILL-DOWN (The Sku Story)
 */
export async function getProductDrillDownPayload(productId: string) {
  try {
    // 🛡️ SECURITY LOCK: Staff access required
    await verifyStaff(["admin", "manager", "editor"]);

    await connectMongoose();
    const payload = await getPayload({ config: configPromise });

    // 1. Fetch Product Details directly from Payload
    const product = await payload.findByID({
      collection: "products",
      id: productId,
      depth: 1,
    });

    // 2. Fetch Recent Orders containing this specific product from MongoDB
    const recentOrders = await Order.find({
      "products.productId": productId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId shippingAddress.fullName totalPrice status createdAt")
      .lean();

    return {
      product: JSON.parse(JSON.stringify(product)),
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
    };
  } catch (error: any) {
    console.error("Payload Product Drill-down Error:", error.message);
    return null;
  }
}
