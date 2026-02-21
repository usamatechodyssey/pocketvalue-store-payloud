// /app/admin/orders/_components/AdminOrdersMobileList.tsx (FINAL & CORRECTED)

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

interface AdminOrdersMobileListProps {
  orders: ClientOrder[]; // <-- Use the ClientOrder[] type for props
}

export default function AdminOrdersMobileList({
  orders,
}: AdminOrdersMobileListProps) {
  return (
    <div className="lg:hidden space-y-3">
      {orders.map((order) => (
        <div
          key={order._id}
          className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1 font-mono text-sm text-gray-800 dark:text-gray-100 font-bold">
                {order.orderId}
                <CopyButton textToCopy={order.orderId} />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {order.shippingAddress.fullName}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
            >
              {order.status}
            </span>
          </div>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                Rs. {order.totalPrice.toLocaleString()}
              </p>
            </div>
            <Link
              href={`/Bismillah786/orders/${order._id}`}
              className="text-sm font-semibold text-brand-primary hover:underline"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
