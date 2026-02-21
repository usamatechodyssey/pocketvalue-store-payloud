// /app/admin/orders/_components/AdminOrdersTable.tsx (FINAL & CORRECTED)

"use client";

import Link from "next/link";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientOrder } from "@/app/actions/orderActions"; // <-- Import the new, SAFE DTO type
// import { IOrder } from "@/models/Order"; // <-- REMOVED the forbidden Mongoose model import
import CopyButton from "../../_components/CopyButton";

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

interface AdminOrdersTableProps {
  orders: ClientOrder[]; // <-- Use the ClientOrder[] type for props
}

export default function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="px-6 py-3 text-left">Order ID</th>
            <th className="px-6 py-3 text-left">Customer</th>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-center">Items</th>
            <th className="px-6 py-3 text-right">Total</th>
            <th className="px-6 py-3 text-center">Status</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <tr
              key={order._id} // _id is now a string, no .toString() needed
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {order.orderId}
                  <CopyButton textToCopy={order.orderId} />
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">
                {order.shippingAddress.fullName}
              </td>
              <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                {order.products.length}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-gray-800 dark:text-gray-100">
                Rs. {order.totalPrice.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <Link
                  href={`/Bismillah786/orders/${order._id}`}
                  className="font-semibold text-brand-primary hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
