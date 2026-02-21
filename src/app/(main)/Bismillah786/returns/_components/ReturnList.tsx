// /app/admin/returns/_components/ReturnList.tsx

"use client";

import Link from "next/link";
import { AdminReturnRequest } from "../_actions/returnActions";
import CopyButton from "../../_components/CopyButton";
import { useSearchParams } from "next/navigation";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "approved":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "processing":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
    case "rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  }
};

interface ReturnListProps {
  requests: AdminReturnRequest[];
  onClearFilters: () => void;
}

export default function ReturnList({
  requests,
  onClearFilters,
}: ReturnListProps) {
  const hasRequests = requests.length > 0;
  const searchParams = useSearchParams();
  const currentSearchTerm = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "All";

  if (!hasRequests) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="font-semibold">No return requests found</p>
        {(currentSearchTerm || currentStatus !== "All") && (
          <p className="text-sm mt-2">
            Try adjusting your filters or{" "}
            <button
              onClick={onClearFilters}
              className="text-brand-primary font-semibold hover:underline"
            >
              clear all filters
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile View */}
      <div className="lg:hidden space-y-3">
        {requests.map((req) => (
          <div
            key={req._id}
            className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  {req.customerName}
                </p>
                <div className="flex items-center gap-1 text-xs font-mono text-gray-500">
                  Order: {req.orderNumber}
                  <CopyButton textToCopy={req.orderNumber} />
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}
              >
                {req.status}
              </span>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500">
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Items: {req.itemCount}
                </p>
              </div>
              <Link
                href={`/Bismillah786/returns/${req._id}`}
                className="text-sm font-semibold text-brand-primary hover:underline"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left">Request ID</th>
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((req) => (
              <tr
                key={req._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-6 py-4 font-mono text-gray-500">
                  #{req._id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4 font-mono">{req.orderNumber}</td>
                <td className="px-6 py-4 font-medium">{req.customerName}</td>
                <td className="px-6 py-4">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/Bismillah786/returns/${req._id}`}
                    className="font-semibold text-brand-primary hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
