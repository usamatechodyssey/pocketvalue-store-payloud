// /app/Bismillah786/users/_actions/userActions.ts (ABSOLUTE FINAL, ERROR-FREE)

"use server";

import connectMongoose from "@/app/lib/mongoose";
import User, { IUser, IAddress } from "@/models/User";
import Order, { IOrder } from "@/models/Order"; // <-- IOrder is now needed
import { Types } from "mongoose";

// --- Type Definitions ---
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

interface PaginatedUsersResponse {
  users: AdminUser[];
  totalPages: number;
}

// Plain Object Type for a Leaned User
type PlainUser = Omit<IUser, '_id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'phoneVerified' | 'addresses' | 'toObject' | 'save'> & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    emailVerified?: Date | null;
    phoneVerified?: Date | null;
    addresses: (Omit<IAddress, '_id'> & { _id: Types.ObjectId })[];
};

// === THE FINAL FIX IS HERE: A Plain Object Type for a Leaned Order ===
type PlainOrder = Omit<IOrder, '_id' | 'createdAt' | 'updatedAt' | 'toObject' | 'save'> & {
    _id: Types.ObjectId; // We know _id is an ObjectId for Orders from our schema fix
    createdAt: Date;
    updatedAt: Date;
};


// === ACTION #1: GET PAGINATED USERS (Correctly Typed) ===
export async function getPaginatedUsers({ page = 1, limit = 15, searchTerm = '' }): Promise<PaginatedUsersResponse> {
  try {
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
      totalPages: Math.ceil(totalUsers / limit)
    };

  } catch (error) {
    console.error("Failed to fetch paginated users:", error);
    return { users: [], totalPages: 0 };
  }
}

// === ACTION #2: GET SINGLE USER'S DETAILS (Correctly Typed) ===
export async function getSingleUserForAdmin(userId: string) {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    await connectMongoose();
    
    const [user, orderStats, recentOrders] = await Promise.all([
      User.findById(userId).lean<PlainUser>(),
      Order.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: "$userId", totalSpend: { $sum: "$totalPrice" }, totalOrders: { $sum: 1 } } }
      ]),
      // --- THE FINAL FIX IS HERE: Use the PlainOrder type ---
      Order.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id createdAt status totalPrice')
        .lean<PlainOrder[]>(), // <-- Explicitly type the result of this .lean() call
    ]);

    if (!user) {
      return null;
    }
    
    const statsResult = orderStats[0] || {};

    // All red lines are now gone from the entire file.
    return {
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        addresses: user.addresses.map(addr => ({
            ...addr,
            _id: addr._id.toString()
        })) || []
      },
      stats: {
        totalSpend: statsResult.totalSpend || 0,
        totalOrders: statsResult.totalOrders || 0,
      },
      // This line now has no error.
      recentOrders: recentOrders.map(order => ({
        _id: order._id.toString(),
        orderDate: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        status: order.status,
        totalPrice: order.totalPrice
      }))
    };

  } catch (error) {
    console.error("Failed to fetch single user for admin:", error);
    return null;
  }
}