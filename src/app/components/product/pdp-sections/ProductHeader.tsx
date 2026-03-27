// // /src/app/components/product/pdp-sections/ProductHeader.tsx

// "use client";

// import { useState } from 'react';
// import Link from 'next/link';
// import { Star, ChevronDown } from 'lucide-react';
// import SanityProduct, { ProductVariant } from '@/sanity/types/product_types';

// interface ProductHeaderProps {
//   product: SanityProduct;
//   selectedVariant: ProductVariant | null;
//   averageRating: number;
//   totalReviews: number;
//   isSelectionInStock: boolean;
// }

// export default function ProductHeader({
//   product,
//   selectedVariant,
//   averageRating,
//   totalReviews,
//   isSelectionInStock,
// }: ProductHeaderProps) {
//   const [isTitleExpanded, setIsTitleExpanded] = useState(false);

//   return (
//     <>
//       <div>
//         <h1
//           className={`text-2xl md:text-3xl font-bold text-text-primary dark:text-gray-100 transition-all duration-300 ${isTitleExpanded ? "" : "line-clamp-2"}`}
//         >
//           {product.title}
//         </h1>
//         {/* Show More/Less button only appears if title is long */}
//         {product.title.length > 80 && (
//           <button
//             onClick={() => setIsTitleExpanded(!isTitleExpanded)}
//             className="text-sm text-brand-primary font-semibold mt-1 flex items-center gap-1"
//           >
//             {isTitleExpanded ? "Show Less" : "Show More"}
//             <ChevronDown
//               className={`w-4 h-4 transition-transform ${isTitleExpanded ? "rotate-180" : ""}`}
//             />
//           </button>
//         )}
//       </div>

//       <div className="flex flex-wrap items-center gap-x-4 gap-y-2 my-4">
//         <div className="text-sm">
//           <span className="text-gray-500 dark:text-gray-400">Brand: </span>
//           {product.brand ? (
//             <Link
//               href={`/search?brand=${product.brand.slug}`}
//               className="font-semibold text-brand-primary hover:underline"
//             >
//               {product.brand.name}
//             </Link>
//           ) : (
//             <span className="font-semibold text-gray-700 dark:text-gray-300">
//               No Brand
//             </span>
//           )}
//         </div>
        
//         {/* Divider */}
//         <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
        
//         {/* Rating */}
//         {averageRating > 0 && (
//           <div className="flex items-center gap-1.5">
//             <Star size={16} className="text-yellow-400 fill-yellow-400" />
//             <span className="text-sm font-semibold text-text-primary dark:text-gray-200">
//               {averageRating.toFixed(1)}
//             </span>
//             <span className="text-sm text-text-secondary dark:text-gray-400">
//               ({totalReviews} reviews)
//             </span>
//           </div>
//         )}

//         {/* Stock Status Badge */}
//         {selectedVariant && (
//           <>
//             <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
//             <div
//               className={`text-xs font-bold uppercase px-3 py-1 rounded-full
//               ${
//                 isSelectionInStock
//                   ? "text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-500/20"
//                   : "text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-500/20"
//               }`}
//             >
//               {isSelectionInStock ? "In Stock" : "Out of Stock"}
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// }
// "use client";

// import { useState } from 'react';
// import Link from 'next/link';
// import { Star, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
// import SanityProduct, { ProductVariant } from '@/sanity/types/product_types';

// interface ProductHeaderProps {
//   product: SanityProduct;
//   selectedVariant: ProductVariant | null;
//   averageRating: number;
//   totalReviews: number;
//   isSelectionInStock: boolean;
// }

// export default function ProductHeader({
//   product,
//   selectedVariant,
//   averageRating,
//   totalReviews,
//   isSelectionInStock,
// }: ProductHeaderProps) {
//   const [isTitleExpanded, setIsTitleExpanded] = useState(false);

//   // Scroll to Reviews Logic
//   const scrollToReviews = () => {
//     const reviewsSection = document.getElementById('reviews');
//     if (reviewsSection) {
//         reviewsSection.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <>
//       <div className="mb-2">
//          {/* Brand as a small overline */}
//          {product.brand && (
//             <Link 
//                 href={`/search?brand=${product.brand.slug}`}
//                 className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-1 block hover:underline"
//             >
//                 {product.brand.name}
//             </Link>
//          )}

//         {/* Title */}
//         <h1
//           className={`text-2xl md:text-4xl font-clash font-bold text-gray-900 dark:text-white leading-tight transition-all duration-300 ${isTitleExpanded ? "" : "line-clamp-2"}`}
//         >
//           {product.title}
//         </h1>
        
//         {product.title.length > 80 && (
//           <button
//             onClick={() => setIsTitleExpanded(!isTitleExpanded)}
//             className="text-xs font-bold text-gray-500 hover:text-brand-primary mt-1 flex items-center gap-1 transition-colors"
//           >
//             {isTitleExpanded ? "Show Less" : "Read Full Title"}
//             <ChevronDown className={`w-3 h-3 transition-transform ${isTitleExpanded ? "rotate-180" : ""}`} />
//           </button>
//         )}
//       </div>

