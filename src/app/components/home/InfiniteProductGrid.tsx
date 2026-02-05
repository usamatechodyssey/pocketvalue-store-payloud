// "use client";

// import { useState, useCallback } from "react";
// import SanityProduct from "@/sanity/types/product_types";
// import { getPaginatedProducts } from "@/sanity/lib/queries";
// import ProductCard from "@/app/components/product/ProductCard";
// import QuickViewModal from "@/app/components/product/QuickViewModal";
// import { BeatLoader } from "react-spinners";
// import { FiPlus } from "react-icons/fi";

// const BATCH_SIZE = 40;

// export default function InfiniteProductGrid({
//   initialProducts,
// }: {
//   initialProducts: SanityProduct[];
// }) {
//   const [products, setProducts] = useState<SanityProduct[]>(
//     initialProducts || []
//   );
//   const [page, setPage] = useState(2);
//   const [hasMore, setHasMore] = useState(
//     (initialProducts?.length || 0) >= BATCH_SIZE
//   );

//   const [isLoading, setIsLoading] = useState(false);
//   const [quickViewProduct, setQuickViewProduct] =
//     useState<SanityProduct | null>(null);

//   const loadMoreProducts = useCallback(async () => {
//     if (isLoading || !hasMore) return;
//     setIsLoading(true);

//     try {
//       // API call to fetch next batch
//       const newProducts = await getPaginatedProducts(page, BATCH_SIZE);

//       if (newProducts.length > 0) {
//         setProducts((prev) => [...prev, ...newProducts]);
//         setPage((prev) => prev + 1);
//         // Check if we reached the end
//         if (newProducts.length < BATCH_SIZE) {
//           setHasMore(false);
//         }
//       } else {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Failed to load more products", error);
//       setHasMore(false);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [page, isLoading, hasMore]);

//   const handleQuickView = (product: SanityProduct) =>
//     setQuickViewProduct(product);
//   const handleCloseModal = () => setQuickViewProduct(null);

//   if (!initialProducts || initialProducts.length === 0) return null;

//   return (
//     <>
//       <section className="w-full py-12 md:py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
//         <div className="max-w-[1920px] mx-auto">

//           {/* Header */}
//           <div className="flex flex-col items-center text-center mb-10 md:mb-12">
//             <h2 className="text-2xl md:text-4xl font-sans font-bold text-gray-900 dark:text-white uppercase tracking-tight">
//               Just For You
//             </h2>
//             <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
//           </div>

//           {/* Product Grid - Optimized for Mobile & Desktop */}
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
//             {products.map((product) => (
//               <div key={product._id} className="h-full w-full">
//                 <ProductCard
//                   product={product}
//                   onQuickView={handleQuickView}
//                   className="h-full"
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Load More Button Area */}
//           <div className="mt-14 flex justify-center">
//             {isLoading ? (
//               <div className="py-2">
//                 <BeatLoader color="#e11d48" size={12} /> {/* Using Brand Color */}
//               </div>
//             ) : hasMore ? (
//               <button
//                 onClick={loadMoreProducts}
//                 className="group relative inline-flex items-center gap-2 px-10 py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest rounded-full border border-gray-200 dark:border-gray-800 hover:border-brand-primary dark:hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 shadow-sm hover:shadow-md"
//               >
//                 <FiPlus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
//                 <span>Load More</span>
//               </button>
//             ) : (
//               <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
//                 <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
//                 <p className="text-sm font-medium uppercase tracking-wide">You&apos;ve reached the end</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       <QuickViewModal
//         product={quickViewProduct}
//         isOpen={!!quickViewProduct}
//         onClose={handleCloseModal}
//       />
//     </>
//   );
// }
"use client";

import { useState, useCallback } from "react";
import SanityProduct from "@/sanity/types/product_types";
import { getPaginatedProducts } from "@/sanity/lib/queries";
import ProductCard from "@/app/components/product/ProductCard";
import QuickViewModal from "@/app/components/product/QuickViewModal";
import { FiPlus } from "react-icons/fi";
// ✅ Import Skeleton
import ProductCardSkeleton from "@/app/components/product/ProductCardSkeleton";

const BATCH_SIZE = 40;

export default function InfiniteProductGrid({
  initialProducts,
}: {
  initialProducts: SanityProduct[];
}) {
  const [products, setProducts] = useState<SanityProduct[]>(
    initialProducts || [],
  );
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(
    (initialProducts?.length || 0) >= BATCH_SIZE,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<SanityProduct | null>(null);

  const loadMoreProducts = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      // API call to fetch next batch
      const newProducts = await getPaginatedProducts(page, BATCH_SIZE);

      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);

        // Check if we reached the end
        if (newProducts.length < BATCH_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more products", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  const handleQuickView = (product: SanityProduct) =>
    setQuickViewProduct(product);
  const handleCloseModal = () => setQuickViewProduct(null);

  if (!initialProducts || initialProducts.length === 0) return null;

  return (
    <>
      <section className="w-full py-12 md:py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-[1920px] mx-auto px-2 md:px-0">
          {" "}
          {/* Added padding for better mobile view */}
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-sans font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              Just For You
            </h2>
            <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
          </div>
          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {/* 1. Real Products */}
            {products.map((product) => (
              <div key={product._id} className="h-full w-full">
                <ProductCard
                  product={product}
                  onQuickView={handleQuickView}
                  className="h-full"
                />
              </div>
            ))}

            {/* 2. Loading Skeletons (Appended to Grid) */}
            {isLoading &&
              Array.from({ length: 12 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-full w-full">
                  <ProductCardSkeleton />
                </div>
              ))}
          </div>
          {/* Load More Button Area */}
          <div className="mt-14 flex justify-center">
            {/* Loading ke waqt button hide ho jayega kyunke skeletons dikh rahe hain */}
            {!isLoading && hasMore && (
              <button
                onClick={loadMoreProducts}
                className="group relative inline-flex items-center gap-2 px-10 py-3.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest rounded-full border border-gray-200 dark:border-gray-800 hover:border-brand-primary dark:hover:border-brand-primary hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
              >
                <FiPlus
                  size={18}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                <span>Load More</span>
              </button>
            )}

            {/* End Message */}
            {!hasMore && (
              <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500 animate-in fade-in zoom-in duration-500">
                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                <p className="text-sm font-medium uppercase tracking-wide">
                  You&apos;ve reached the end
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={handleCloseModal}
      />
    </>
  );
}
