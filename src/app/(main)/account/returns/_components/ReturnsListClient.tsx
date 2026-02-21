// /app/account/returns/_components/ReturnsListClient.tsx

"use client";

import Link from "next/link";
import { UserReturnRequest } from "@/app/actions/returnActions"; // Hamari mustanad type
import { ArrowRight } from "lucide-react";

// Status ke badge ke liye a helper function3
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
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"; // Pending
  }
};

interface ReturnsListClientProps {
  initialRequests: UserReturnRequest[];
}

export default function ReturnsListClient({
  initialRequests,
}: ReturnsListClientProps) {
  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left text-gray-600 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3 font-semibold">Request ID</th>
              <th className="px-6 py-3 font-semibold">Order #</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold text-center">Status</th>
              <th className="px-6 py-3 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {initialRequests.map((req) => (
              <tr
                key={req._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-6 py-4 font-mono text-gray-500">
                  #{req._id.slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4 font-mono">{req.orderNumber}</td>
                <td className="px-6 py-4">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/account/returns/${req._id}`}
                    className="font-semibold text-brand-primary hover:underline flex justify-end items-center gap-1"
                  >
                    View Details <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {initialRequests.map((req) => (
          <Link
            href={`/account/returns/${req._id}`}
            key={req._id}
            className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  Order: {req.orderNumber}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Req ID: #{req._id.slice(-6).toUpperCase()}
                </p>
              </div>
              <span
                className={`mt-1 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(req.status)}`}
              >
                {req.status}
              </span>
            </div>
            <div className="flex justify-between items-end mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(req.createdAt).toLocaleDateString()}
              </p>
              <div className="font-semibold text-brand-primary text-sm flex items-center gap-1">
                Details <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Naya Component:** Ek naya, focused Client Component (`ReturnsListClient.tsx`) banaya gaya hai.
// - **Consistent Typing (Rule #5):** Component hamari mustanad `UserReturnRequest` type (jo `returnActions.ts` se aa rahi hai) ko as a prop istemal kar raha hai.
// - **Responsive UI:** Component mobile aur desktop, dono ke liye ek saaf suthra aur aala-mayari UI faraham karta hai, jo ek behtareen user experience ke liye zaroori hai.
