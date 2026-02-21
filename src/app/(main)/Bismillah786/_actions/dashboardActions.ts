
// /app/Bismillah786/_actions/dashboardActions.ts

"use server";

import { startOfMonth } from 'date-fns';

// --- NAYE IMPORTS ---
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order"; // Hamara mustanad Order model
import User from "@/models/User";   // Hamara mustanad User model

// --- Type Definitions (inmein koi tabdeeli nahi) ---
export interface DashboardStats {
  totalRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  monthNewCustomers: number;
}

export interface OrderStatusSummary {
  [key: string]: number;
}

// === ACTION #1: GET MAIN DASHBOARD STATS (REFACTORED WITH MONGOOSE) ===
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    await connectMongoose();
    
    const today = new Date();
    const startOfMonthDate = startOfMonth(today);

    // Mongoose aggregate ka istemal karke tamam stats hasil karein
    const orderStatsPromise = Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          monthRevenue: {
            $sum: {
              $cond: [ { $gte: ["$createdAt", startOfMonthDate] }, "$totalPrice", 0 ]
            }
          }
        }
      }
    ]);

    // User stats ke liye alag, parallel query
    const userStatsPromise = User.aggregate([
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                monthNewCustomers: {
                    $sum: {
                        $cond: [ { $gte: ["$createdAt", startOfMonthDate] }, 1, 0 ]
                    }
                }
            }
        }
    ]);

    const [orderResults, userResults] = await Promise.all([
        orderStatsPromise,
        userStatsPromise
    ]);

    const orderData = orderResults[0] || {};
    const userData = userResults[0] || {};

    const totalRevenue = orderData.totalRevenue || 0;
    const totalOrders = orderData.totalOrders || 0;

    return {
      totalRevenue,
      monthRevenue: orderData.monthRevenue || 0,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalCustomers: userData.totalCustomers || 0,
      monthNewCustomers: userData.monthNewCustomers || 0,
    };

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Error ki soorat mein default values return karein
    return { totalRevenue: 0, monthRevenue: 0, totalOrders: 0, averageOrderValue: 0, totalCustomers: 0, monthNewCustomers: 0 };
  }
}

// === ACTION #2: GET ORDER STATUS SUMMARY (REFACTORED WITH MONGOOSE) ===
export async function getOrderStatusSummary(): Promise<OrderStatusSummary> {
  try {
    await connectMongoose();

    const results = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const summary = results.reduce((acc, item) => {
      if (item._id) {
          acc[item._id] = item.count;
      }
      return acc;
    }, {} as OrderStatusSummary);

    return summary;
  } catch (error) {
    console.error("Error fetching order status summary:", error);
    return {};
  }
}

// --- SUMMARY OF CHANGES ---
// - **Architectural Consistency (Rule #2):** `mongodb` native driver ka istemal mukammal taur par Mongoose `User` aur `Order` models se replace kar diya gaya hai.
// - **Code Simplification & Readability:** `db.collection("...").aggregate(...)` ke bajaye ab `Model.aggregate(...)` ka istemal ho raha hai, jo zyada saaf suthra aur aasan hai. Mongoose schema ki wajah se ab humein "createdAt" jaise fields par yaqeen hai.
// - **Maintainability:** Ab agar mustaqbil mein Order ya User schema mein koi tabdeeli aati hai, to humein sirf models mein change karna hoga. Is file ka logic aam taur par waisa hi rahega, jis se isay maintain karna aasan hai.