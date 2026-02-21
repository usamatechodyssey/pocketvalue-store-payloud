// /app/Bismillah786/users/[userId]/orders/page.tsx

import { getPaginatedOrders } from "@/app/actions/orderActions";
import OrdersClientPage from "../../../orders/_components/OrdersClientPage";
import { Suspense } from "react";
import OrdersLoadingSkeleton from "../../../orders/_components/LoadingSkeleton";
import { getSingleUserForAdmin } from "../../_actions/userActions"; // User ka naam fetch karne ke liye
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type CustomerOrdersPageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
};

async function CustomerOrdersList(props: CustomerOrdersPageProps) {
  const [{ userId }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);

  const page = Number(searchParams.page) || 1;
  const status = searchParams.status || "All";
  const searchTerm = searchParams.search || "";

  const { orders, totalPages } = await getPaginatedOrders({
    page,
    status,
    searchTerm,
    userId: userId, // Yahan hum user ID pass kar rahe hain
  });

  return (
    <OrdersClientPage initialOrders={orders} initialTotalPages={totalPages} />
  );
}

export default async function CustomerOrdersPage(
  props: CustomerOrdersPageProps
) {
  const { userId } = await props.params;
  const searchParams = await props.searchParams;

  // Fetch user's name for the header
  const userData = await getSingleUserForAdmin(userId);
  if (!userData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/Bismillah786/users/${userId}`}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={16} /> Back to Customer Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Orders for {userData.user.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Total Orders: {userData.stats.totalOrders}
        </p>
      </div>

      <Suspense
        key={`${userId}-${searchParams.page}-${searchParams.status}-${searchParams.search}`}
        fallback={<OrdersLoadingSkeleton />}
      >
        <CustomerOrdersList {...props} />
      </Suspense>
    </div>
  );
}
