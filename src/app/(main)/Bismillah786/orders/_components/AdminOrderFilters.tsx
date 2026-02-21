
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

const TABS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "On Hold",
];
const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

export default function AdminOrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "All";
  const currentSearchTerm = searchParams.get("search") || "";

  // 🔥 FIX: Defined 'updateUrl' FIRST so it can be used below
  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "All") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (newParams.page === "1") params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  // 🔥 FIX: Now 'debouncedSearch' can safely call 'updateUrl'
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateUrl({ page: "1", search: value });
  }, 500);

  const handleFilterChange = (newStatus: string) =>
    updateUrl({ page: "1", status: newStatus });

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="grow relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          defaultValue={currentSearchTerm}
          onChange={(e) => debouncedSearch(e.target.value)}
          placeholder="Search by Order ID, Customer, Phone..."
          className={`${inputStyles} pl-11`}
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleFilterChange(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${currentStatus === tab ? "bg-brand-primary text-white shadow" : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}