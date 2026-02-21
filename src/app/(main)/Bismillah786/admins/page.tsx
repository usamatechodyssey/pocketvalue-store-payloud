
// /src/app/Bismillah786/admins/page.tsx

import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { getAdmins } from "./_actions/adminActions";
import AdminListClient from "./_components/AdminListClient";
import { Users, ShieldAlert } from "lucide-react";

export default async function ManageAdminsPage() {
  const session = await auth();

  const userRole = session?.user?.role;

  if (userRole !== "Super Admin") {
    redirect("/access-denied");
  }

  const initialAdmins = await getAdmins();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
          <Users size={24} className="text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Manage Admins
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {/* ✅ FIX: 'store's' -> 'store&apos;s' */}
            Invite, view, and manage roles for your store&apos;s administrative
            staff.
          </p>
        </div>
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start gap-3">
          <ShieldAlert
            size={20}
            className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0"
          />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
              Important Security Notice
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              {/* ✅ FIX: 'store's' -> 'store&apos;s' */}
              Only grant admin access to trusted individuals. Store Managers and
              Content Editors have significant control over your store&apos;s
              operations and content.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <AdminListClient initialAdmins={initialAdmins} />
      </div>
    </div>
  );
}