
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react"; // 🔥 useRef Added
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  LogOut,
  Loader2,
  ChevronRight,
  RefreshCcw,
  Heart,
  LogIn
} from "lucide-react";

const sidebarNavItems = [
  { title: "Dashboard", href: "/account", icon: LayoutDashboard },
  { title: "My Orders", href: "/account/orders", icon: ShoppingBag },
  { title: "My Profile", href: "/account/profile", icon: User },
  { title: "Wishlist", href: "/wishlist", icon: Heart },
  { title: "Address Book", href: "/account/addresses", icon: MapPin },
  { title: "Returns", href: "/account/returns", icon: RefreshCcw },
];

export default function AccountSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // 🔥 FIX START: Prevent Auto-Close on Mount
  // Hum current path ko save kar rahay hain jab component pehli baar open hota hai.
  const mountPath = useRef(pathname);

  useEffect(() => {
    // Check karein ke kya Path ACTUAL mein change hua hai?
    // Agar Path wahi hai jo open hotay waqt tha, to close mat karo.
    if (pathname !== mountPath.current) {
        if (onLinkClick) {
            onLinkClick();
        }
        // Naye path ko update kardo taake agli navigation sahi track ho
        mountPath.current = pathname;
    }
  }, [pathname, onLinkClick]);
  // 🔥 FIX END

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <div className="p-8 flex justify-center items-center h-full min-h-75">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  // === GUEST USER VIEW ===
  if (status === "unauthenticated") {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent p-5">
            <div className="text-center py-10 space-y-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <User size={40} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Welcome Guest</h3>
                    <p className="text-sm text-gray-500 mt-1">Login to access your profile & orders.</p>
                </div>
                <Link 
                    href="/login"
                    // Login page par jane ke liye drawer band karna zaroori hai
                    onClick={onLinkClick} 
                    className="flex items-center justify-center gap-2 w-full py-3 bg-brand-primary text-white font-bold rounded-xl shadow-md hover:bg-brand-primary-hover transition-colors"
                >
                    <LogIn size={20} /> Login / Register
                </Link>
            </div>
        </div>
      );
  }

  // === AUTHENTICATED USER VIEW ===
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      
      {/* 1. USER PROFILE CARD */}
      <div className="p-5 lg:p-0 mb-6">
        <div className="flex items-center gap-4 p-4 bg-linear-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-md shrink-0 bg-gray-200 flex items-center justify-center">
            {session?.user?.image ? (
                <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                fill
                sizes="56px"
                className="object-cover"
                />
            ) : (
                <span className="text-xl font-bold text-gray-500">
                    {session?.user?.name?.[0] || "U"}
                </span>
            )}
            </div>
            <div className="overflow-hidden">
            <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                {session?.user?.name || "Valued Customer"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session?.user?.email}
            </p>
            </div>
        </div>
      </div>

      {/* 2. NAVIGATION MENU */}
      <nav className="px-5 lg:px-0 grow">
        <ul className="space-y-2">
          {sidebarNavItems.map((item) => {
            const isActive = item.href === "/account"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <li key={item.title}>
                <Link
                  href={item.href}
                  // Yahan hum onClick hata rahay hain kyunke ab useEffect handle karega.
                  // Lekin agar user SAME page par click kare to drawer band hona chahiye ya nahi?
                  // Usually nahi. User navigate karega tabhi band hoga.
                  // Agar ap chahte hain click karte hi band hojaye (bhalay same page ho), to onClick rehne dein.
                  // Best UX ye hai ke ise rehne dein taake user ko feedback mile.
                  onClick={onLinkClick} 
                  className={`group relative flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${
                      isActive
                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isActive ? "text-white" : "text-gray-400 group-hover:text-brand-primary"} />
                    <span>{item.title}</span>
                  </div>
                  
                  {!isActive && (
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 3. LOGOUT BUTTON */}
      <div className="p-5 lg:px-0 mt-4 lg:mt-6 shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 transition-all active:scale-95"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}