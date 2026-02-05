
// // "use client";


// "use client";

// import { useState, useEffect, useMemo, useRef } from "react";
// import { useRouter, useSearchParams, usePathname } from "next/navigation";
// import SanityProduct, {
//   SanityBrand,
//   SanityCategory,
// } from "@/sanity/types/product_types";
// import FilterSidebar from "./FilterSidebar";
// import ProductGrid from "../product/ProductGrid";
// import QuickViewModal from "../product/QuickViewModal";
// import PaginationControls from "../ui/PaginationControls";
// import ListingHeader from "./ListingHeader"; 
// import { debounce } from "lodash";
// import ProductCardSkeleton from "../product/ProductCardSkeleton";

// const PRODUCTS_PER_PAGE = 40;

// interface AppliedFilters {
//   brands: string[];
//   categories?: string[];
//   isFeatured?: boolean;
//   [key: string]: any;
//   isOnSale?: boolean; 
//   minRating?: number; 
//   availability?: string[]; 
// }

// interface FilterData {
//   brands: (SanityBrand | null)[];
//   attributes: { name: string; value: string }[];
//   priceRange: { min: number; max: number };
// }

// interface PLPProps {
//   initialProducts: SanityProduct[];
//   filterData: FilterData;
//   categoryTree?: SanityCategory;
//   dealCategories?: SanityCategory[];
//   context: {
//     type: "category" | "search" | "deals";
//     value?: string;
//     sort?: string;
//     filter?: string;
//   };
//   totalCount: number;
// }

// export default function ProductListingClient({
//   initialProducts,
//   filterData,
//   categoryTree,
//   dealCategories,
//   context,
//   totalCount,
// }: PLPProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // 1. URL se Page Number uthao
//   const urlPage = Number(searchParams.get("page")) || 1;
//   const [currentPage, setCurrentPage] = useState(urlPage);

//   // Sync state (Back button support)
//   useEffect(() => {
//     setCurrentPage(urlPage);
//   }, [urlPage]);

//   const [products, setProducts] = useState(initialProducts);
//   const [totalProducts, setTotalProducts] = useState(totalCount);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
//   const [sortOrder, setSortOrder] = useState(context.sort || "best-match");

//   const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
//     brands: [],
//     categories: [],
//     isFeatured: context.filter === "isFeatured",
//   });
  
//   const [appliedPriceRange, setAppliedPriceRange] = useState({
//     min: 0,
//     max: Infinity,
//   });

//   const isInitialMount = useRef(true);

//   // Sidebar Close Event
//   useEffect(() => {
//     const handleCloseSidebar = () => setIsSidebarOpen(false);
//     window.addEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
//     return () => window.removeEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
//   }, []);

//   // Fetch Logic
//   const debouncedFetch = useMemo(
//     () =>
//       debounce(async (params: any) => {
//         setIsLoading(true);
//         try {
//           const response = await fetch("/api/filter", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(params),
//           });

//           if (!response.ok) throw new Error("API request failed");

//           const data = await response.json();
//           setProducts(data.products);
//           setTotalProducts(data.totalCount);
//         } catch (error) {
//           console.error("Failed to fetch products:", error);
//           setProducts([]);
//           setTotalProducts(0);
//         } finally {
//           setIsLoading(false);
//         }
//       }, 500),
//     []
//   );

//   useEffect(() => {
//     return () => {
//       debouncedFetch.cancel();
//     };
//   }, [debouncedFetch]);

//   // Main Fetch Effect
//   useEffect(() => {
//     if (isInitialMount.current && currentPage === 1 && products === initialProducts) {
//         isInitialMount.current = false;
//         return;
//     }
//     isInitialMount.current = false;

//     setIsLoading(true);

//     const payload = {
//       page: currentPage,
//       sortOrder,
//       filters: appliedFilters,
//       priceRange: {
//         min: appliedPriceRange.min,
//         max: appliedPriceRange.max === Infinity ? undefined : appliedPriceRange.max,
//       },
//       context,
//     };

//     debouncedFetch(payload);
//   }, [
//     currentPage, 
//     sortOrder,
//     appliedFilters,
//     appliedPriceRange,
//     context,
//     debouncedFetch,
//   ]);

//   // 🔥 FIX 1: URL Update Effect (Cleaner)
//   useEffect(() => {
//     const params = new URLSearchParams(searchParams.toString());
    
//     // Agar Page 1 hai, to URL se param HATA do
//     if (currentPage > 1) {
//       params.set("page", currentPage.toString());
//     } else {
//       params.delete("page");
//     }

