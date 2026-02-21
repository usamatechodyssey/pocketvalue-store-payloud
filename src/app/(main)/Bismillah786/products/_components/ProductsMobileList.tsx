// /app/admin/products/_components/ProductsMobileList.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import CopyButton from "../../_components/CopyButton";

// Type Definitions
interface Variant {
  _key: string;
  name: string;
  sku?: string;
  price?: number;
  inStock: boolean;
  stock?: number;
}
interface AdminProductListItem {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  stock?: number;
  inStock?: boolean;
  mainImage?: any;
  variantsCount: number;
  variants: Variant[];
}

interface ProductsMobileListProps {
  products: AdminProductListItem[];
}

const formatPrice = (price?: number) =>
  price != null ? `Rs. ${price.toLocaleString()}` : "N/A";

export default function ProductsMobileList({
  products,
}: ProductsMobileListProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) =>
    setExpandedRowId(expandedRowId === id ? null : id);

  return (
    <div className="lg:hidden space-y-4">
      {products.map((product) => {
        const isExpanded = expandedRowId === product._id;
        return (
          <div
            key={product._id}
            className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600"
          >
            <div className="flex gap-4 items-center">
              <div className="relative h-16 w-16 shrink-0 bg-white dark:bg-gray-800 rounded-md p-1">
                {product.mainImage ? (
                  <Image
                    src={urlFor(product.mainImage).url()}
                    alt={product.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 flex h-full items-center justify-center">
                    No Img
                  </span>
                )}
              </div>
              <div className="grow">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {product.title}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                  ID:{" "}
                  <span className="font-mono ml-1">
                    ...{product._id.slice(-8)}
                  </span>
                  <CopyButton textToCopy={product._id} />
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="font-semibold">{formatPrice(product.price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stock</p>
                {product.variantsCount > 1 ? (
                  <span className="font-semibold">
                    {product.variantsCount} Variants
                  </span>
                ) : (
                  <span
                    className={`font-semibold ${product.inStock ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 border-t dark:border-gray-600 pt-3 flex justify-between items-center">
              <button
                onClick={() => toggleRow(product._id)}
                disabled={product.variantsCount <= 1}
                className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                {product.variantsCount > 1 &&
                  (isExpanded ? "Hide Variants" : "Show Variants")}
                {product.variantsCount > 1 &&
                  (isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  ))}
              </button>
              <div className="flex items-center gap-2">
                <Link
                  href={`/Bismillah786/products/${product.slug}/edit`}
                  className="text-sm font-medium text-brand-primary hover:underline"
                >
                  Edit
                </Link>
                <DeleteProductButton
                  productId={product._id}
                  productTitle={product.title}
                />
              </div>
            </div>
            {isExpanded && product.variants && (
              <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-md text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="pb-1 text-left font-semibold">Variant</th>
                      <th className="pb-1 text-right font-semibold">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr key={v._key}>
                        <td className="py-1">{v.name}</td>
                        <td
                          className={`py-1 text-right font-mono ${v.inStock ? "text-green-600" : "text-red-600"}`}
                        >
                          {v.stock !== undefined
                            ? `${v.stock}`
                            : v.inStock
                              ? "In"
                              : "Out"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - Created a new, dedicated `ProductsMobileList.tsx` component.
// - Moved all JSX and logic for rendering the mobile card view into this file.
// - Like the table component, it is now a self-contained, presentational component that accepts a `products` array and handles its own internal state for expanding cards.
