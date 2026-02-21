// /app/Bismillah786/(dashboard)/_components/AdminLayoutClient.tsx

"use client";

import { useState } from "react";
import AdminSidebar from "../../_components/AdminSidebar";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      
      {/* --- DESKTOP SIDEBAR (FIXED) --- */}
      {/* Yeh div sidebar ko apni jagah par fix rakhega */}
      <div className="hidden lg:block lg:shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 bg-white dark:bg-gray-800 p-4 border-b dark:border-gray-700 shadow-sm z-30 flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              aria-label="Open sidebar" 
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
                <Menu />
            </button>
            <h1 className="text-lg font-bold">Admin Panel</h1>
        </header>

        {/* --- MOBILE SIDEBAR (OFF-CANVAS) --- */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                transition={{ duration: 0.2 }} 
                onClick={() => setIsSidebarOpen(false)} 
                className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
                aria-hidden="true"
              />
              <motion.div 
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} 
                transition={{ type: "spring", stiffness: 400, damping: 40 }} 
                className="fixed top-0 left-0 h-full z-50 lg:hidden w-64"
              >
                <AdminSidebar />
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <X />
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <main className="flex-1 p-4 sm:p-6 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}