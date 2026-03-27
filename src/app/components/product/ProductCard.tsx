"use client";

import Link from "next/link";
import Image from "next/image";
// ✅ IMPORT FiTrash2
import {
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiEye,
  FiTrash2,
} from "react-icons/fi";
import { useStateContext } from "@/app/context/StateContext";
import SanityProduct, { ProductVariant } from "@/sanity/types/product_types";
import { urlFor } from "@/sanity/lib/image";
import { useRef, useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { Swiper as SwiperType } from "swiper";


interface ProductCardProps {
  product: SanityProduct;
  onQuickView?: (product: SanityProduct) => void;
  className?: string;
  // ✅ Props for Wishlist Logic
  isWishlistPage?: boolean;
  onRemoveFromWishlist?: () => void;
}

export default function ProductCard({
  product,
  onQuickView,
  className = "",
  isWishlistPage = false,
  onRemoveFromWishlist,
}: ProductCardProps) {
  const { onAdd, handleAddToWishlist } = useStateContext();
  const defaultVariant: ProductVariant | undefined = product.defaultVariant;

  const swiperRef = useRef<SwiperType | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!defaultVariant) return null;

  const handleActionClick = (action: () => void) => {
    action();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDesktop && swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isDesktop && swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
      swiperRef.current.slideTo(0);
    }
  };

  // ... (Price Logic Same) ...
  const originalPrice = defaultVariant.price;
  const salePrice = defaultVariant.salePrice;
  const displayPrice = salePrice ?? originalPrice;
  const isOnSale = salePrice && salePrice < originalPrice;
  const discount = isOnSale
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;
  const isAvailable =
    defaultVariant.stock !== undefined
      ? defaultVariant.stock > 0
      : defaultVariant.inStock;

  const images =
    defaultVariant.images && defaultVariant.images.length > 0
      ? defaultVariant.images
      : [{ _key: "placeholder", asset: { _ref: "/placeholder.png" } }];
  const hasMultipleImages = images.length > 1;
  const imageSizes =
    "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw";

  return (
    <div
      className={`h-full group relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #ccc;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background-color: #ff8f32 !important;
          width: 12px;
          border-radius: 4px;
        }
      `}</style>

      {/* === TOP SECTION === */}
      <div className="relative w-full aspect-4/5 overflow-hidden bg-gray-50 dark:bg-gray-800 z-0">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full"
          aria-label={`View product ${product.title}`}
        >
          {hasMultipleImages ? (
            <Swiper
              modules={[Autoplay, Pagination, EffectFade]}
              spaceBetween={0}
              slidesPerView={1}
              loop={true}
              effect="fade"
              allowTouchMove={!isDesktop}
              autoplay={{ delay: 1000, disableOnInteraction: false }}
              pagination={{ clickable: true, dynamicBullets: true }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                swiper.autoplay.stop();
              }}
              className="w-full h-full"
            >
              {images.map((image: any, index) => (
                <SwiperSlide key={image._key || index}>
                  <Image
                    src={
                      image.asset?._ref === "/placeholder.png"
                        ? "/placeholder.png"
                        : urlFor(image).width(600).height(750).url()
                    }
                    alt={`${product.title} - Image ${index + 1}`}
                    fill
                    sizes={imageSizes}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={
                  images[0].asset?._ref === "/placeholder.png"
                    ? "/placeholder.png"
                    : urlFor(images[0]).width(600).height(750).url()
                }
                alt={product.title}
                fill
                sizes={imageSizes}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          )}
        </Link>

        {/* BADGES */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20 pointer-events-none">
          {isOnSale && (
            <span className="bg-brand-danger text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
              - {discount}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
              New
            </span>
          )}
        </div>

        {/* === ACTION BUTTONS (Updated Logic Here) === */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-20 lg:translate-x-12 lg:group-hover:translate-x-0 transition-transform duration-300 transform-gpu">
          {onQuickView && (
            <button
              type="button"
              onClick={() => handleActionClick(() => onQuickView(product))}
              className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-brand-primary border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all rounded-full lg:rounded-none cursor-pointer"
            >
              <FiEye size={18} />
            </button>
          )}

          {/* ✅ DYNAMIC WISHLIST BUTTON */}
          <button
            type="button"
            onClick={() => {
              // Agar Wishlist page par hain, to Parent ka function call karo (Optimistic Remove)
              // Agar Normal page par hain, to Context ka function call karo (Add/Remove)
              if (isWishlistPage && onRemoveFromWishlist) {
                handleActionClick(onRemoveFromWishlist);
              } else {
                handleActionClick(() => handleAddToWishlist(product));
              }
            }}
            aria-label={
              isWishlistPage ? "Remove from wishlist" : "Add to wishlist"
            }
            className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-500 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all rounded-full lg:rounded-none cursor-pointer"
          >
            {/* ✅ ICON SWAP: Wishlist page hai to TRASH, warna HEART */}
            {isWishlistPage ? <FiTrash2 size={18} /> : <FiHeart size={18} />}
          </button>
        </div>

        {/* ADD TO CART BUTTONS (Same as before) */}
        <button
          type="button"
          onClick={() =>
            isAvailable &&
            handleActionClick(() => onAdd(product, defaultVariant, 1))
          }
          disabled={!isAvailable}
          className={`lg:hidden absolute bottom-3 right-3 p-3 rounded-full shadow-lg z-30 transition-transform active:scale-90 cursor-pointer ${isAvailable ? "bg-brand-primary text-white" : "bg-gray-400 cursor-not-allowed"}`}
        >
          <FiShoppingCart size={20} />
        </button>
        <button
          type="button"
          onClick={() =>
            isAvailable &&
            handleActionClick(() => onAdd(product, defaultVariant, 1))
          }
          disabled={!isAvailable}
          className={`hidden lg:flex absolute bottom-0 left-0 w-full py-3 items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white z-20 transition-transform duration-300 transform-gpu will-change-transform translate-y-full group-hover:translate-y-0 cursor-pointer ${isAvailable ? "bg-brand-primary hover:bg-brand-primary-hover" : "bg-gray-500 cursor-not-allowed"}`}
        >
          <FiShoppingCart size={16} />
          {isAvailable ? "Add to Cart" : "Sold Out"}
        </button>
      </div>

      {/* === BOTTOM SECTION === */}
      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col grow p-4 gap-1 relative z-10 bg-white dark:bg-gray-900"
      >
        <div className="flex items-center gap-1 mb-1">
          {product.rating ? (
            <>
              <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-gray-500 font-medium">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-400">
                ({product.reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">No reviews</span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors min-h-10">
          {product.title}
        </h3>
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand-primary">{`Rs. ${displayPrice.toLocaleString()}`}</span>
          {isOnSale && (
            <span className="text-xs text-gray-400 line-through decoration-gray-400">{`Rs. ${originalPrice.toLocaleString()}`}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