//     const newQuery = params.toString();
//     const currentQuery = searchParams.toString();

//     // Sirf tab replace karo agar actual change hai
//     if (newQuery !== currentQuery) {
//        router.replace(`${pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
//     }
//   }, [currentPage, appliedFilters, appliedPriceRange, sortOrder]);


//   // 🔥 FIX 2: Helper to reset state to Page 1
//   const updatePageToOne = () => {
//     setCurrentPage(1); 
//     // Note: Yahan router.replace nahi lagaya kyunke upar wala useEffect khud handle karega
//   };
  
//   const handleFilterChange = (group: string, value: any) => {
//     updatePageToOne(); 

//     setAppliedFilters((prev) => {
//       if (group === "isOnSale") return { ...prev, isOnSale: value };
//       if (group === "minRating") return { ...prev, minRating: value };

//       const currentList: string[] = Array.isArray(prev[group]) ? prev[group] : [];
//       const newList = currentList.includes(value)
//         ? currentList.filter((v: string) => v !== value)
//         : [...currentList, value];

//       return { ...prev, [group]: newList };
//     });
//   };

//   const handlePriceApply = (price: { min: string; max: string }) => {
//     updatePageToOne();
//     setAppliedPriceRange({
//       min: Number(price.min) || 0,
//       max: Number(price.max) || Infinity,
//     });
//   };

//   const handleSortChange = (value: string) => {
//       updatePageToOne();
//       setSortOrder(value);
//   }

//   const handleClearFilters = () => {
//     updatePageToOne();
//     setAppliedFilters({
//       brands: [],
//       categories: [],
//       isFeatured: false,
//       isOnSale: false,
//       minRating: undefined,
//       availability: [],
//     });
//     setAppliedPriceRange({ min: 0, max: Infinity });
//     setSortOrder("best-match");
//   };

//   const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

//   const uniqueBrandsForSidebar = useMemo(
//     () => (filterData?.brands?.filter(Boolean) as SanityBrand[]) || [],
//     [filterData]
//   );

//   const uniqueAttributes = useMemo(() => {
//     const attrs: Record<string, Set<string>> = {};
//     if (filterData?.attributes) {
//       filterData.attributes.forEach(({ name, value }) => {
//         if (!name || !value) return;
//         if (!attrs[name]) attrs[name] = new Set();
//         attrs[name].add(value);
//       });
//     }
//     return Object.entries(attrs).map(([name, valuesSet]) => ({
//       name,
//       values: Array.from(valuesSet).sort(),
//     }));
//   }, [filterData]);

//   const isDataStale = currentPage > 1 && products === initialProducts;
//   const showSkeletons = isLoading || isDataStale;

//   return (
//     <>
//       <div className="flex flex-col lg:flex-row gap-4 items-start">
//         <FilterSidebar
//           isOpen={isSidebarOpen}
//           onClose={() => setIsSidebarOpen(false)}
//           brands={uniqueBrandsForSidebar}
//           attributes={uniqueAttributes}
//           priceRange={filterData.priceRange}
//           appliedFilters={appliedFilters}
//           onFilterChange={handleFilterChange}
//           onPriceApply={handlePriceApply}
//           onClearFilters={handleClearFilters}
//           categoryTree={categoryTree}
//           dealCategories={dealCategories}
//         />

//         <main className="flex-1 w-full min-w-0">
//           <ListingHeader
//             productsCount={products.length}
//             totalCount={totalProducts}
//             sortOrder={sortOrder}
//             onSortChange={handleSortChange}
//             onMobileFilterClick={() => setIsSidebarOpen(true)}
//             appliedFilters={appliedFilters}
//             onRemoveFilter={handleFilterChange} 
//             onClearAll={handleClearFilters}
//           />

//           <div className="relative min-h-[50vh]">
            
//             {showSkeletons ? (
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
//                     {[...Array(15)].map((_, i) => (
//                         <div key={i} className="h-[350px]"> 
//                             <ProductCardSkeleton />
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <div>
//                     {products.length > 0 ? (
//                         <ProductGrid
//                         products={products}
//                         onQuickView={setQuickViewProduct}
//                         />
//                     ) : (
//                         <div className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
//                             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                             No Products Found
//                             </h3>
//                             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//                             Try adjusting your filters or clearing them.
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             )}

//           </div>

//           {totalPages > 1 && (
//             <div className="mt-8">
//               <PaginationControls 
//                  key={currentPage} 
//                  totalPages={totalPages} 
//                  paramName="page" 
//               />
//             </div>
//           )}
//         </main>
//       </div>

