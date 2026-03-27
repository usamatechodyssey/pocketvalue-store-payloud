// src/app/actions/wishlistActions.ts
"use server"; // 🔥 Ye line Client Components ke liye Server ka darwaza kholti hai

// Ab yahan hum Payload wali file se function import karenge jo safely server par chalega
import { getPayloadLiveProductDataForCards } from "@/sanity/lib/payload/product.queries";
import SanityProduct from "@/sanity/types/product_types";

export async function fetchWishlistProductsAction(productIds: string[]): Promise<SanityProduct[]> {
  try {
    if (!productIds || productIds.length === 0) return[];
    
    // Server function call kar raha hai Payload ko (100% Safe)
    const products = await getPayloadLiveProductDataForCards(productIds);
    return products;
  } catch (error) {
    console.error("Failed to fetch wishlist products:", error);
    return[];
  }
}