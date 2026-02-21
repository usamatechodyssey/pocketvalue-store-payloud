
// /src/app/search/page.tsx

import { Suspense } from "react";
import {
  GET_FILTER_DATA_FOR_PLP,
  searchProducts,
  getBreadcrumbs,
} from "@/sanity/lib/queries";
import ProductListingClient from "@/app/components/category/ProductListingClient";
import { Search, Loader2 } from "lucide-react";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams: searchParamsPromise,
}: SearchPageProps): Promise<Metadata> {
  const searchParams = await searchParamsPromise;
  const q = (searchParams?.q as string) || "";
  const sort = (searchParams?.sort as string) || "best-match";
  const filter = (searchParams?.filter as string) || "";
  const isFeatured = filter === "isFeatured";

  let title = "Search Results";
  let description = "Find the best products on PocketValue.";

  if (q) {
    title = `Results for "${q}"`;
    description = `Search results for "${q}" on PocketValue. Find deals on a wide range of products.`;
  } else if (sort === "newest") {
    title = "New Arrivals";
    description = "Check out the latest products to arrive at PocketValue.";
  } else if (sort === "best-selling") {
    title = "Best Sellers";
    description = "Discover our most popular and best-selling products.";
  } else if (isFeatured) {
    title = "Featured Products";
    description = "Shop our curated collection of featured products.";
  }

  const baseMetadata = await generateBaseMetadata({
    title,
    description,
    path: "/search",
  });

  if (q) {
    baseMetadata.robots = {
      index: false,
      follow: true,
    };
  }

  return baseMetadata;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResults searchParamsPromise={searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  searchParamsPromise,
}: {
  searchParamsPromise: SearchPageProps["searchParams"];
}) {
  const searchParams = await searchParamsPromise;
  const q = (searchParams?.q as string) || "";
  const sort = (searchParams?.sort as string) || "best-match";
  const filter = (searchParams?.filter as string) || "";
  const isFeatured = filter === "isFeatured";

  const filtersForSearch = { isFeatured: isFeatured };

  const [initialData, filterData, breadcrumbs] = await Promise.all([
    searchProducts({
      searchTerm: q,
      sortOrder: sort,
      filters: filtersForSearch,
      page: 1,
    }),
    GET_FILTER_DATA_FOR_PLP({
      searchTerm: q,
      sortOrder: sort,
      isFeatured: isFeatured,
    }),
    getBreadcrumbs("search"),
  ]);

  const { products: initialProducts, totalCount } = initialData;

  let title = "Search Results";
  if (!q && sort === "newest") title = "New Arrivals";
  if (!q && sort === "best-selling") title = "Best Sellers";
  if (!q && isFeatured) title = "Featured Products";

  const finalFilterData = filterData || {
    brands: [],
    attributes: [],
    priceRange: { min: 0, max: 0 },
  };

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-8 py-8 md:py-12">
      <div className="max-w-480 mx-auto">
        <div className="mb-6 md:mb-8">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">
            {title}
          </h1>
          {q && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Showing results for:{" "}
              {/* ✅ FIX: Replaced " with &quot; */}
              <span className="font-semibold text-brand-primary">
                &quot;{q}&quot;
              </span>
            </p>
          )}
        </div>

        {initialProducts && initialProducts.length > 0 ? (
          <ProductListingClient
            key={q}
            initialProducts={initialProducts}
            filterData={finalFilterData}
            totalCount={totalCount || 0}
            context={{
              type: "search",
              value: q,
              sort: sort,
              filter: filter,
            }}
          />
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <Search size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {/* ✅ FIX: Replaced ' with &apos; */}
              We couldn&apos;t find anything matching your criteria. Try a
              different search or filter.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchPageSkeleton() {
  return (
    <main className="w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-full mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="h-10 bg-gray-200 rounded w-1/3 dark:bg-gray-700 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mt-4 dark:bg-gray-700 animate-pulse"></div>
        </div>
        <div className="flex justify-center items-center h-[50vh] text-center">
          <div>
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-brand-primary" />
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Loading results...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}