//       <QuickViewModal
//         product={quickViewProduct}
//         isOpen={!!quickViewProduct}
//         onClose={() => setQuickViewProduct(null)}
//       />
//     </>
//   );
// }
// // import { useState, useEffect, useMemo, useRef } from "react";
// // import { useRouter, useSearchParams, usePathname } from "next/navigation"; // ✅ URL hooks add kiye
// // import SanityProduct, {
// //   SanityBrand,
// //   SanityCategory,
// // } from "@/sanity/types/product_types";
// // import FilterSidebar from "./FilterSidebar";
// // import ProductGrid from "../product/ProductGrid";
// // import QuickViewModal from "../product/QuickViewModal";
// // import PaginationControls from "../ui/PaginationControls";
// // import ListingHeader from "./ListingHeader"; 
// // import { Loader2 } from "lucide-react";
// // import { debounce } from "lodash";

// // // ✅ 1. Product count barha kar 24 kar diya
// // const PRODUCTS_PER_PAGE = 40;

// // interface AppliedFilters {
// //   brands: string[];
// //   categories?: string[];
// //   isFeatured?: boolean;
// //   [key: string]: any;
// //   isOnSale?: boolean; 
// //   minRating?: number; 
// //   availability?: string[]; 
// // }

// // interface FilterData {
// //   brands: (SanityBrand | null)[];
// //   attributes: { name: string; value: string }[];
// //   priceRange: { min: number; max: number };
// // }

// // interface PLPProps {
// //   initialProducts: SanityProduct[];
// //   filterData: FilterData;
// //   categoryTree?: SanityCategory;
// //   dealCategories?: SanityCategory[];
// //   context: {
// //     type: "category" | "search" | "deals";
// //     value?: string;
// //     sort?: string;
// //     filter?: string;
// //   };
// //   totalCount: number;
// // }

// // export default function ProductListingClient({
// //   initialProducts,
// //   filterData,
// //   categoryTree,
// //   dealCategories,
// //   context,
// //   totalCount,
// // }: PLPProps) {
// //   const router = useRouter();
// //   const pathname = usePathname();
// //   const searchParams = useSearchParams();

// //   // ✅ 2. Current Page ab direct URL se ayega (Local state khatam)
// //   const currentPage = Number(searchParams.get("page")) || 1;

// //   const [products, setProducts] = useState(initialProducts);
// //   const [totalProducts, setTotalProducts] = useState(totalCount);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
// //   const [sortOrder, setSortOrder] = useState(context.sort || "best-match");

// //   const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
// //     brands: [],
// //     categories: [],
// //     isFeatured: context.filter === "isFeatured",
// //   });
  
// //   const [appliedPriceRange, setAppliedPriceRange] = useState({
// //     min: 0,
// //     max: Infinity,
// //   });

// //   const isInitialMount = useRef(true);

// //   // === Sidebar Close Event ===
// //   useEffect(() => {
// //     const handleCloseSidebar = () => setIsSidebarOpen(false);
// //     window.addEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
// //     return () => window.removeEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
// //   }, []);

// //   // === Performance Debounce ===
// //   const debouncedFetch = useMemo(
// //     () =>
// //       debounce(async (params: any) => {
// //         setIsLoading(true);
// //         try {
// //           const response = await fetch("/api/filter", {
// //             method: "POST",
// //             headers: { "Content-Type": "application/json" },
// //             body: JSON.stringify(params),
// //           });

// //           if (!response.ok) throw new Error("API request failed");

// //           const data = await response.json();
// //           setProducts(data.products);
// //           setTotalProducts(data.totalCount);
// //         } catch (error) {
// //           console.error("Failed to fetch products:", error);
// //           setProducts([]);
// //           setTotalProducts(0);
// //         } finally {
// //           setIsLoading(false);
// //         }
// //       }, 500),
// //     []
// //   );

// //   useEffect(() => {
// //     return () => {
// //       debouncedFetch.cancel();
// //     };
// //   }, [debouncedFetch]);

// //   // === Unified Fetch Effect ===
// //   // Jab bhi Page (URL se), Sort, Filters ya Price badlay ga, ye chalay ga
// //   useEffect(() => {
// //     if (isInitialMount.current) {
// //       isInitialMount.current = false;
// //       return;
// //     }

