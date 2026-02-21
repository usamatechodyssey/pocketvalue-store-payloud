
// /app/admin/returns/_components/ReturnsClientPage.tsx

"use client";

import { useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import Pagination from "../../products/_components/Pagination";
import { AdminReturnRequest } from "../_actions/returnActions";
import ReturnFilters from "./ReturnFilters"; // Naya component
import ReturnList from "./ReturnList"; // Naya component

interface ReturnsClientPageProps {
  initialRequests: AdminReturnRequest[];
  initialTotalPages: number;
}

export default function ReturnsClientPage({
  initialRequests,
  initialTotalPages,
}: ReturnsClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPage = Number(searchParams.get("page")) || 1;

  const handleUrlUpdate = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handlePageChange = (page: number) => {
    handleUrlUpdate({ page: page.toString() });
  };

  const handleClearFilters = () => {
    handleUrlUpdate({ status: "", search: "" });
  };

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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
          <ReturnFilters onFilterChange={handleUrlUpdate} />
          <ReturnList
            requests={initialRequests}
            onClearFilters={handleClearFilters}
          />
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
