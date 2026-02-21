
import { Suspense } from "react";
import { getPaginatedReturnRequests } from "./_actions/returnActions";
import ReturnsClientPage from "./_components/ReturnsClientPage";
import ReturnsLoadingSkeleton from "./_components/LoadingSkeleton";

// --- FIX #1: Correct prop types for an ASYNC Server Component ---
type AdminReturnsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
};

// This type is for the child component which receives the RESOLVED object
type ReturnsListProps = {
  searchParams: {
    page?: string;
    status?: string;
    search?: string;
  };
};

// Data fetching now happens in this async component
async function ReturnsList({ searchParams }: ReturnsListProps) {
  const page = Number(searchParams.page) || 1;
  const status = searchParams.status || "All";
  const searchTerm = searchParams.search || "";

  const { requests, totalPages } = await getPaginatedReturnRequests({
    page,
    status,
    searchTerm,
  });

  return (
    <ReturnsClientPage
      initialRequests={requests}
      initialTotalPages={totalPages}
    />
  );
}

// --- FIX #2: The main page component is now ASYNC ---
export default async function AdminReturnsPage({
  searchParams: searchParamsProp,
}: AdminReturnsPageProps) {
  // --- FIX #3: Await the searchParams promise to get the actual object ---
  const searchParams = await searchParamsProp;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        Manage Return Requests
      </h1>
      <Suspense
        // The key now safely uses the resolved searchParams object
        key={`${searchParams.page}-${searchParams.status}-${searchParams.search}`}
        fallback={<ReturnsLoadingSkeleton />}
      >
        <ReturnsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

// --- SUMMARY OF CHANGES (CORRECTED) ---
// - **Next.js 16+ Compliance (Rule #8):** The top-level page component (`AdminReturnsPage`) is now correctly defined as `async` and properly `await`s the `searchParams` promise. This resolves the critical runtime error.
// - **Architectural Pattern:** The pattern of an async parent component awaiting props and passing the resolved values to a child `Suspense` boundary is maintained for optimal performance and user experience.
// - **Type Safety:** Prop types have been corrected to accurately reflect the data flow (Promise -> Resolved Object), ensuring code correctness and preventing future bugs.
