
// "use client";

// import { useState, useEffect } from "react";
// import { X, TrendingUp, History, Tag, Search } from "lucide-react";
// import SearchBar from "../layout/SearchBar";
// import { motion, AnimatePresence } from "framer-motion";
// import { SanityCategory } from "@/sanity/types/product_types";
// import Link from "next/link";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// interface SearchPanelProps {
//   isOpen: boolean;
//   onClose: () => void;
//   trendingKeywords: string[];
//   popularCategories: SanityCategory[];
// }

// const SearchSuggestionPill = ({
//   text,
//   icon: Icon,
//   onSelect,
// }: {
//   text: string;
//   icon: React.ElementType;
//   onSelect: (term: string) => void;
// }) => (
//   <button
//     onClick={() => onSelect(text)}
//     className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-brand-primary/10 hover:text-brand-primary transition-all active:scale-95 border border-transparent hover:border-brand-primary/20"
//   >
//     <Icon size={14} className="opacity-70" />
//     <span>{text}</span>
//   </button>
// );

// export default function SearchPanel({
//   isOpen,
//   onClose,
//   trendingKeywords,
//   popularCategories,
// }: SearchPanelProps) {
//   const [recentSearches, setRecentSearches] = useState<string[]>([]);
//   const router = useRouter();

//   // 🔥 FIX: Prevent Cascading Render on Modal Open
//   // LocalStorage read karna 'next tick' par shift kiya.
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const storedSearches = localStorage.getItem("pocketvalue_recent_searches");
//       if (storedSearches) {
//         setRecentSearches(JSON.parse(storedSearches));
//       }
//     }, 0);
//     return () => clearTimeout(timer);
//   }, [isOpen]);

//   const clearRecentSearches = () => {
//     localStorage.removeItem("pocketvalue_recent_searches");
//     setRecentSearches([]);
//   };

//   const handleSuggestionClick = (term: string) => {
//     const trimmedTerm = term.trim();
//     if (!trimmedTerm) return;
//     const updatedSearches = [
//       trimmedTerm,
//       ...recentSearches.filter(
//         (t) => t.toLowerCase() !== trimmedTerm.toLowerCase()
//       ),
//     ].slice(0, 5);
//     localStorage.setItem(
//       "pocketvalue_recent_searches",
//       JSON.stringify(updatedSearches)
//     );
//     router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`);
//     onClose();
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.3 }}
//             onClick={onClose}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
//             aria-hidden="true"
//           />

//           {/* Drawer Panel */}
//           <motion.div
//             initial={{ y: "100%" }}
//             animate={{ y: 0 }}
//             exit={{ y: "100%" }}
//             transition={{ type: "spring", stiffness: 350, damping: 35 }}
//             className="fixed bottom-0 left-0 right-0 h-[calc(100dvh-80px)] bg-white dark:bg-gray-900 z-50 flex flex-col rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:hidden overflow-hidden"
//           >
//             {/* Handle Bar for Drag Feel */}
//             <div
//               className="w-full flex justify-center pt-3 pb-1"
//               onClick={onClose}
//             >
//               <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
//             </div>

//             {/* Sticky Header */}
//             <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
//               <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white flex items-center gap-2">
//                 <Search size={20} className="text-brand-primary" />
//                 Search
//               </h2>
//               <button
//                 onClick={onClose}
//                 className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-red-500 transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Search Input Area */}
//             <div className="p-5 shrink-0 bg-white dark:bg-gray-900 z-10">
//               <SearchBar
//                 searchSuggestions={{
//                   trendingKeywords: [],
//                   popularCategories: [],
//                 }}
//               />
//             </div>

//             {/* Scrollable Content */}
//             <div className="grow overflow-y-auto px-5 pb-24 custom-scrollbar">
//               <motion.div
//                 className="space-y-8"
//                 initial="hidden"
//                 animate="visible"
//                 variants={{
//                   hidden: { opacity: 0 },
//                   visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
//                 }}
//               >
//                 {/* 1. RECENT SEARCHES */}
//                 {recentSearches.length > 0 && (
//                   <motion.section
//                     variants={{
//                       hidden: { opacity: 0, y: 10 },
//                       visible: { opacity: 1, y: 0 },
//                     }}
//                   >
//                     <div className="flex justify-between items-center mb-3">
//                       <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
//                         <History size={14} /> Recent
//                       </h3>
//                       <button
//                         onClick={clearRecentSearches}
//                         className="text-[10px] font-bold text-red-500 hover:underline bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"
//                       >
//                         Clear History
//                       </button>
//                     </div>
//                     <div className="flex flex-wrap gap-2">
//                       {recentSearches.map((term) => (
//                         <SearchSuggestionPill
//                           key={term}
//                           text={term}
//                           icon={History}
//                           onSelect={handleSuggestionClick}
//                         />
//                       ))}
//                     </div>
//                   </motion.section>
//                 )}

//                 {/* 2. TRENDING */}
//                 {trendingKeywords?.length > 0 && (
//                   <motion.section
//                     variants={{
//                       hidden: { opacity: 0, y: 10 },
//                       visible: { opacity: 1, y: 0 },
//                     }}
//                   >
//                     <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
//                       <TrendingUp size={14} className="text-brand-primary" />{" "}
//                       Trending Now
//                     </h3>
//                     <div className="flex flex-wrap gap-2">
//                       {trendingKeywords.map((term) => (
//                         <SearchSuggestionPill
//                           key={term}
//                           text={term}
//                           icon={TrendingUp}
//                           onSelect={handleSuggestionClick}
//                         />
//                       ))}
//                     </div>
//                   </motion.section>
//                 )}

