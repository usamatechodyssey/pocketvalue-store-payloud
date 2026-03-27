"use client";

import Link from "next/link";
import { AdminReturnRequest } from "@/app/actions/payloadReturnAdminActions";
import CopyButton from "@/app/_components/shared/CopyButton";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "approved": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "rejected": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
  }
};

export default function ReturnList({ requests }: { requests: AdminReturnRequest[] }) {
  return (
    <>
      {/* Mobile */}
      <div className="lg:hidden space-y-3">
        {requests.map((req) => (
          <div key={req._id} className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold dark:text-white">{req.customerName}</p>
                <p className="text-xs font-mono opacity-50">Order: {req.orderNumber}</p>
              </div>
              <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusColor(req.status)}`}>{req.status}</span>
            </div>
            <div className="mt-4 flex justify-between items-end">
              <p className="text-xs opacity-50">{new Date(req.createdAt).toLocaleDateString()}</p>
              {/* ✅ Path Points to Admin Root View */}
              <Link href={`/admin/returns/${req._id}`} className="text-sm font-bold text-brand-primary hover:underline">View Details</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr className="text-gray-500">
              <th className="px-6 py-3 text-left">Order #</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-center">Items</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {requests.map((req) => (
              <tr key={req._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 font-mono font-bold">{req.orderNumber}</td>
                <td className="px-6 py-4">{req.customerName}</td>
                <td className="px-6 py-4 opacity-70">{new Date(req.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-center font-bold">{req.itemCount}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${getStatusColor(req.status)}`}>{req.status}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   {/* ✅ Path Points to Admin Root View */}
                  <Link href={`/admin/returns/${req._id}`} className="font-bold text-brand-primary hover:underline">View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}