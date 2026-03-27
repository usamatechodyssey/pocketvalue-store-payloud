// /app/admin/_components/Pagination.tsx

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isPending: boolean;
}

export default function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  isPending,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className="flex items-center justify-between sm:justify-center gap-4 mt-8 px-4 sm:px-0">
      <button
        onClick={handlePrev}
        disabled={currentPage <= 1 || isPending}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-primary disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
        Previous
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages || isPending}
        className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-primary disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        aria-label="Go to next page"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}