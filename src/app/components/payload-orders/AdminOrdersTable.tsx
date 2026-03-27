"use client";

import Link from "next/link";
import { ClientOrder } from "@/app/actions/orderActions";
import CopyButton from "@/app/_components/shared/CopyButton";

const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
        case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        case "processing": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
        case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        case "on hold": return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
        default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    }
};

export default function AdminOrdersTable({ orders }: { orders: ClientOrder[] }) {
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
            <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">{order.orderId} <CopyButton textToCopy={order.orderId} /></div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">{order.shippingAddress.fullName}</td>
              <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-center">{order.products.length}</td>
              <td className="px-6 py-4 text-right font-semibold">Rs. {order.totalPrice.toLocaleString()}</td>
              <td className="px-6 py-4 text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
              </td>
              <td className="px-6 py-4 text-center">
                {/* ✅ FIX: Link changed to Payload Collection */}
                <Link href={`/admin/orders/${order._id}`} className="font-semibold text-brand-primary hover:underline">
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