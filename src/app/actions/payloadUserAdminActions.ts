"use server";

import connectMongoose from "@/app/lib/mongoose";
import User, { IUser, IAddress } from "@/models/User";
import Order from "@/models/Order";
import { Types } from "mongoose";
import { verifyStaff } from "@/lib/payloadAuth";


// --- TYPES (DTOs for Frontend Compatibility) ---
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  orderCount: number;
}

// Plain Object Type for a Leaned User (Matches Mongoose .lean() result)
type PlainUser = Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'phoneVerified' | 'addresses' | 'toObject' | 'save'> & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    emailVerified?: Date | null;
    phoneVerified?: Date | null;
    addresses: (Omit<IAddress, '_id'> & { _id: Types.ObjectId })[];
};

// === 1. GET PAGINATED CUSTOMERS (MongoDB) ===
export async function getPaginatedUsersPayload({ page = 1, limit = 15, searchTerm = '' }) {
  try {
    // 🛡️ SECURITY LOCK: Any staff member (Admin, Manager, Editor) can view customer list
    await verifyStaff(['admin', 'manager', 'editor']);

    await connectMongoose();
    const skip = (page - 1) * limit;

    const matchQuery: any = {};
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      matchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const [usersFromDb, totalUsers] = await Promise.all([
      User.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<PlainUser[]>(), 
      User.countDocuments(matchQuery)
    ]);
    
    const userIds = usersFromDb.map(u => u._id.toString());
    
    // Aggregate order counts in one go for performance
    const orderCounts = await Order.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]);
    
    const orderCountMap = new Map(orderCounts.map(item => [item._id, item.count]));

    const users: AdminUser[] = usersFromDb.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      emailVerified: !!user.emailVerified,
      phoneVerified: !!user.phoneVerified,
      orderCount: orderCountMap.get(user._id.toString()) || 0,
    }));

    return {
      users,
      totalPages: Math.ceil(totalUsers / limit),
      totalDocs: totalUsers
    };

  } catch (error: any) {
    console.error("Payload Fetch Users Error:", error.message);
    return { users: [], totalPages: 0, totalDocs: 0 };
  }
}

// === 2. GET SINGLE CUSTOMER DETAILS (MongoDB) ===
export async function getSingleUserPayload(userId: string) {
  try {
    // 🛡️ SECURITY LOCK: Staff access required
    await verifyStaff(['admin', 'manager', 'editor']);

    if (!Types.ObjectId.isValid(userId)) return null;
    await connectMongoose();
    
    const [user, orderStats, recentOrders] = await Promise.all([
      User.findById(userId).lean<PlainUser>(), 
      Order.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: "$userId", totalSpend: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }
      ]),
      Order.find({ userId: userId }).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    if (!user) return null;
    
    const statsResult = orderStats[0] || {};

    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        addresses: user.addresses.map((addr) => ({
            ...addr,
            _id: addr._id.toString()
        })) || []
      },
      stats: {
        totalSpend: statsResult.totalSpend || 0,
        totalOrders: statsResult.totalOrders || 0,
      },
      recentOrders: recentOrders.map((order: any) => ({
        _id: order._id.toString(),
        orderDate: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        status: order.status,
        totalPrice: order.totalPrice
      }))
    };
  } catch (error: any) {
    console.error("Payload Single User Fetch Error:", error.message);
    return null;
  }
}