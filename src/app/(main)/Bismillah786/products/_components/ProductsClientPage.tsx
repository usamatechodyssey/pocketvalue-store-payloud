
// /app/admin/products/_components/ProductsClientPage.tsx

"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Pagination from "./Pagination";
import ProductSearchFilter from "./ProductSearchFilter";
import ProductsTable from "./ProductsTable";
import ProductsMobileList from "./ProductsMobileList";
// --- BUG FIX IS HERE: Correct import syntax for types ---
import { type AdminProductListItem } from "./ProductsTable";

interface ProductsClientPageProps {
  initialProducts: AdminProductListItem[];
  initialTotalPages: number;
}

export default function ProductsClientPage({
  initialProducts,
  initialTotalPages,
}: ProductsClientPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending] = useTransition();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasProducts = initialProducts.length > 0;

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
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-6">
          <ProductSearchFilter />

          {hasProducts ? (
            <>
              <ProductsTable products={initialProducts} />
              <ProductsMobileList products={initialProducts} />
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="font-semibold">No products found</p>
              {currentSearch && (
                <p className="text-sm mt-2">
                  Try adjusting your search or{" "}
                  <button
                    onClick={handleClearSearch}
                    className="text-brand-primary font-semibold hover:underline"
                  >
                    clear the search
                  </button>
                  .
                </p>
              )}
            </div>
          )}
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

// --- SUMMARY OF CHANGES ---
// - **Type Import Fix:** The import statement for `AdminProductListItem` has been corrected to `import { type AdminProductListItem } from "./ProductsTable";`. This uses the standard syntax for importing a named export (the interface) and resolves the TypeScript error.