// //     const payload = {
// //       page: currentPage, // ✅ URL wala page
// //       sortOrder,
// //       filters: appliedFilters,
// //       priceRange: {
// //         min: appliedPriceRange.min,
// //         max: appliedPriceRange.max === Infinity ? undefined : appliedPriceRange.max,
// //       },
// //       context,
// //     };

// //     debouncedFetch(payload);
// //   }, [
// //     currentPage, // Triggered when URL changes
// //     sortOrder,
// //     appliedFilters,
// //     appliedPriceRange,
// //     context,
// //     debouncedFetch,
// //   ]);

// //   // ✅ 3. URL reset logic: Jab user filter badle, page=1 kar do URL mein
// //   useEffect(() => {
// //     if (!isInitialMount.current && currentPage !== 1) {
// //       const params = new URLSearchParams(searchParams.toString());
// //       params.set("page", "1");
// //       router.push(`${pathname}?${params.toString()}`, { scroll: false });
// //     }
// //   }, [appliedFilters, appliedPriceRange]);

// //   // === Filter Handlers ===
// //   const handleFilterChange = (group: string, value: any) => {
// //     setAppliedFilters((prev) => {
// //       if (group === "isOnSale") return { ...prev, isOnSale: value };
// //       if (group === "minRating") return { ...prev, minRating: value };

// //       const currentList: string[] = Array.isArray(prev[group]) ? prev[group] : [];
// //       const newList = currentList.includes(value)
// //         ? currentList.filter((v: string) => v !== value)
// //         : [...currentList, value];

// //       return { ...prev, [group]: newList };
// //     });
// //   };

// //   const handlePriceApply = (price: { min: string; max: string }) => {
// //     setAppliedPriceRange({
// //       min: Number(price.min) || 0,
// //       max: Number(price.max) || Infinity,
// //     });
// //   };

// //   const handleClearFilters = () => {
// //     setAppliedFilters({
// //       brands: [],
// //       categories: [],
// //       isFeatured: false,
// //       isOnSale: false,
// //       minRating: undefined,
// //       availability: [],
// //     });
// //     setAppliedPriceRange({ min: 0, max: Infinity });
// //     setSortOrder("best-match");
// //   };

// //   const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

// //   // Memoize Sidebar Data
// //   const uniqueBrandsForSidebar = useMemo(
// //     () => (filterData?.brands?.filter(Boolean) as SanityBrand[]) || [],
// //     [filterData]
// //   );

// //   const uniqueAttributes = useMemo(() => {
// //     const attrs: Record<string, Set<string>> = {};
// //     if (filterData?.attributes) {
// //       filterData.attributes.forEach(({ name, value }) => {
// //         if (!name || !value) return;
// //         if (!attrs[name]) attrs[name] = new Set();
// //         attrs[name].add(value);
// //       });
// //     }
// //     return Object.entries(attrs).map(([name, valuesSet]) => ({
// //       name,
// //       values: Array.from(valuesSet).sort(),
// //     }));
// //   }, [filterData]);

// //   return (
// //     <>
// //       <div className="flex flex-col lg:flex-row gap-4 items-start">
// //         <FilterSidebar
// //           isOpen={isSidebarOpen}
// //           onClose={() => setIsSidebarOpen(false)}
// //           brands={uniqueBrandsForSidebar}
// //           attributes={uniqueAttributes}
// //           priceRange={filterData.priceRange}
// //           appliedFilters={appliedFilters}
// //           onFilterChange={handleFilterChange}
// //           onPriceApply={handlePriceApply}
// //           onClearFilters={handleClearFilters}
// //           categoryTree={categoryTree}
// //           dealCategories={dealCategories}
// //         />

// //         <main className="flex-1 w-full min-w-0">
// //           <ListingHeader
// //             productsCount={products.length}
// //             totalCount={totalProducts}
// //             sortOrder={sortOrder}
// //             onSortChange={setSortOrder}
// //             onMobileFilterClick={() => setIsSidebarOpen(true)}
// //             appliedFilters={appliedFilters}
// //             onRemoveFilter={handleFilterChange} 
// //             onClearAll={handleClearFilters}
// //           />

// //           <div className="relative min-h-[50vh]">
// //             {isLoading && (
// //               <div className="absolute inset-0 flex items-center justify-center z-10 rounded-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px]">
// //                 <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
// //               </div>
// //             )}

// //             <div>
// //               {products.length > 0 ? (
// //                 <ProductGrid
// //                   products={products}
// //                   onQuickView={setQuickViewProduct}
// //                 />
// //               ) : (
// //                 !isLoading && (
// //                   <div className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
// //                     <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
// //                       No Products Found
// //                     </h3>
// //                     <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
// //                       Try adjusting your filters or clearing them.
// //                     </p>
// //                   </div>
// //                 )
// //               )}
// //             </div>
// //           </div>

