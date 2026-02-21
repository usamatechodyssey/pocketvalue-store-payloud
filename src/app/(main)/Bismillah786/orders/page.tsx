// /app/admin/orders/page.tsx (UPDATED TO USE DTO)

import { getPaginatedOrders } from "@/app/actions/orderActions"; // <-- Import DTO
import OrdersClientPage from "./_components/OrdersClientPage";
import { Suspense } from "react";
import OrdersLoadingSkeleton from "./_components/LoadingSkeleton";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
};

type OrdersListProps = {
  searchParams: {
    page?: string;
    status?: string;
    search?: string;
  };
};

// Data fetching component
async function OrdersList({ searchParams }: OrdersListProps) {
  const page = Number(searchParams.page) || 1;
  const status = searchParams.status || "all";
  const searchTerm = searchParams.search || "";

  // This function now correctly returns { orders: ClientOrder[], ... }
  const { orders, totalPages } = await getPaginatedOrders({
    page,
    status,
    searchTerm,
    limit: 15,
  });

  return (
    // Pass the clean ClientOrder[] array to the client component
    <OrdersClientPage initialOrders={orders} initialTotalPages={totalPages} />
  );
}

// Main page component
export default async function AdminOrdersPage({
  searchParams: searchParamsProp,
}: AdminOrdersPageProps) {
  const searchParams = await searchParamsProp;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Manage Orders
      </h1>
      <Suspense
        key={`${searchParams.page}-${searchParams.status}-${searchParams.search}`}
        fallback={<OrdersLoadingSkeleton />}
      >
        <OrdersList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
