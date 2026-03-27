
"use client";

import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
import { toastError } from "@/app/_components/shared/CustomToasts";
import { useStateContext } from "@/app/context/StateContext";
import SanityProduct, { ProductVariant } from "@/sanity/types/product_types";
import QuantitySelector from "../../ui/QuantitySelector"; // Verify this import path
import { ShoppingCart, Heart, Zap, ChevronsUp } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import ProductActionSheet from "./ProductActionSheet"; // Verify this import path

interface ProductActionsProps {
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
  isSelectionInStock: boolean;
}

export default function ProductActions({
  product,
  selectedVariant,
  isSelectionInStock,
}: ProductActionsProps) {
  const { onAdd, buyNow, handleAddToWishlist } = useStateContext();
  
  const [quantity, setQuantity] = useState(1); 
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // 🔥 FIX 1: Max Stock Limit calculation. 
  // Agar selectedVariant.stock null/undefined hai, to Infinity (ya aik bara number) de den.
  const maxQuantity = selectedVariant?.stock != null ? selectedVariant.stock : (isSelectionInStock ? 9999 : 0);


  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
        if (typeof window !== 'undefined' && window.scrollY > 400) {
            setShowStickyBar(true);
        } else {
            setShowStickyBar(false);
            setIsSheetOpen(false);
        }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener("scroll", handleScroll);
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener("scroll", handleScroll);
        }
    };
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariant) return toastError("Please select options.");
    if (!isSelectionInStock) return toastError("Out of stock.");
    if (quantity > maxQuantity) return toastError(`Only ${maxQuantity} in stock.`); // ✅ Final check
    onAdd(product, selectedVariant, quantity);
    setIsSheetOpen(false);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return toastError("Please select options.");
    if (!isSelectionInStock) return toastError("Out of stock.");
    if (quantity > maxQuantity) return toastError(`Only ${maxQuantity} in stock.`); // ✅ Final check
    buyNow(product, selectedVariant, quantity);
    setIsSheetOpen(false);
  };

  const effectivePrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? 0;

  return (
    <>
      {/* === 1. DESKTOP/MAIN ACTIONS (Standard View) === */}
      <div className="flex flex-col gap-6 mt-8 pb-4 border-b border-gray-100 dark:border-gray-800 md:border-none">
        
        {/* Quantity & Wishlist Row */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</span>
             {/* 🔥 FIX 2: QuantitySelector ko max prop do */}
             <QuantitySelector 
                quantity={quantity} 
                onQuantityChange={setQuantity} 
                max={maxQuantity} // ✅ Max limit pass ki
             />
          </div>

          <button
            onClick={() => handleAddToWishlist(product)}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-full text-gray-600 dark:text-gray-300 hover:text-brand-danger hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 transition-all font-medium text-sm"
          >
            <Heart size={20} />
            <span>Add to Wishlist</span>
          </button>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleAddToCart}
            disabled={!isSelectionInStock || quantity > maxQuantity} // ✅ Disable agar quantity stock se zyada ho
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <ShoppingCart size={20} /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!isSelectionInStock || quantity > maxQuantity} // ✅ Disable agar quantity stock se zyada ho
            className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary-hover transition-all shadow-lg shadow-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={20} fill="currentColor" /> Buy Now
          </button>
        </div>
      </div>

      {/* === 2. MOBILE STICKY BUTTON === */}
      <AnimatePresence>
        {showStickyBar && (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-14.5 left-0 right-0 p-4 z-40 md:hidden pointer-events-none"
            >
                <button
                    onClick={() => setIsSheetOpen(true)}
                    className="w-full pointer-events-auto flex items-center justify-between px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-[0_8px_20px_rgba(255,143,50,0.4)] active:scale-[0.98] transition-all duration-200"
                >
                    <span className="flex items-center gap-2 text-lg font-clash">
                        <ChevronsUp size={20} className="animate-bounce" />
                        Add to Cart
                    </span>
                    <span className="text-xl font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                        Rs. {effectivePrice.toLocaleString()}
                    </span>
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* === 3. THE ACTION SHEET === */}
      <ProductActionSheet 
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        setQuantity={setQuantity}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isSelectionInStock={isSelectionInStock}
        maxQuantity={maxQuantity} // ✅ maxQuantity pass ki
      />
    </>
  );
}