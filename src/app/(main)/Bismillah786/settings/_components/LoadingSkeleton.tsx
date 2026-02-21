// /src/app/Bismillah786/settings/_components/LoadingSkeleton.tsx

export default function SettingsLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Tabs Skeleton */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <div className="w-24 h-10 bg-gray-300 dark:bg-gray-700 rounded-t-md mr-2"></div>
        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-600 rounded-t-md mr-2"></div>
        <div className="w-28 h-10 bg-gray-200 dark:bg-gray-600 rounded-t-md"></div>
      </div>

      {/* Form Skeleton */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
        <div className="space-y-6">
          {/* Form Group Skeleton */}
          <div className="border-b dark:border-gray-700 pb-6">
            <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
          </div>

          {/* Input Fields Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="h-4 w-28 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="col-span-2 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="flex justify-end pt-4">
            <div className="h-10 w-28 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
}