
import {
  getPaginatedCategories,
  getAllCategoriesForForm,
} from "./_actions/categoryActions";
import CategoriesClientPage from "./_components/CategoriesClientPage";
import { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// --- FIX #1: Correct prop types for an ASYNC Server Component ---
type AdminCategoriesPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

// This type is for the child component which receives the RESOLVED object
type CategoryListProps = {
  searchParams: {
    page?: string;
    search?: string;
  };
};

// Data fetching component
async function CategoryList({ searchParams }: CategoryListProps) {
  const page = Number(searchParams.page) || 1;
  const searchTerm = searchParams.search || "";

  const [paginatedData, allCategoriesForForm] = await Promise.all([
    getPaginatedCategories({ page, searchTerm }),
    getAllCategoriesForForm(),
  ]);

  return (
    <CategoriesClientPage
      initialCategories={paginatedData.categories}
      initialTotalPages={paginatedData.totalPages}
      allCategoriesForForm={allCategoriesForForm}
    />
  );
}

// --- FIX #2: The main page component is now ASYNC ---
export default async function AdminCategoriesPage({
  searchParams: searchParamsProp,
}: AdminCategoriesPageProps) {
  // --- FIX #3: Await the searchParams promise to get the actual object ---
  const searchParams = await searchParamsProp;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Manage Categories
        </h1>
        <Link
          href="/Bismillah786/categories/import"
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          Import from CSV
        </Link>
      </div>
      <Suspense
        // The key now safely uses the resolved searchParams object
        key={`${searchParams.page}-${searchParams.search}`}
        fallback={
          <div className="flex justify-center items-center h-96 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
          </div>
        }
      >
        <CategoryList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// --- SUMMARY OF CHANGES (CORRECTED) ---
// - **Next.js 16+ Compliance (Rule #8):** The top-level page component (`AdminCategoriesPage`) is now correctly defined as `async` and properly `await`s the `searchParams` promise. This resolves the critical runtime error.
// - **Architectural Pattern:** The pattern of an async parent component awaiting props and passing the resolved values to a child `Suspense` boundary is maintained for optimal performance and user experience.
// - **Type Safety:** Prop types have been corrected to accurately reflect the data flow (Promise -> Resolved Object), ensuring code correctness and preventing future bugs.
