
// /src/app/order-failure/page.tsx (UPDATED: NEXT.JS 16+ COMPLIANCE)

import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

// NEXT.JS 16 FIX: searchParams must be defined as a Promise
type OrderFailurePageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// NEXT.JS 16 FIX: The component must be async to await searchParams
export default async function OrderFailurePage({
  searchParams,
}: OrderFailurePageProps) {
  
  // NEXT.JS 16 FIX: Await the searchParams before using them
  const resolvedSearchParams = await searchParams;

  const reason = (resolvedSearchParams?.reason as string) || "An unknown error occurred.";
  const orderId = resolvedSearchParams?.orderId as string | undefined;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full text-center">
        <div className="mx-auto w-20 h-20 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <XCircle
            className="text-red-600 dark:text-red-400"
            size={50}
            strokeWidth={2}
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Unfortunately, we were unable to process your payment.
        </p>

        <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 my-8 text-left">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Reason:
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {reason}
          </p>
          {orderId && (
            <p className="text-xs text-gray-500 mt-2">
              Order Reference: {orderId}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-brand-primary-hover transition-colors"
          >
            <span>Try Again</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/contact-us"
            className="flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}