// /app/admin/products/_components/LoadingSkeleton.tsx

// Yeh component product list ke load hone ke dauran dikhaya jayega.
// Is se user ko lagta hai ke page tezi se load ho raha hai.

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4"><div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700"></div></td>
    <td className="px-6 py-4"><div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700"></div></td>
    <td className="px-6 py-4 align-top">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4 align-top"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div></td>
    <td className="px-6 py-4 align-top"><div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700"></div></td>
    <td className="px-6 py-4 align-top text-right"><div className="flex justify-end gap-4">
      <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </div></td>
  </tr>
);

export default function ProductsLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
      <div className="mb-6 relative animate-pulse">
        <div className="h-11 w-full rounded-lg bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg animate-pulse">
            <div className="flex gap-4">
              <div className="h-16 w-16 shrink-0 rounded-md bg-gray-200 dark:bg-gray-600"></div>
              <div className="grow space-y-2">
                <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-600"></div>
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="w-12 px-4 py-3"></th>
              <th className="w-20 px-6 py-3"></th>
              <th className="px-6 py-3"></th>
              <th className="w-40 px-6 py-3"></th>
              <th className="w-40 px-6 py-3"></th>
              <th className="w-28 px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}