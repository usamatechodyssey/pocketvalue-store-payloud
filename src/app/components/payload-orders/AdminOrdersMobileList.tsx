// src/app/components/payload-orders/AdminOrdersMobileList.tsx
"use client";

import Link from "next/link";
import { ClientOrder } from "@/app/actions/orderActions";
import CopyButton from "@/app/_components/shared/CopyButton";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "shipped":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "processing":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "on hold":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  }
};

interface AdminOrdersMobileListProps {
  orders: ClientOrder[];
}

export default function AdminOrdersMobileList({
  orders,
}: AdminOrdersMobileListProps) {
  return (
    <div className="lg:hidden space-y-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1 font-mono text-sm text-gray-800 dark:text-gray-100 font-bold">
                {order.orderId}
                <CopyButton textToCopy={order.orderId} />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mt-1">
                {order.shippingAddress.fullName}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="font-bold text-lg text-gray-900 dark:text-white mt-0.5">
                Rs. {order.totalPrice.toLocaleString()}
              </p>
            </div>
            
            {/* ✅ FIX: Path changed to Payload collections for mobile view */}
            <Link
              href={`/admin/orders/${order._id}`}
              className="px-4 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-bold text-brand-primary hover:bg-gray-50 transition-colors shadow-sm"
            >
              View Detail
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}