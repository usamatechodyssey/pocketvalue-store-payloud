// /app/admin/products/_components/ProductsTable.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { ChevronDown, ChevronRight } from "lucide-react";
import DeleteProductButton from "./DeleteProductButton";
import CopyButton from "../../_components/CopyButton";

// --- BUG FIX IS HERE: Add 'export' keyword ---
export interface Variant {
  _key: string;
  name: string;
  sku?: string;
  price?: number;
  inStock: boolean;
  stock?: number;
}
export interface AdminProductListItem {
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

interface ProductsTableProps {
  products: AdminProductListItem[];
}

const formatPrice = (price?: number) =>
  price != null ? `Rs. ${price.toLocaleString()}` : "N/A";

export default function ProductsTable({ products }: ProductsTableProps) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) =>
    setExpandedRowId(expandedRowId === id ? null : id);

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th className="w-12 px-4 py-3"></th>
            <th className="w-20 px-6 py-3 text-left font-semibold uppercase text-gray-500 dark:text-gray-400">
              Image
            </th>
            <th className="px-6 py-3 text-left font-semibold uppercase text-gray-500 dark:text-gray-400">
              Product Name & ID
            </th>
            <th className="w-40 px-6 py-3 text-left font-semibold uppercase text-gray-500 dark:text-gray-400">
              Price
            </th>
            <th className="w-40 px-6 py-3 text-left font-semibold uppercase text-gray-500 dark:text-gray-400">
              Stock / Variants
            </th>
            <th className="w-28 px-6 py-3 text-right font-semibold uppercase text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => {
            const isExpanded = expandedRowId === product._id;
            return (
              <React.Fragment key={product._id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleRow(product._id)}
                      disabled={product.variantsCount <= 1}
                      className="p-1 disabled:opacity-25 disabled:cursor-default"
                    >
                      {product.variantsCount > 1 &&
                        (isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        ))}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-900 rounded-md p-1">
                      {product.mainImage ? (
                        <Image
                          src={urlFor(product.mainImage).url()}
                          alt={product.title}
                          fill
                          sizes="48px"
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-xs text-gray-400 flex h-full items-center justify-center">
                          No Img
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {product.title}
                    </div>
                    <div className="text-xs mt-1 flex items-center">
                      ID:{" "}
                      <span className="font-mono ml-1">
                        ...{product._id.slice(-8)}
                      </span>
                      <CopyButton textToCopy={product._id} />
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top font-semibold">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 align-top">
                    {product.variantsCount > 1 ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {product.variantsCount} Variants
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${product.inStock ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"}`}
                      >
                        {product.inStock
                          ? `${product.variants[0]?.stock || 0} in stock`
                          : "Out of Stock"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <div className="flex items-center justify-end space-x-4">
                      <Link
                        href={`/Bismillah786/products/${product.slug}/edit`}
                        className="font-medium text-brand-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteProductButton
                        productId={product._id}
                        productTitle={product.title}
                      />
                    </div>
                  </td>
                </tr>
                {isExpanded && product.variants && (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <div className="bg-gray-100 dark:bg-gray-900 p-4 m-2 md:mx-4 rounded-lg border dark:border-gray-700">
                        <h4 className="font-bold mb-2 text-sm">Variants:</h4>
                        <table className="w-full text-xs">
                          <thead className="bg-gray-200 dark:bg-gray-800">
                            <tr>
                              <th className="p-2 text-left font-medium">
                                Name
                              </th>
                              <th className="p-2 text-left font-medium">SKU</th>
                              <th className="p-2 text-left font-medium">
                                Price
                              </th>
                              <th className="p-2 text-left font-medium">
                                Stock
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((variant) => (
                              <tr
                                key={variant._key}
                                className="border-b dark:border-gray-700 last:border-0"
                              >
                                <td className="p-2">{variant.name}</td>
                                <td className="p-2 font-mono">
                                  {variant.sku || "N/A"}
                                </td>
                                <td className="p-2">
                                  {formatPrice(variant.price)}
                                </td>
                                <td className="p-2">
                                  <span
                                    className={`font-semibold ${variant.inStock ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                                  >
                                    {variant.stock !== undefined
                                      ? `${variant.stock} units`
                                      : variant.inStock
                                        ? "In Stock"
                                        : "Out"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - Created a new, dedicated `ProductsTable.tsx` component.
// - Moved all JSX and logic for rendering the desktop `<table>` view into this file.
// - The component is now a self-contained, presentational component that accepts a `products` array and handles its own internal state for expanding rows.
