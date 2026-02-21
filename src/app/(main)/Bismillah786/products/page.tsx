
// /app/admin/products/page.tsx

import Link from "next/link";
import { PlusCircle, Upload } from "lucide-react";
import { getPaginatedAdminProducts } from "./_actions/productActions";
import ProductsClientPage from "./_components/ProductsClientPage";
import { Suspense } from "react";
import ProductsLoadingSkeleton from "./_components/LoadingSkeleton";

// Type for Next.js 16+ async page props
type AdminProductsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

// Data fetching component that awaits the promise
async function ProductList(props: AdminProductsPageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const searchTerm = searchParams.search || "";

  const { products, totalPages } = await getPaginatedAdminProducts({
    page,
    searchTerm,
  });

  return (
    <ProductsClientPage
      initialProducts={products}
      initialTotalPages={totalPages}
    />
  );
}

// --- BUG FIX IS HERE ---
// The main page component must now be `async` to await the promise
export default async function AdminProductsPage(props: AdminProductsPageProps) {
  // Await the searchParams here to create a unique key for Suspense
  const searchParams = await props.searchParams;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Manage Products
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/Bismillah786/products/import"
            className="flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
          >
            <Upload size={16} /> Import from CSV
          </Link>
          <Link
            href="/Bismillah786/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover transition-colors shadow-sm"
          >
            <PlusCircle size={20} /> Add New Product
          </Link>
        </div>
      </div>

      <Suspense
        // The key is now correctly generated using the resolved searchParams object
        key={`${searchParams.page}-${searchParams.search}`}
        fallback={<ProductsLoadingSkeleton />}
      >
        {/* Pass the original props promise down to the async component */}
        <ProductList searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Rule #8 Compliance Fix:** The `AdminProductsPage` component has been converted to an `async` function.
// - **Await Implementation:** It now correctly uses `await props.searchParams` before trying to access `searchParams.page` and `searchParams.search` to generate the `key` for the `<Suspense>` component.
// - **Error Resolution:** This change directly resolves the TypeScript error and prevents a runtime crash, ensuring the component is fully compliant with Next.js 16+ standards.
