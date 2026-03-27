
"use server";

import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { AdminProductListItem } from '@/app/components/payload-products/ProductsTable';
import { verifyStaff } from "@/lib/payloadAuth"; // ✅ Naya Universal Guard

export async function getPaginatedAdminProductsPayload({ 
  page = 1, 
  limit = 15, 
  searchTerm = '' 
}) {
  try {
    // 🛡️ SECURITY LOCK: Koi bhi staff member (Admin, Manager, Editor) Product Explorer use kar sakta hai
    await verifyStaff(['admin', 'manager', 'editor']);

    const payload = await getPayload({ config: configPromise });

    // Payload query: ID, Title, SKU ya Variant ID se search karein
    const whereClause: any = searchTerm ? {
      or: [
        { id: { equals: searchTerm } }, 
        { title: { contains: searchTerm } },
        { slug: { contains: searchTerm } },
        { 'variants.sku': { contains: searchTerm } },
        { 'variants.id': { contains: searchTerm } }, 
      ]
    } : {};

    const result = await payload.find({
      collection: 'products',
      where: whereClause,
      page,
      limit,
      depth: 1, 
      sort: '-createdAt'
    });

    // Data ko AdminProductListItem format mein map karein for UI compatibility
    const products: AdminProductListItem[] = result.docs.map((doc: any) => {
      const prices = doc.variants?.map((v: any) => v.price) || [0];
      const minPrice = Math.min(...prices);
      
      return {
        _id: doc.id,
        title: doc.title,
        slug: doc.slug,
        price: minPrice,
        stock: doc.variants?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0),
        inStock: doc.variants?.some((v: any) => v.inStock),
        mainImage: doc.variants?.[0]?.images?.[0] || null,
        variantsCount: doc.variants?.length || 0,
        variants: doc.variants?.map((v: any) => ({
          _key: v.id, 
          name: v.name,
          sku: v.sku,
          price: v.price,
          inStock: v.inStock,
          stock: v.stock
        }))
      };
    });

    return {
      products,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs
    };

  } catch (error: any) {
    console.error("Payload Product Admin Actions Error:", error.message);
    return { products: [], totalPages: 0, totalDocs: 0 };
  }
}