// /app/admin/returns/_components/ReturnFilters.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const TABS = [
  "All",
  "Pending",
  "Approved",
  "Processing",
  "Completed",
  "Rejected",
];

interface ReturnFiltersProps {
  onFilterChange: (params: Record<string, string>) => void;
}

export default function ReturnFilters({ onFilterChange }: ReturnFiltersProps) {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "All";
  const currentSearchTerm = searchParams.get("search") || "";

  const [localSearchTerm, setLocalSearchTerm] = useState(currentSearchTerm);
  const debouncedSearchTerm = useDebounce(localSearchTerm, 500);

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  useEffect(() => {
    if (debouncedSearchTerm !== currentSearchTerm) {
      onFilterChange({ page: "1", search: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, currentSearchTerm, onFilterChange]);

  const handleStatusChange = (newStatus: string) => {
    onFilterChange({ page: "1", status: newStatus });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="grow relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          placeholder="Search by Order # or Customer..."
          className={`${inputStyles} pl-11`}
        />
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 md:pb-0 md:mb-0">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleStatusChange(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                currentStatus === tab
                  ? "bg-brand-primary text-white shadow"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
