// /app/Bismillah786/users/_components/LoadingSkeleton.tsx

const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4"><div className="flex gap-2"><div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div><div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div></div></td>
      <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div></td>
    </tr>
);

export default function UsersLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
      <div className="mb-6 h-11 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}