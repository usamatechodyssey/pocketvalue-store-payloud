
// /src/app/access-denied/page.tsx (VERIFIED - NO CHANGES NEEDED)

import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

// SEO metadata to prevent this page from being indexed by search engines.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccessDeniedPage() {
  return (
    <main className="w-full min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-lg">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
          <ShieldAlert
            className="text-red-600 dark:text-red-400"
            size={40}
            strokeWidth={1.5}
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Access Denied
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          You do not have the necessary permissions to access this page. This
          area is restricted to authorized administrative personnel only.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Go Back to Homepage</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. The component is a simple, effective UI for displaying an access denied message and is correctly configured to be ignored by search engines.
