// /app/Bismillah786/users/_components/UsersClientPage.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { AdminUser } from "../_actions/userActions";
import Pagination from "../../products/_components/Pagination"; // Reusable Component

// --- Debounce Hook (reusable) ---
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// === Main Client Component ===
export default function UsersClientPage({
  initialUsers,
  initialTotalPages,
}: {
  initialUsers: AdminUser[];
  initialTotalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      if (debouncedSearch) params.set("search", debouncedSearch);
      else params.delete("search");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }
  }, [debouncedSearch, currentSearch, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const hasUsers = initialUsers.length > 0;

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-10 rounded-lg">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}

      <div
        className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
          <div className="mb-6 relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full p-2.5 pl-11 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {hasUsers
                  ? initialUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 rounded-full bg-gray-200">
                              <Image
                                src={user.image || "/default-avatar.png"}
                                alt={user.name}
                                fill
                                sizes="40px"
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {user.name}
                              </p>
                              <p className="text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center items-center gap-3">
                            {/* --- THE FIX IS HERE: Using <span> with aria-label --- */}
                            <span
                              aria-label={
                                user.emailVerified
                                  ? "Email Verified"
                                  : "Email Not Verified"
                              }
                            >
                              {user.emailVerified ? (
                                <CheckCircle className="text-green-500" />
                              ) : (
                                <XCircle className="text-gray-400" />
                              )}
                            </span>
                            <span
                              aria-label={
                                user.phoneVerified
                                  ? "Phone Verified"
                                  : "Phone Not Verified"
                              }
                            >
                              {user.phoneVerified ? (
                                <CheckCircle className="text-green-500" />
                              ) : (
                                <XCircle className="text-gray-400" />
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-gray-700 dark:text-gray-300">
                          {user.orderCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link
                            href={`/Bismillah786/users/${user._id}`}
                            className="font-semibold text-brand-primary hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          {!hasUsers && (
            <div className="text-center py-16 text-gray-500">
              <p className="font-semibold">No customers found.</p>
              {currentSearch && (
                <p className="text-sm mt-2">Try adjusting your search.</p>
              )}
            </div>
          )}
        </div>

        <Pagination
          totalPages={initialTotalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