// //           {/* ✅ 4. Pagination: Ab sirf totalPages pass karna hai */}
// //           {totalPages > 1 && (
// //             <div className="mt-8">
// //               <PaginationControls totalPages={totalPages} />
// //             </div>
// //           )}
// //         </main>
// //       </div>

// //       <QuickViewModal
// //         product={quickViewProduct}
// //         isOpen={!!quickViewProduct}
// //         onClose={() => setQuickViewProduct(null)}
// //       />
// //     </>
// //   );
// // }
// src/app/components/category/ProductListingClient.tsx

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import SanityProduct, {
  SanityBrand,
  SanityCategory,
} from "@/sanity/types/product_types";
import FilterSidebar from "./FilterSidebar";
import ProductGrid from "../product/ProductGrid";
import QuickViewModal from "../product/QuickViewModal";
import PaginationControls from "../ui/PaginationControls";
import ListingHeader from "./ListingHeader"; 
import { debounce } from "lodash";
import ProductCardSkeleton from "../product/ProductCardSkeleton";

const PRODUCTS_PER_PAGE = 40;

// --- 🔥 HELPER: UNIVERSAL DEDUPLICATOR ---
// Ye function kisi bhi Object Array me se duplicates nikal dega based on ID or Key
function getUniqueItems<T>(items: T[], key: keyof T): T[] {
    const seen = new Set();
    return items.filter(item => {
        const val = item[key];
        if (seen.has(val)) return false; // Duplicate found, skip it
        seen.add(val);
        return true; // New item, keep it
    });
}

interface AppliedFilters {
  brands: string[];
  categories?: string[];
  isFeatured?: boolean;
  [key: string]: any;
  isOnSale?: boolean; 
  minRating?: number; 
  availability?: string[]; 
}

interface FilterData {
  brands: (SanityBrand | null)[];
  attributes: { name: string; value: string }[];
  priceRange: { min: number; max: number };
}

interface PLPProps {
  initialProducts: SanityProduct[];
  filterData: FilterData;
  categoryTree?: SanityCategory;
  dealCategories?: SanityCategory[];
  context: {
    type: "category" | "search" | "deals";
    value?: string;
    sort?: string;
    filter?: string;
  };
  totalCount: number;
}

