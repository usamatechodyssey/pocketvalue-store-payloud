// /src/app/Bismillah786/settings/page.tsx (CORRECTED)

import { Suspense } from "react";
import { getSettingsData } from "./_actions/settingsActions";
import SettingsClientPage from "./_components/SettingsClientPage";
import SettingsLoadingSkeleton from "./_components/LoadingSkeleton";
import { AlertTriangle } from "lucide-react";

// === THE FIX IS HERE ===
// This line explicitly tells Next.js to render this page dynamically on the server for each request.
// This is required because our data fetching logic uses auth(), which is a dynamic function.
export const dynamic = "force-dynamic";

// The async component that fetches data
async function SettingsManager() {
  const { sanitySettings, paymentGateways, error } = await getSettingsData();

  if (error || !sanitySettings) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-lg flex items-center gap-3">
        <AlertTriangle className="h-5 w-5" />
        <div>
          <h3 className="font-semibold">Error Loading Settings</h3>
          <p className="text-sm">
            {error || "Could not fetch settings data from the server."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <SettingsClientPage
      initialSanitySettings={sanitySettings}
      initialPaymentGateways={paymentGateways}
    />
  );
}

// The main page export
export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Store Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your store&apos;s shipping rules, payment methods, and contact
          information.
        </p>
      </div>

      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <SettingsManager />
      </Suspense>
    </div>
  );
}
