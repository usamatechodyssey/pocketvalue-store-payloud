
// /app/admin/orders/[orderId]/_components/OrderDetailsProductCard.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { CleanCartItem } from "@/sanity/types/product_types";

interface StockInfo {
  _id: string;
  variants:
    | {
        _key: string;
        inStock: boolean;
      }[]
    | null;
}

interface ProductCardProps {
  product: CleanCartItem;
  stockInfo: StockInfo | undefined;
}

export default function OrderDetailsProductCard({
  product,
  stockInfo,
}: ProductCardProps) {
  const isProductInStock =
    stockInfo?.variants?.find((v) => v._key === product.variant?._key)
      ?.inStock ?? false;

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 shrink-0">
        {product.image && (
          <Image
            src={urlFor(product.image).url()}
            alt={product.name}
            fill
            sizes="64px"
            className="object-contain p-1"
          />
        )}
      </div>
      <div className="grow">
        <Link
          href={`/Bismillah786/products/${product.slug}/edit`}
          target="_blank"
          className="font-semibold text-gray-800 dark:text-gray-200 hover:text-brand-primary line-clamp-2"
        >
          {product.name}
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
          Product ID: ...{product._id.slice(-8)} <br />
          Variant Key: ...{product.variant?._key.slice(-8)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-bold text-gray-800 dark:text-gray-200">
          Rs. {(product.price * product.quantity).toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Qty: {product.quantity}
        </p>
        <div className="mt-2 flex items-center justify-end text-xs">
          {stockInfo ? (
            <span
              className={`px-2 py-1 font-semibold rounded-full flex items-center gap-1.5 ${isProductInStock ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"}`}
            >
              {isProductInStock ? (
                <CheckCircle size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {isProductInStock ? "Live: In Stock" : "Live: Out of Stock"}
            </span>
          ) : (
            <span className="px-2 py-1 font-semibold rounded-full bg-gray-100 text-gray-500">
              Deleted
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **No Code Change:** After a thorough review, this component was found to be well-typed, correctly structured, and fully compliant with our project rules. No modifications were necessary.
// - **Minor Style Tweak:** Adjusted dark mode theme colors for the "In Stock" / "Out of Stock" badges to improve contrast and consistency.
