
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  LogOut,
  BarChart,
  Tags,
  Settings,
  Shield,
  Lock,
  Undo2,
  Loader2, // Added Loader
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- Navigation Structure ---
const navGroups = [
  {
    title: "Store",
    items: [
      {
        href: "/Bismillah786",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["Super Admin", "Store Manager", "Content Editor"],
      },
      {
        href: "/Bismillah786/orders",
        label: "Orders",
        icon: ShoppingCart,
        roles: ["Super Admin", "Store Manager"],
      },
      {
        href: "/Bismillah786/returns",
        label: "Returns",
        icon: Undo2, 
        roles: ["Super Admin", "Store Manager"],
      },
      {
        href: "/Bismillah786/products",
        label: "Products",
        icon: Package,
        roles: ["Super Admin", "Content Editor"],
      },
      {
        href: "/Bismillah786/categories",
        label: "Categories",
        icon: Tags,
        roles: ["Super Admin", "Content Editor"],
      },
      {
        href: "/Bismillah786/users",
        label: "Customers",
        icon: Users,
        roles: ["Super Admin", "Store Manager"],
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        href: "/Bismillah786/analytics",
        label: "Reports",
        icon: BarChart,
        roles: ["Super Admin"],
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        href: "/Bismillah786/settings",
        label: "Store Settings",
        icon: Settings,
        roles: ["Super Admin"],
      },
      {
        href: "/Bismillah786/admins",
        label: "Manage Admins",
        icon: Shield,
        roles: ["Super Admin"],
      },
    ],
  },
];

// --- Reusable NavLink Component (HYDRATION SAFE) ---
const NavLink = ({
  href,
  label,
  icon: Icon,
  isLocked,
  isMounted, // New Prop
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isLocked: boolean;
  isMounted: boolean;
}) => {
  const pathname = usePathname();
  const isActive =
    href === "/Bismillah786" ? pathname === href : pathname.startsWith(href);

  const commonClasses =
    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors";

  // 🔴 HYDRATION FIX: Until mounted, render a neutral state (div)
  // This prevents the server (div) vs client (a) mismatch
  if (!isMounted) {
     return (
        <div className={`${commonClasses} text-gray-400 dark:text-gray-600 opacity-50`}>
             <Icon size={18} />
             <span>{label}</span>
        </div>
     );
  }

  if (isLocked) {
    return (
      <div
        className={`${commonClasses} text-gray-400 dark:text-gray-600 cursor-not-allowed relative`}
        title="You do not have permission to access this page."
      >
        <Icon size={18} />
        <span>{label}</span>
        <Lock
          size={12}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        />
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${commonClasses} ${
        isActive
          ? "bg-brand-primary/10 text-brand-primary font-semibold"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
};

// --- Main Sidebar Component ---
export default function AdminSidebar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading State for better UX
  const isLoading = status === "loading";

  // Safe User Role Access
  const userRole = session?.user?.role;

  const handleLogout = async () => {
    toast.loading("Logging out...");
    await signOut({ callbackUrl: "/login" });
    toast.dismiss();
  };

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full">
      <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          href="/Bismillah786"
          className="text-2xl font-bold text-brand-primary"
        >
          PocketValue
        </Link>
      </div>

      <nav className="grow overflow-y-auto mt-6 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                
                // Permission Check
                // (Only works if session is loaded)
                const hasPermission =
                  userRole && item.roles
                    ? item.roles.includes(userRole)
                    : false;

                // Lock Logic:
                // 1. If not mounted yet -> Render SKELETON (handled inside NavLink)
                // 2. If loading -> Locked
                // 3. If mounted & no permission -> Locked
                const isLocked = isLoading || !hasPermission;

                return (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isLocked={isLocked}
                      isMounted={mounted} // Pass mounted state
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}