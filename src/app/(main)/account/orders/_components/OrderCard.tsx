// /src/app/account/orders/_components/OrderCard.tsx (FINAL & CORRECTED)

"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientOrder, ClientOrderProduct } from "@/app/actions/orderActions"; // <-- Import the new, SAFE types

// Helper Function for Status Colors (No change)
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "Processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "Shipped":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300";
    case "Delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "Cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "On Hold":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

interface OrderCardProps {
  order: ClientOrder; // <-- Use the ClientOrder type for props
  isOpen: boolean;
  onToggle: () => void;
}

export default function OrderCard({ order, isOpen, onToggle }: OrderCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div
        className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800 transition-colors"
        onClick={onToggle}
      >
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Order ID:{" "}
            <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
              {order.orderId}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Date:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                // createdAt is now a string, which is fine
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between">
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Rs. {order.totalPrice.toLocaleString()}
          </p>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(order.status)}`}
          >
            {order.status}
          </span>
          <div className="text-gray-400 dark:text-gray-500">
            {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="space-y-4">
            {/* The product object now correctly matches the ClientOrderProduct type */}
            {order.products.map((product: ClientOrderProduct) => (
              <div key={product.cartItemId} className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0">
                  <Image
                    src={urlFor(product.image).url()}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="grow">
                  <Link
                    href={`/product/${product.slug}`}
                    className="font-semibold text-sm text-gray-800 dark:text-gray-200 hover:text-brand-primary line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Qty: {product.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <Link
              href={`/account/orders/${order._id}`}
              className="text-sm text-brand-primary hover:underline font-bold"
            >
              View Full Details &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