export default function ProductListingClient({
  initialProducts,
  filterData,
  categoryTree,
  dealCategories,
  context,
  totalCount,
}: PLPProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(urlPage);

  useEffect(() => {
    setCurrentPage(urlPage);
  }, [urlPage]);

  const [products, setProducts] = useState(initialProducts);
  const [totalProducts, setTotalProducts] = useState(totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<SanityProduct | null>(null);
  const [sortOrder, setSortOrder] = useState(context.sort || "best-match");

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    brands: [],
    categories: [],
    isFeatured: context.filter === "isFeatured",
  });
  
  const [appliedPriceRange, setAppliedPriceRange] = useState({
    min: 0,
    max: Infinity,
  });

  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleCloseSidebar = () => setIsSidebarOpen(false);
    window.addEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
    return () => window.removeEventListener("CLOSE_FILTER_SIDEBAR", handleCloseSidebar);
  }, []);

  const debouncedFetch = useMemo(
    () =>
      debounce(async (params: any) => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/filter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });

          if (!response.ok) throw new Error("API request failed");

          const data = await response.json();
          setProducts(data.products);
          setTotalProducts(data.totalCount);
        } catch (error) {
          console.error("Failed to fetch products:", error);
          setProducts([]);
          setTotalProducts(0);
        } finally {
          setIsLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  useEffect(() => {
    if (isInitialMount.current && currentPage === 1 && products === initialProducts) {
        isInitialMount.current = false;
        return;
    }
    isInitialMount.current = false;

    setIsLoading(true);

    const payload = {
      page: currentPage,
      sortOrder,
      filters: appliedFilters,
      priceRange: {
        min: appliedPriceRange.min,
        max: appliedPriceRange.max === Infinity ? undefined : appliedPriceRange.max,
      },
      context,
    };

    debouncedFetch(payload);
  }, [
    currentPage, 
    sortOrder,
    appliedFilters,
    appliedPriceRange,
    context,
    debouncedFetch,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    } else {
      params.delete("page");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (newQuery !== currentQuery) {
       router.replace(`${pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    }
  }, [currentPage, appliedFilters, appliedPriceRange, sortOrder]);


  const updatePageToOne = () => {
    setCurrentPage(1); 
  };
  
  const handleFilterChange = (group: string, value: any) => {
    updatePageToOne(); 

    setAppliedFilters((prev) => {
      if (group === "isOnSale") return { ...prev, isOnSale: value };
      if (group === "minRating") return { ...prev, minRating: value };

      const currentList: string[] = Array.isArray(prev[group]) ? prev[group] : [];
      const newList = currentList.includes(value)
        ? currentList.filter((v: string) => v !== value)
        : [...currentList, value];

      return { ...prev, [group]: newList };
    });
  };

  const handlePriceApply = (price: { min: string; max: string }) => {
    updatePageToOne();
    setAppliedPriceRange({
      min: Number(price.min) || 0,
      max: Number(price.max) || Infinity,
    });
  };

  const handleSortChange = (value: string) => {
      updatePageToOne();
      setSortOrder(value);
  }

  const handleClearFilters = () => {
    updatePageToOne();
    setAppliedFilters({
      brands: [],
      categories: [],
      isFeatured: false,
      isOnSale: false,
      minRating: undefined,
      availability: [],
    });
    setAppliedPriceRange({ min: 0, max: Infinity });
    setSortOrder("best-match");
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // 🔥 SECTION 1: BRANDS DEDUPLICATION
  // Ye server se aane walay brands ko ID se check karke unique banata hai
  const uniqueBrandsForSidebar = useMemo(() => {
    const rawBrands = (filterData?.brands?.filter(Boolean) as SanityBrand[]) || [];
    // Helper function use kiya taake 100% guarantee ho ke duplicate na ho
    return getUniqueItems(rawBrands, '_id');
  }, [filterData]);

  // 🔥 SECTION 2: ATTRIBUTES DEDUPLICATION & SECTION MERGING
  const uniqueAttributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};
    if (filterData?.attributes) {
      filterData.attributes.forEach(({ name, value }) => {
        if (!name || !value) return;
        
        // Agar Section (e.g., "Color") pehle se exist karta hai, to wahi use hoga. 
        // Duplicate section nahi banega.
        if (!attrs[name]) attrs[name] = new Set();
        
        // Set automatically duplicate Values (e.g., "Red", "Red") ko remove kar deta hai
        attrs[name].add(value);
      });
    }
    return Object.entries(attrs).map(([name, valuesSet]) => ({
      name,
      values: Array.from(valuesSet).sort(),
    }));
  }, [filterData]);

  const isDataStale = currentPage > 1 && products === initialProducts;
  const showSkeletons = isLoading || isDataStale;

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          brands={uniqueBrandsForSidebar}
          attributes={uniqueAttributes}
          priceRange={filterData.priceRange}
          
          // 🔥 FIX: Yahan hum Price Range ko 'appliedFilters' ke sath merge kar rahay hain
          // Taake jab Sidebar khule to usay pata ho ke Price Slider kahan set karna hai
          appliedFilters={{
            ...appliedFilters,
            minPrice: appliedPriceRange.min,
            // Agar Max Infinity hai (matlab user ne touch nahi kiya), to Global Max dikhao
            maxPrice: appliedPriceRange.max === Infinity 
              ? filterData.priceRange.max 
              : appliedPriceRange.max
          }}
          
          onFilterChange={handleFilterChange}
          onPriceApply={handlePriceApply}
          onClearFilters={handleClearFilters}
          categoryTree={categoryTree}
          dealCategories={dealCategories}
        />

        <main className="flex-1 w-full min-w-0">
          <ListingHeader
            productsCount={products.length}
            totalCount={totalProducts}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            onMobileFilterClick={() => setIsSidebarOpen(true)}
            appliedFilters={appliedFilters}
            onRemoveFilter={handleFilterChange} 
            onClearAll={handleClearFilters}
          />

          <div className="relative min-h-[50vh]">
            
            {showSkeletons ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="h-[350px]"> 
                            <ProductCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    {products.length > 0 ? (
                        <ProductGrid
                        products={products}
                        onQuickView={setQuickViewProduct}
                        />
                    ) : (
                        <div className="text-center py-20 px-6 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            No Products Found
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Try adjusting your filters or clearing them.
                            </p>
                        </div>
                    )}
                </div>
            )}

          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <PaginationControls 
                 key={currentPage} 
                 totalPages={totalPages} 
                 paramName="page" 
              />
            </div>
          )}
        </main>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </>
  );
}