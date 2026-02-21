
"use client";

import { useState } from "react";
import { Package } from "lucide-react";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientOrder } from "@/app/actions/orderActions"; 

import PaginationControls from "@/app/components/ui/PaginationControls";
import OrderCard from "./OrderCard";
import OrderFilters from "./OrderFilters";

interface OrderListProps {
  initialOrders: ClientOrder[]; 
  totalPages: number;
}

export default function OrderList({
  initialOrders,
  totalPages,
}: OrderListProps) {
  // ✅ Note: Hamein ab currentPage ya handlePageChange ki yahan zaroorat nahi hai
  // kyunki PaginationControls khud URL se page parhta hai aur navigate karta hai.

  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const handleToggle = (orderId: string) => {
    setOpenOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  return (
    <div className="space-y-6">
      <OrderFilters />

      {initialOrders.length > 0 ? (
        <div className="space-y-4">
          {initialOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order} 
              isOpen={openOrderId === order._id}
              onToggle={() => handleToggle(order._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <Package
            className="mx-auto h-12 w-12 text-gray-400"
            strokeWidth={1.5}
          />
          <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
            No Orders Found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No orders match your search or filter criteria.
          </p>
        </div>
      )}

      {/* ✅ Pagination controls ab sirf totalPages lega */}
      {totalPages > 1 && (
        <PaginationControls totalPages={totalPages} />
      )}
    </div>
  );
}