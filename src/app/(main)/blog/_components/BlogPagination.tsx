

"use client";

import PaginationControls from "@/app/components/ui/PaginationControls";

interface BlogPaginationProps {
  totalPages: number;
}

export default function BlogPagination({ totalPages }: BlogPaginationProps) {
  // Ab hamein yahan router ya searchParams ki zaroorat nahi 
  // kyunki PaginationControls khud URL handle kar raha hai.
  
  return (
    <PaginationControls totalPages={totalPages} />
  );
}