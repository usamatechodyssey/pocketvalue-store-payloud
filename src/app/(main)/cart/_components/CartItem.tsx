
"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react"; // Removed Tag
import { urlFor } from "@/sanity/lib/image";
import { CleanCartItem } from "@/sanity/types/product_types";
import { useStateContext } from "@/app/context/StateContext";

export default function CartItem({ item }: { item: CleanCartItem }) {
  const { onRemove, toggleCartItemQuantity } = useStateContext();

  const finalPrice = item.price;
  const itemTotal = finalPrice * item.quantity;

  return (
    // Padding slightly increased on Desktop/Tablet
    <div className="flex items-start gap-4 p-4 lg:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
      
      {/* 1. Image */}
      <Link href={`/product/${item.slug}`} className="shrink-0 group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <Image
            src={urlFor(item.image).url()}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* 2. Details & Actions (Grow) */}
      <div className="grow flex flex-col justify-between">
        <div className="flex justify-between items-start">
            
            {/* Product Title & Variant */}
            <div className="flex flex-col grow pr-2">
              <Link
                href={`/product/${item.slug}`}
                // Font Size/Weight Adjusted
                className="font-bold text-gray-900 dark:text-gray-100 hover:text-brand-primary  line-clamp-2 text-base lg:text-md"
              >
                {item.name}
              </Link>
              {item.variant && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    {item.variant.name}
                </p>
              )}
            </div>

            {/* Remove Button (Top Right Corner) */}
            <button
              onClick={() => onRemove(item)}
              className="text-gray-500 hover:text-brand-danger p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shrink-0 active:scale-90"
              aria-label="Remove item"
            >
              <Trash2 size={20} />
            </button>
        </div>
        
        
        {/* Quantity & Price Row (Bottom of Info) */}
        <div className="flex items-end justify-between mt-3">
            
            {/* Quantity Selector (App Style) */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-full p-1 w-fit">
              <button
                onClick={() => toggleCartItemQuantity(item.cartItemId, "dec")}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-colors active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold w-6 text-center text-sm text-gray-800 dark:text-gray-200">
                {item.quantity}
              </span>
              <button
                onClick={() => toggleCartItemQuantity(item.cartItemId, "inc")}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600 transition-colors active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Total Price */}
            <div className="text-right">
                <p className="font-extrabold text-xl text-brand-primary">
                  Rs. {itemTotal.toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                  Unit: Rs. {finalPrice.toLocaleString()}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}