//                 {/* 3. POPULAR CATEGORIES */}
//                 {popularCategories?.length > 0 && (
//                   <motion.section
//                     variants={{
//                       hidden: { opacity: 0, y: 10 },
//                       visible: { opacity: 1, y: 0 },
//                     }}
//                   >
//                     <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
//                       <Tag size={14} /> Popular Categories
//                     </h3>
//                     <div className="grid grid-cols-3 gap-3">
//                       {popularCategories.map((cat) => (
//                         <Link
//                           key={cat._id}
//                           href={`/category/${cat.slug}`}
//                           onClick={onClose}
//                           className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-white hover:shadow-md dark:hover:bg-gray-700 transition-all active:scale-95 border border-gray-100 dark:border-gray-700"
//                         >
//                           <div className="w-14 h-14 relative rounded-full overflow-hidden bg-white dark:bg-gray-700 shadow-sm p-1 transition-colors">
//                             {cat.image ? (
//                               <Image
//                                 src={cat.image}
//                                 alt={cat.name}
//                                 fill
//                                 className="object-cover rounded-full"
//                                 sizes="56px"
//                               />
//                             ) : (
//                               <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//                                 <Tag className="text-gray-400" />
//                               </div>
//                             )}
//                           </div>
//                           <p className="text-[10px] font-bold text-center text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">
//                             {cat.name}
//                           </p>
//                         </Link>
//                       ))}
//                     </div>
//                   </motion.section>
//                 )}
//               </motion.div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, History, Tag, Search } from "lucide-react";
import SearchBar from "../layout/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { SanityCategory } from "@/sanity/types/product_types";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation"; // 🔥 Added usePathname

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  trendingKeywords: string[];
  popularCategories: SanityCategory[];
}

const SearchSuggestionPill = ({
  text,
  icon: Icon,
  onSelect,
}: {
  text: string;
  icon: React.ElementType;
  onSelect: (term: string) => void;
}) => (
  <button
    onClick={() => onSelect(text)}
    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-brand-primary/10 hover:text-brand-primary transition-all active:scale-95 border border-transparent hover:border-brand-primary/20"
  >
    <Icon size={14} className="opacity-70" />
    <span>{text}</span>
  </button>
);

export default function SearchPanel({
  isOpen,
  onClose,
  trendingKeywords,
  popularCategories,
}: SearchPanelProps) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname(); // 🔥 Hook

  // 🔥 FIX START: Auto-Close on Route Change
  useEffect(() => {
    if (isOpen) {
        onClose();
    }
  }, [pathname]);
  // 🔥 FIX END

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedSearches = localStorage.getItem("pocketvalue_recent_searches");
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const clearRecentSearches = () => {
    localStorage.removeItem("pocketvalue_recent_searches");
    setRecentSearches([]);
  };

  const handleSuggestionClick = (term: string) => {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return;
    const updatedSearches = [
      trimmedTerm,
      ...recentSearches.filter(
        (t) => t.toLowerCase() !== trimmedTerm.toLowerCase()
      ),
    ].slice(0, 5);
    localStorage.setItem(
      "pocketvalue_recent_searches",
      JSON.stringify(updatedSearches)
    );
    router.push(`/search?q=${encodeURIComponent(trimmedTerm)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 h-[calc(100dvh-80px)] bg-white dark:bg-gray-900 z-50 flex flex-col rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:hidden overflow-hidden"
          >
            {/* Handle Bar for Drag Feel */}
            <div
              className="w-full flex justify-center pt-3 pb-1"
              onClick={onClose}
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>

            {/* Sticky Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="text-xl font-clash font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Search size={20} className="text-brand-primary" />
                Search
              </h2>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Input Area */}
            <div className="p-5 shrink-0 bg-white dark:bg-gray-900 z-10">
              <SearchBar
                searchSuggestions={{
                  trendingKeywords: [],
                  popularCategories: [],
                }}
              />
            </div>

            {/* Scrollable Content */}
            <div className="grow overflow-y-auto px-5 pb-24 custom-scrollbar">
              <motion.div
                className="space-y-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
              >
                {/* 1. RECENT SEARCHES */}
                {recentSearches.length > 0 && (
                  <motion.section
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <History size={14} /> Recent
                      </h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] font-bold text-red-500 hover:underline bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={History}
                          onSelect={handleSuggestionClick}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* 2. TRENDING */}
                {trendingKeywords?.length > 0 && (
                  <motion.section
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <TrendingUp size={14} className="text-brand-primary" />{" "}
                      Trending Now
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingKeywords.map((term) => (
                        <SearchSuggestionPill
                          key={term}
                          text={term}
                          icon={TrendingUp}
                          onSelect={handleSuggestionClick}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* 3. POPULAR CATEGORIES */}
                {popularCategories?.length > 0 && (
                  <motion.section
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Tag size={14} /> Popular Categories
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {popularCategories.map((cat) => (
                        <Link
                          key={cat._id}
                          href={`/category/${cat.slug}`}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-white hover:shadow-md dark:hover:bg-gray-700 transition-all active:scale-95 border border-gray-100 dark:border-gray-700"
                        >
                          <div className="w-14 h-14 relative rounded-full overflow-hidden bg-white dark:bg-gray-700 shadow-sm p-1 transition-colors">
                            {cat.image ? (
                              <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover rounded-full"
                                sizes="56px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <Tag className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-center text-gray-700 dark:text-gray-300 line-clamp-2 leading-tight">
                            {cat.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </motion.section>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}