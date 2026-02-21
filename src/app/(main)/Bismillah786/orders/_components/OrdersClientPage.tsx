
// /app/admin/orders/_components/OrdersClientPage.tsx (FINAL & CORRECTED)

"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Package } from "lucide-react";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientOrder } from "@/app/actions/orderActions"; // <-- Import the new, SAFE DTO type
import Pagination from "../../products/_components/Pagination";
import AdminOrderFilters from "./AdminOrderFilters";
import AdminOrdersTable from "./AdminOrdersTable";
import AdminOrdersMobileList from "./AdminOrdersMobileList";

interface OrdersClientPageProps {
  initialOrders: ClientOrder[]; // <-- Use the ClientOrder[] type for props
  initialTotalPages: number;
}

export default function OrdersClientPage({
  initialOrders,
  initialTotalPages,
}: OrdersClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition(); // Correctly get startTransition

  const currentPage = Number(searchParams.get("page")) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    // Use startTransition for smoother navigation
    startTransition(() => {
      router.push(`/Bismillah786/orders?${params.toString()}`);
    });
  };

  const hasOrders = initialOrders.length > 0;

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-10 rounded-lg">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
      <div
        className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-6">
          <AdminOrderFilters />

          {hasOrders ? (
            <>
              {/* Pass the clean ClientOrder[] array to the child components */}
              <AdminOrdersTable orders={initialOrders} />
              <AdminOrdersMobileList orders={initialOrders} />
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Package size={48} className="mx-auto text-gray-400" />
              <p className="font-semibold mt-4">No orders found</p>
              <p className="text-sm mt-2">Try adjusting your filters.</p>
            </div>
          )}
        </div>

        {initialTotalPages > 1 && (
          <Pagination
            totalPages={initialTotalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}
