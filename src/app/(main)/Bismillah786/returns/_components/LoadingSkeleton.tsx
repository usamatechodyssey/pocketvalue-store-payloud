const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4 text-center">
      <div className="h-6 w-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4 text-center">
      <div className="h-4 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
  </tr>
);

export default function ReturnsLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-pulse">
        <div className="grow h-11 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 rounded-md bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
