
"use client";

import AccountSidebar from "./AccountSidebar";

export default function AccountSidebarClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* 
          ❌ OLD MOBILE HEADER REMOVED 
          Kyunke ab Mobile Profile Sidebar "Bottom Nav" se khulta hai.
      */}

      {/* === 1. DESKTOP SIDEBAR (Visible only on Large Screens) === */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28">
            <AccountSidebar />
        </div>
      </div>

      {/* === 2. MAIN CONTENT AREA === */}
      {/* Mobile par sirf ye dikhega, Desktop par ye Right side par hoga */}
      <div className="grow min-h-125">
        {children}
      </div>
      
    </div>
  );
}