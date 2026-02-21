// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { X, UserCircle } from "lucide-react";
// import { useStateContext } from "@/app/context/StateContext";
// // Ensure ye path sahi ho jahan apka AccountSidebar rakha hai
// import AccountSidebar from "@/app/account/_components/AccountSidebar";

// export default function MobileProfileSidebar() {
//   // 🔥 Global State se control
//   const { isProfileSidebarOpen, closeProfileSidebar } = useStateContext();

//   return (
//     <AnimatePresence>
//       {isProfileSidebarOpen && (
//         <>
//           {/* 1. BACKDROP (Black Overlay) */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             onClick={closeProfileSidebar}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
//             aria-hidden="true"
//           />

//           {/* 2. SIDEBAR DRAWER (Slides from RIGHT) */}
//           <motion.div
//             initial={{ x: "100%" }} // Right side se ayega
//             animate={{ x: 0 }}
//             exit={{ x: "100%" }}
//             transition={{ type: "spring", stiffness: 300, damping: 30 }}

//             // 🔥 HEIGHT CALCULATION (Same consistent logic)
//             // 100vh - 65px (BottomNav) - Safe Area
//             style={{
//                 height: "calc(100dvh - 65px - env(safe-area-inset-bottom))"
//             }}

//             // 🔥 Rounded Bottom-Left instead of Bottom-Right
//             className="fixed top-0 right-0 w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col shadow-2xl overflow-hidden "
//           >

//             {/* HEADER (Sticky Top) */}
//             <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10 shrink-0">
//               <div className="flex items-center gap-2">
//                   <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">
//                     <UserCircle size={24} />
//                   </div>
//                   <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white">
//                     Profile
//                   </h2>
//               </div>
//               <button
//                   onClick={closeProfileSidebar}
//                   className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors active:scale-90"
//               >
//                   <X size={20} />
//               </button>
//             </div>

//             {/* CONTENT AREA */}
//             <div className="grow overflow-y-auto custom-scrollbar">
//                {/*
//                   Yahan hum apka banaya hua AccountSidebar render kar rahe hain.
//                   onLinkClick prop pass kiya taake link dabane par drawer band ho jaye.
//                */}
//                <AccountSidebar onLinkClick={closeProfileSidebar} />
//             </div>

//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle } from "lucide-react";
// Context import hata diya hai
import AccountSidebar from "@/app/(main)/account/_components/AccountSidebar";

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileProfileSidebar({
  isOpen,
  onClose,
}: ProfileSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. BACKDROP (Black Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} // Faster Fade
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />

          {/* 2. SIDEBAR DRAWER (Slides from RIGHT) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }} // Snappy Spring
            // HEIGHT CALCULATION
            style={{
              height: "calc(100dvh - 60px - env(safe-area-inset-bottom))",
            }}
            className="fixed top-0 right-0 w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col shadow-2xl overflow-hidden "
          >
            {/* HEADER (Sticky Top) */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">
                  <UserCircle size={24} />
                </div>
                <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white">
                  Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENT AREA */}
            <div className="grow overflow-y-auto custom-scrollbar">
              {/* Link click karne par drawer band ho jayega */}
              <AccountSidebar onLinkClick={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