//       <div className="flex flex-wrap items-center gap-3 my-4">
        
//         {/* Rating Badge (Clickable) */}
//         {averageRating > 0 ? (
//           <button 
//             onClick={scrollToReviews}
//             className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-800 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
//           >
//             <Star size={14} className="text-yellow-500 fill-yellow-500" />
//             <span className="text-sm font-bold text-gray-900 dark:text-white">
//               {averageRating.toFixed(1)}
//             </span>
//             <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-1.5 ml-0.5">
//               {totalReviews} Reviews
//             </span>
//           </button>
//         ) : (
//             <span className="text-xs text-gray-400 font-medium">No Reviews Yet</span>
//         )}

//         {/* Stock Badge */}
//         {selectedVariant && (
//             <div
//               className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border
//               ${
//                 isSelectionInStock
//                   ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
//                   : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
//               }`}
//             >
//               {isSelectionInStock ? <CheckCircle size={12} /> : <XCircle size={12} />}
//               {isSelectionInStock ? "In Stock" : "Out of Stock"}
//             </div>
//         )}

//       </div>
//     </>
//   );
// }
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Star, ChevronDown, CheckCircle, XCircle, AlertTriangle, Hash } from 'lucide-react';
import SanityProduct, { ProductVariant } from '@/sanity/types/product_types';

interface ProductHeaderProps {
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
  averageRating: number;
  totalReviews: number;
  isSelectionInStock: boolean;
  lowStockThreshold: number; // ✅ NEW PROP
}

export default function ProductHeader({
  product,
  selectedVariant,
  averageRating,
  totalReviews,
  isSelectionInStock,
  lowStockThreshold, // ✅ NEW PROP
}: ProductHeaderProps) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  // Scroll to Reviews Logic
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Logic for Stock Urgency
  const stockCount = selectedVariant?.stock;
  const isLowStock = isSelectionInStock && stockCount !== undefined && stockCount > 0 && stockCount <= lowStockThreshold;

  return (
    <div className="flex flex-col gap-3 mb-6">
      
      {/* 1. TOP META ROW: Brand & SKU */}
      <div className="flex items-center justify-between">
         {product.brand && (
            <Link 
                href={`/search?brand=${product.brand.slug}`}
                className="text-xs font-bold text-brand-primary uppercase tracking-wider hover:underline hover:text-brand-primary-hover transition-colors"
            >
                {product.brand.name}
            </Link>
         )}
         
         {selectedVariant?.sku && (
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Hash size={10} />
                {selectedVariant.sku}
            </span>
         )}
      </div>

      {/* 2. TITLE SECTION */}
      <div>
        <h1
          className={`text-2xl md:text-3xl lg:text-4xl font-clash font-bold text-gray-900 dark:text-white leading-tight transition-all duration-300 ${isTitleExpanded ? "" : "line-clamp-2"}`}
          title={product.title}
        >
          {product.title}
        </h1>
        
        {product.title.length > 80 && (
          <button
            onClick={() => setIsTitleExpanded(!isTitleExpanded)}
            className="text-xs font-bold text-gray-500 hover:text-brand-primary mt-1.5 flex items-center gap-1 transition-colors"
          >
            {isTitleExpanded ? "Show Less" : "Read Full Title"}
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isTitleExpanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* 3. BADGES ROW (Ratings & Stock) */}
      <div className="flex flex-wrap items-center gap-3 mt-1">
        
        {/* Rating Badge */}
        {averageRating > 0 ? (
          <button 
            onClick={scrollToReviews}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/10 rounded-full border border-yellow-100 dark:border-yellow-800/50 transition-all hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <Star size={14} className="text-yellow-500 fill-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-yellow-200 dark:border-yellow-800 pl-2 ml-1 group-hover:text-gray-700 dark:group-hover:text-gray-300">
              {totalReviews} Reviews
            </span>
          </button>
        ) : (
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                <Star size={12} className="text-gray-300" /> No Reviews Yet
            </div>
        )}

        {/* Stock Badge (With Low Stock Logic) */}
        {selectedVariant && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm
              ${
                !isSelectionInStock
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  : isLowStock
                  ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 animate-pulse"
                  : "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              }`}
            >
              {/* Icon Logic */}
              {!isSelectionInStock ? (
                 <XCircle size={14} />
              ) : isLowStock ? (
                 <AlertTriangle size={14} />
              ) : (
                 <CheckCircle size={14} />
              )}

              {/* Text Logic */}
              <span>
                  {!isSelectionInStock 
                    ? "Out of Stock" 
                    : isLowStock 
                    ? `Hurry! Only ${stockCount} left` 
                    : "In Stock"
                  }
              </span>
            </div>
        )}
      </div>
    </div>
  );
}