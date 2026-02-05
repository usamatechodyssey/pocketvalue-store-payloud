// // // /app/Bismillah786/products/_actions/productActions.ts (ABSOLUTE FINAL & FUTURE-PROOF)

// // "use server";

// // import { revalidatePath } from "next/cache";
// // import { auth } from "@/app/auth";
// // import { client, writeClient } from "@/sanity/lib/client";
// // import {
// //   GET_PAGINATED_ADMIN_PRODUCTS_QUERY,
// //   GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY,
// //   GET_FORM_DATA_QUERY,
// //   GET_SINGLE_PRODUCT_FOR_EDIT_QUERY,
// // } from "@/sanity/lib/queries";
// // import { z } from "zod";
// // import { ProductPayloadSchema, DeleteProductSchema, ProductGroupSchema } from "@/app/lib/zodSchemas";
// // import { VariantAttribute } from "@/sanity/types/product_types";

// // type ProductPayload = z.infer<typeof ProductPayloadSchema>;

// // // --- Helper Functions ---

// // async function verifyAdmin(allowedRoles: string[]): Promise<string> {
// //     const session = await auth();
// //     const userRole = session?.user?.role;
// //     if (!userRole || !allowedRoles.includes(userRole)) {
// //         throw new Error("Permission Denied.");
// //     }
// //     return userRole;
// // }

// // function convertTiptapJsonToPortableText(tiptapJson: any) {
// //     if (!tiptapJson || !tiptapJson.content) return [];
    
// //     const convertNode = (node: any, index: number): any => {
// //         const key = `node_${Date.now()}_${index}_${Math.random()}`;
        
// //         switch (node.type) {
// //             case 'paragraph':
// //                 return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.map((child: any, childIndex: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${childIndex}`, marks: child.marks ? child.marks.map((mark: any) => mark.type) : [] })) : [] };
// //             case 'heading':
// //                 return { _type: 'block', style: `h${node.attrs.level}`, _key: key, children: node.content ? node.content.map((child: any, childIndex: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${childIndex}` })) : [] };
// //             case 'bulletList':
// //                 return { _type: 'block', _key: key, listItem: 'bullet', level: 1, children: node.content ? node.content.flatMap((listItem: any, liIndex: number) => convertNode(listItem, liIndex)?.children || []) : [] };
// //             case 'orderedList':
// //                  return { _type: 'block', _key: key, listItem: 'number', level: 1, children: node.content ? node.content.flatMap((listItem: any, liIndex: number) => convertNode(listItem, liIndex)?.children || []) : [] };
// //             case 'listItem':
// //                 return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.flatMap((pNode:any, pIndex:number) => convertNode(pNode, pIndex)?.children || []) : [] };
// //             default:
// //                 return null;
// //         }
// //     }
// //     return tiptapJson.content.map(convertNode).filter(Boolean);
// // }

// // function parseAttributesString(attrString?: string): VariantAttribute[] {
// //     if (!attrString || typeof attrString !== 'string') return [];
// //     return attrString.split(',')
// //         .map(pair => {
// //             const parts = pair.split(':');
// //             if (parts.length !== 2) return null;
// //             const name = parts[0].trim();
// //             const value = parts[1].trim();
// //             if (!name || !value) return null;
// //             return { _key: `attr_${Date.now()}_${Math.random()}`, name, value };
// //         })
// //         .filter((item): item is VariantAttribute => item !== null);
// // }


// // // === ACTION #1: GET PAGINATED ADMIN PRODUCTS (REFACTORED) ===
// // export async function getPaginatedAdminProducts({ page = 1, limit = 15, searchTerm = '' }) {
// //     try {
// //         const start = (page - 1) * limit;
// //         const end = start + limit;
        
// //         const params = { 
// //             searchTerm: searchTerm ? `*${searchTerm.trim()}*` : '*',
// //             exactSearchTerm: searchTerm.trim(),
// //             start, 
// //             end 
// //         };

// //         // For the count query, if there's no search term, we match all products.
// //         const countParams = {
// //             searchTerm: params.searchTerm,
// //             exactSearchTerm: params.exactSearchTerm
// //         };
        
// //         const [products, totalCount] = await Promise.all([
// //             client.fetch(GET_PAGINATED_ADMIN_PRODUCTS_QUERY, params),
// //             client.fetch(GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY, countParams)
// //         ]);

// //         return {
// //             products,
// //             totalPages: Math.ceil(totalCount / limit)
// //         };
// //     } catch (error) {
// //         console.error("Failed to fetch paginated admin products:", error);
// //         return { products: [], totalPages: 0 };
// //     }
// // }

// // // === ACTION #2: GET FORM DATA (REFACTORED) ===
// // export async function getFormData() {
// //     try {
// //         return await client.fetch(GET_FORM_DATA_QUERY);
// //     } catch (error) {
// //         console.error("Failed to fetch form data (categories/brands):", error);
// //         return { categories: [], brands: [] };
// //     }
// // }

// // // === ACTION #3: GET SINGLE PRODUCT FOR EDIT (REFACTORED) ===
// // export async function getSingleProductForEdit(slug: string) {
// //     try {
// //         return await client.fetch(GET_SINGLE_PRODUCT_FOR_EDIT_QUERY, { slug });
// //     } catch (error) {
// //         console.error(`Failed to fetch product with slug "${slug}":`, error);
// //         return null;
// //     }
// // }

// // // === ACTION #4: CREATE A NEW PRODUCT (Refactored with Zod) ===
// // export async function createProduct(productData: ProductPayload) {
// //   const validation = ProductPayloadSchema.safeParse(productData);
// //   if (!validation.success) {
// //       return { success: false, message: validation.error.issues[0].message };
// //   }
// //   const data = validation.data;

// //   try {
// //     await verifyAdmin(['Super Admin', 'Content Editor']);
// //     const portableTextDescription = convertTiptapJsonToPortableText(data.description);
    
// //     const newProduct = {
// //       _type: 'product',
// //       title: data.title,
// //       slug: { _type: 'slug', current: data.slug },
// //       videoUrl: data.videoUrl || undefined,
// //       description: portableTextDescription,
// //       brand: data.brandId ? { _type: 'reference', _ref: data.brandId } : undefined,
// //       isBestSeller: data.isBestSeller,
// //       isNewArrival: data.isNewArrival,
// //       isFeatured: data.isFeatured,
// //       isOnDeal: data.isOnDeal,
// //       rating: data.rating,
// //       categories: (data.categoryIds || []).map((catId: string) => ({ _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: catId })),
// //       variants: data.variants,
// //     };

// //     await writeClient.create(newProduct);

// //     revalidatePath('/Bismillah786/products');
// //     revalidatePath('/');
// //     return { success: true, message: 'Product created successfully!' };
// //   } catch (error: any) {
// //     console.error("Failed to create product:", error);
// //     const message = error.message?.includes('slug') 
// //       ? 'This slug is already in use. Please choose a different one.' 
// //       : 'An unexpected error occurred.';
// //     return { success: false, message };
// //   }
// // }

// // // === ACTION #5: UPDATE AN EXISTING PRODUCT (Refactored with Zod) ===
// // export async function updateProduct(productId: string, productData: ProductPayload) {
// //   const validation = ProductPayloadSchema.safeParse(productData);
// //   if (!validation.success) {
// //       return { success: false, message: validation.error.issues[0].message };
// //   }
// //   const data = validation.data;

// //   try {
// //     await verifyAdmin(['Super Admin', 'Content Editor']);
// //     const portableTextDescription = convertTiptapJsonToPortableText(data.description);
    
// //     const patch = writeClient.patch(productId).set({
// //       title: data.title, 'slug.current': data.slug, videoUrl: data.videoUrl || undefined,
// //       description: portableTextDescription,
// //       brand: data.brandId ? { _type: 'reference', _ref: data.brandId } : undefined,
// //       isBestSeller: data.isBestSeller, isNewArrival: data.isNewArrival, isFeatured: data.isFeatured, isOnDeal: data.isOnDeal,
// //       rating: data.rating,
// //       categories: [], 
// //     }).unset(['categories']).set({
// //       categories: (data.categoryIds || []).map((catId: string) => ({_key: `cat_${Date.now()}_${Math.random()}`,_type: 'reference',_ref: catId})),
// //       variants: data.variants,
// //     });

// //     await patch.commit({ autoGenerateArrayKeys: true });

// //     revalidatePath('/Bismillah786/products');
// //     revalidatePath(`/product/${data.slug}`);
// //     revalidatePath('/');
// //     return { success: true, message: 'Product updated successfully!' };
// //   } catch (error: any) {
// //     console.error("Failed to update product:", error);
// //     const message = (error as any).response?.body?.error?.description || 'Failed to update product. Please check your inputs.';
// //     return { success: false, message };
// //   }
// // }

// // // === ACTION #6: DELETE A PRODUCT (Refactored with Zod) ===
// // export async function deleteProduct(productId: string) {
// //     const validation = DeleteProductSchema.safeParse({ productId });
// //     if (!validation.success) {
// //         return { success: false, message: validation.error.issues[0].message };
// //     }
// //     const { productId: validatedId } = validation.data;

// //     try {
// //         await verifyAdmin(['Super Admin']);
// //         await writeClient.delete(validatedId);
// //         revalidatePath('/Bismillah786/products');
// //         revalidatePath('/');
// //         return { success: true, message: 'Product deleted successfully!' };
// //     } catch (error: any) {
// //         console.error("Failed to delete product:", error);
// //         return { success: false, message: error.message || 'Failed to delete product.' };
// //     }
// // }

// // // === ACTION #7: BATCH CREATE FROM CSV (FULLY REFACTORED & FUTURE-PROOF) ===
// // export async function batchCreateProductsFromGroups(productGroups: unknown[][]) {
// //     await verifyAdmin(['Super Admin', 'Content Editor']);
    
// //     let successfulCount = 0;
// //     let failedCount = 0;
// //     const errors: string[] = [];

// //     const allCategories = await client.fetch(`*[_type == "category"]{_id, "slug": slug.current, name}`);
// //     const allBrands = await client.fetch(`*[_type == "brand"]{_id, name}`);
  
// //     for (const group of productGroups) {
// //         const groupValidation = ProductGroupSchema.safeParse(group);
// //         if (!groupValidation.success) {
// //           failedCount++;
// //           const groupIdentifier = (group[0] as any)?.title || `Group at row ${(group[0] as any)?.originalIndex || 'N/A'}`;
// //           errors.push(`Product "${groupIdentifier}": ${groupValidation.error.issues[0].message}`);
// //           continue;
// //         }

// //         // We know from the .refine() that the first item is a parent and the rest are variants.
// //         const [parentData, ...variantRows] = groupValidation.data;
// //         const title = parentData.title!;

// //         try {
// //             const description = parentData.description ? convertTiptapJsonToPortableText({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: parentData.description }] }] }) : [];

// //             const newProduct: any = {
// //                 _type: 'product',
// //                 title: title,
// //                 slug: { _type: 'slug', current: parentData.slug! },
// //                 videoUrl: parentData.videoUrl,
// //                 description: description,
// //                 isBestSeller: parentData.isBestSeller,
// //                 isNewArrival: parentData.isNewArrival,
// //                 isFeatured: parentData.isFeatured,
// //                 isOnDeal: parentData.isOnDeal,
// //                 rating: parentData.rating,
// //             };

// //             if (parentData.brand) {
// //                 const brandRef = allBrands.find((b: any) => b.name.toLowerCase() === parentData.brand!.trim().toLowerCase());
// //                 if (brandRef) newProduct.brand = { _type: 'reference', _ref: brandRef._id };
// //             }
      
// //             newProduct.categories = (parentData.categories || '').split(',').map((catId: string) => {
// //                 const found = allCategories.find((c: any) => c.slug === catId.trim() || c.name.toLowerCase() === catId.trim().toLowerCase());
// //                 return found ? { _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: found._id } : null;
// //             }).filter(Boolean);

// //             newProduct.variants = await Promise.all(variantRows.map(async (v) => {
// //                 // This is a type guard to ensure `v` is a variant row.
// //                 if ('variant_name' in v) {
// //                     const variantImageUrls = (v.variant_images || '').split(',').map((url: string) => url.trim()).filter(Boolean);
// //                     const variantImageAssets = await Promise.all(variantImageUrls.map(async (url: string) => {
// //                         try {
// //                             const imageResponse = await fetch(url);
// //                             if (!imageResponse.ok) throw new Error(`Failed to download image: ${url}`);
// //                             const asset = await writeClient.assets.upload('image', imageResponse.body as any, { filename: v.variant_sku || 'variant-img' });
// //                             return { _key: `vimg_${Date.now()}_${Math.random()}`, _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
// //                         } catch (imgError: any) {
// //                             errors.push(`Product "${title}": Skipped image ${url} due to error: ${imgError.message}`);
// //                             return null;
// //                         }
// //                     })).then(results => results.filter(Boolean));
                
// //                     return {
// //                         _key: `v_${Date.now()}_${Math.random()}`,
// //                         name: v.variant_name,
// //                         price: v.variant_price,
// //                         salePrice: v.variant_salePrice,
// //                         sku: v.variant_sku,
// //                         stock: v.variant_stock,
// //                         inStock: v.variant_inStock,
// //                         images: variantImageAssets,
// //                         weight: v.variant_weight,
// //                         dimensions: (v.variant_height && v.variant_width && v.variant_depth) ? {
// //                             _type: 'dimensions', height: v.variant_height, width: v.variant_width, depth: v.variant_depth,
// //                         } : undefined,
// //                         attributes: parseAttributesString(v.variant_attributes),
// //                     };
// //                 }
// //                 return null;
// //             })).then(results => results.filter(Boolean));
          
// //             await writeClient.create(newProduct);
// //             successfulCount++;
// //         } catch (error: any) {
// //             failedCount++;
// //             errors.push(`Product "${title}": ${error.message}`);
// //             console.error(`Failed to process product: ${title}`, error);
// //         }
// //     }
  
// //     if (successfulCount > 0) {
// //         revalidatePath('/Bismillah786/products');
// //         revalidatePath('/');
// //     }

// //     return {
// //         success: failedCount === 0,
// //         message: `Processed: ${productGroups.length}, Successful: ${successfulCount}, Failed: ${failedCount}`,
// //         errors,
// //     };
// // }
// "use server";

// import { revalidatePath } from "next/cache";
// import { auth } from "@/app/auth";
// import { client, writeClient } from "@/sanity/lib/client";
// import {
//   GET_PAGINATED_ADMIN_PRODUCTS_QUERY,
//   GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY,
//   GET_FORM_DATA_QUERY,
//   GET_SINGLE_PRODUCT_FOR_EDIT_QUERY,
// } from "@/sanity/lib/queries";
// import { z } from "zod";
// import { ProductPayloadSchema, DeleteProductSchema, ProductGroupSchema } from "@/app/lib/zodSchemas";
// import { VariantAttribute } from "@/sanity/types/product_types";

// type ProductPayload = z.infer<typeof ProductPayloadSchema>;

// // 🔥 CONFIGURATION
// const MAX_CONCURRENT_UPLOADS = 10; 
// let cachedCategories: any[] | null = null;
// let cachedBrands: any[] | null = null;

// // --- Helper Functions ---

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// async function verifyAdmin(allowedRoles: string[]): Promise<string> {
//     const session = await auth();
//     const userRole = session?.user?.role;
//     if (!userRole || !allowedRoles.includes(userRole)) {
//         throw new Error("Permission Denied.");
//     }
//     return userRole;
// }

// // Optimized Concurrency Limiter
// async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
//     const results: T[] = [];
//     const executing: Promise<void>[] = [];
//     for (const task of tasks) {
//         const p = task().then(result => { results.push(result); });
//         executing.push(p);
//         const clean = () => executing.splice(executing.indexOf(p), 1);
//         p.then(clean).catch(clean);
//         if (executing.length >= limit) { await Promise.race(executing); }
//     }
//     await Promise.all(executing);
//     return results;
// }

// // SMART IMAGE UPLOADER (Fixed: Type 'string' for url)
// async function uploadImageWithRetry(url: string, filename: string, retries = 4): Promise<any> {
//     for (let i = 0; i < retries; i++) {
//         try {
//             const controller = new AbortController();
//             const timeoutId = setTimeout(() => controller.abort(), 15000); 

//             const imageResponse = await fetch(url, {
//                 headers: { 'User-Agent': 'Mozilla/5.0' },
//                 signal: controller.signal,
//                 cache: 'no-store'
//             });
//             clearTimeout(timeoutId);

//             if (!imageResponse.ok) throw new Error(`HTTP ${imageResponse.status}`);
            
//             return await writeClient.assets.upload('image', imageResponse.body as any, { filename });
//         } catch (error: any) {
//             if (i < retries - 1) {
//                 await sleep(1000 * (i + 1));
//                 continue;
//             }
//             throw error;
//         }
//     }
// }

// function convertTiptapJsonToPortableText(tiptapJson: any) {
//     if (!tiptapJson || !tiptapJson.content) return [];
//     const convertNode = (node: any, index: number): any => {
//         const key = `node_${Date.now()}_${index}_${Math.random()}`;
//         switch (node.type) {
//             case 'paragraph': return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.map((child: any, i: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${i}`, marks: child.marks ? child.marks.map((mark: any) => mark.type) : [] })) : [] };
//             case 'heading': return { _type: 'block', style: `h${node.attrs.level}`, _key: key, children: node.content ? node.content.map((child: any, i: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${i}` })) : [] };
//             case 'bulletList': return { _type: 'block', _key: key, listItem: 'bullet', level: 1, children: node.content ? node.content.flatMap((li: any, i: number) => convertNode(li, i)?.children || []) : [] };
//             case 'orderedList': return { _type: 'block', _key: key, listItem: 'number', level: 1, children: node.content ? node.content.flatMap((li: any, i: number) => convertNode(li, i)?.children || []) : [] };
//             case 'listItem': return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.flatMap((p:any, i:number) => convertNode(p, i)?.children || []) : [] };
//             default: return null;
//         }
//     }
//     return tiptapJson.content.map(convertNode).filter(Boolean);
// }

// function parseAttributesString(attrString?: string): VariantAttribute[] {
//     if (!attrString || typeof attrString !== 'string') return [];
//     return attrString.split(',').map(pair => {
//             const parts = pair.split(':');
//             if (parts.length !== 2) return null;
//             return { _key: `attr_${Date.now()}_${Math.random()}`, name: parts[0].trim(), value: parts[1].trim() };
//         }).filter((item): item is VariantAttribute => item !== null);
// }

// // === ACTIONS ===

// export async function getPaginatedAdminProducts({ page = 1, limit = 15, searchTerm = '' }) {
//     try {
//         const start = (page - 1) * limit;
//         const end = start + limit;
//         const params = { searchTerm: searchTerm ? `*${searchTerm.trim()}*` : '*', exactSearchTerm: searchTerm.trim(), start, end };
//         const countParams = { searchTerm: params.searchTerm, exactSearchTerm: params.exactSearchTerm };
//         const [products, totalCount] = await Promise.all([
//             client.fetch(GET_PAGINATED_ADMIN_PRODUCTS_QUERY, params),
//             client.fetch(GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY, countParams)
//         ]);
//         return { products, totalPages: Math.ceil(totalCount / limit) };
//     } catch (e) { return { products: [], totalPages: 0 }; }
// }

// export async function getFormData() { 
//     try { return await client.fetch(GET_FORM_DATA_QUERY); } 
//     catch (e) { return { categories: [], brands: [] }; } 
// }

// export async function getSingleProductForEdit(slug: string) { 
//     try { return await client.fetch(GET_SINGLE_PRODUCT_FOR_EDIT_QUERY, { slug }); } 
//     catch (e) { return null; } 
// }

// export async function createProduct(d: ProductPayload) {
//     const v = ProductPayloadSchema.safeParse(d);
//     if (!v.success) return { success: false, message: v.error.issues[0].message };
//     try {
//         await verifyAdmin(['Super Admin', 'Content Editor']);
//         await writeClient.create({
//             _type: 'product',
//             title: v.data.title,
//             slug: { _type: 'slug', current: v.data.slug },
//             videoUrl: v.data.videoUrl,
//             description: convertTiptapJsonToPortableText(v.data.description),
//             brand: v.data.brandId ? { _type: 'reference', _ref: v.data.brandId } : undefined,
//             isBestSeller: v.data.isBestSeller,
//             isNewArrival: v.data.isNewArrival,
//             isFeatured: v.data.isFeatured,
//             isOnDeal: v.data.isOnDeal,
//             rating: Number(v.data.rating) || 0, // Numeric fix
//             categories: (v.data.categoryIds || []).map(id => ({ _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: id })),
//             variants: v.data.variants
//         });
//         revalidatePath('/Bismillah786/products');
//         revalidatePath('/');
//         return { success: true, message: 'Product Created' };
//     } catch (e: any) { return { success: false, message: e.message }; }
// }

// export async function updateProduct(id: string, d: ProductPayload) {
//     const v = ProductPayloadSchema.safeParse(d);
//     if (!v.success) return { success: false, message: v.error.issues[0].message };
//     try {
//         await verifyAdmin(['Super Admin', 'Content Editor']);
//         const patch = writeClient.patch(id).set({
//             title: v.data.title,
//             'slug.current': v.data.slug,
//             videoUrl: v.data.videoUrl,
//             description: convertTiptapJsonToPortableText(v.data.description),
//             brand: v.data.brandId ? { _type: 'reference', _ref: v.data.brandId } : undefined,
//             isBestSeller: v.data.isBestSeller,
//             isNewArrival: v.data.isNewArrival,
//             isFeatured: v.data.isFeatured,
//             isOnDeal: v.data.isOnDeal,
//             rating: Number(v.data.rating) || 0, // Numeric fix
//             categories: []
//         }).unset(['categories']).set({
//             categories: (v.data.categoryIds || []).map(id => ({ _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: id })),
//             variants: v.data.variants
//         });
//         await patch.commit({ autoGenerateArrayKeys: true });
//         revalidatePath('/Bismillah786/products');
//         revalidatePath(`/product/${v.data.slug}`);
//         revalidatePath('/');
//         return { success: true, message: 'Product Updated' };
//     } catch (e: any) { return { success: false, message: e.message }; }
// }

// // Fixed: Used DeleteProductSchema to fix "declared but never read" error
// export async function deleteProduct(productId: string) {
//     const validation = DeleteProductSchema.safeParse({ productId });
//     if (!validation.success) {
//         return { success: false, message: validation.error.issues[0].message };
//     }
//     try {
//         await verifyAdmin(['Super Admin']);
//         await writeClient.delete(validation.data.productId);
//         revalidatePath('/Bismillah786/products');
//         revalidatePath('/');
//         return { success: true, message: 'Product Deleted' };
//     } catch (e: any) { return { success: false, message: e.message }; }
// }

// // === ACTION #7: BATCH CREATE (TURBO + NUMERIC FIX) ===
// export async function batchCreateProductsFromGroups(productGroups: unknown[][]) {
//     const startTime = Date.now();
//     await verifyAdmin(['Super Admin', 'Content Editor']);
    
//     let successfulCount = 0;
//     let failedCount = 0;
//     const errors: string[] = [];

//     // Memory Cache for speed
//     if (!cachedCategories || !cachedBrands) {
//         const [cats, brnds] = await Promise.all([
//             client.fetch(`*[_type == "category"]{_id, "slug": slug.current, name}`),
//             client.fetch(`*[_type == "brand"]{_id, name}`)
//         ]);
//         cachedCategories = cats;
//         cachedBrands = brnds;
//     }
  
//     const productPromises = productGroups.map(async (group, index) => {
//         const groupValidation = ProductGroupSchema.safeParse(group);
//         if (!groupValidation.success) { failedCount++; return; }

//         const [parentData, ...variantRows] = groupValidation.data;
//         const title = parentData.title!;

//         try {
//             const description = parentData.description ? convertTiptapJsonToPortableText({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: parentData.description }] }] }) : [];

//             const newProduct: any = {
//                 _type: 'product',
//                 title: title,
//                 slug: { _type: 'slug', current: parentData.slug! },
//                 videoUrl: parentData.videoUrl,
//                 description: description,
//                 isBestSeller: parentData.isBestSeller,
//                 isNewArrival: parentData.isNewArrival,
//                 isFeatured: parentData.isFeatured,
//                 isOnDeal: parentData.isOnDeal,
//                 rating: Number(parentData.rating) || 0, // Numeric fix for CSV
//             };

//             if (parentData.brand && cachedBrands) {
//                 const brandRef = cachedBrands.find((b: any) => b.name.toLowerCase() === parentData.brand!.trim().toLowerCase());
//                 if (brandRef) newProduct.brand = { _type: 'reference', _ref: brandRef._id };
//             }
            
//             if (cachedCategories) {
//                 newProduct.categories = (parentData.categories || '').split(',').map((catId: string) => {
//                     const found = cachedCategories!.find((c: any) => c.slug === catId.trim() || c.name.toLowerCase() === catId.trim().toLowerCase());
//                     return found ? { _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: found._id } : null;
//                 }).filter(Boolean);
//             }

//             const allImageTasks: (() => Promise<any>)[] = [];
//             const variantsData: any[] = [];

//             variantRows.forEach((v, vIndex) => {
//                 if ('variant_name' in v) {
//                     const vObj = { ...v, imageAssets: [] as any[] };
//                     variantsData.push(vObj);

//                     const variantImageUrls = (v.variant_images || '').split(',').map((u: string) => u.trim()).filter(Boolean);
//                     variantImageUrls.forEach((url: string) => {
//                         allImageTasks.push(async () => {
//                             try {
//                                 const asset = await uploadImageWithRetry(url, v.variant_sku || `img-${vIndex}`);
//                                 vObj.imageAssets.push({ 
//                                     _key: `vimg_${Date.now()}_${Math.random()}`, 
//                                     _type: 'image', 
//                                     asset: { _type: 'reference', _ref: asset._id } 
//                                 });
//                             } catch (e) { errors.push(`Image Fail for ${title}: ${url}`); }
//                         });
//                     });
//                 }
//             });

//             await runWithConcurrency(allImageTasks, MAX_CONCURRENT_UPLOADS);

//             newProduct.variants = variantsData.map(v => ({
//                 _key: `v_${Date.now()}_${Math.random()}`,
//                 name: v.variant_name,
//                 price: Number(v.variant_price) || 0, // Numeric fix
//                 salePrice: v.variant_salePrice ? Number(v.variant_salePrice) : undefined, // Numeric fix
//                 sku: v.variant_sku,
//                 stock: Number(v.variant_stock) || 0, // Numeric fix
//                 inStock: v.variant_inStock,
//                 images: v.imageAssets,
//                 weight: v.variant_weight,
//                 dimensions: (v.variant_height) ? { _type: 'dimensions', height: v.variant_height, width: v.variant_width, depth: v.variant_depth } : undefined,
//                 attributes: parseAttributesString(v.variant_attributes),
//             }));

//             await writeClient.create(newProduct);
//             successfulCount++;
//         } catch (error: any) {
//             failedCount++;
//             errors.push(`${title}: ${error.message}`);
//         }
//     });

//     await Promise.all(productPromises);
//     revalidatePath('/Bismillah786/products');
//     revalidatePath('/');

//     return {
//         success: failedCount === 0,
//         message: `Batch complete in ${Date.now() - startTime}ms`,
//         successful: successfulCount,
//         failed: failedCount,
//         errors,
//     };
// }
// "use server";

// import { revalidatePath } from "next/cache";
// import { auth } from "@/app/auth";
// import { client, writeClient } from "@/sanity/lib/client";
// import {
//   GET_PAGINATED_ADMIN_PRODUCTS_QUERY,
//   GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY,
//   GET_FORM_DATA_QUERY,
//   GET_SINGLE_PRODUCT_FOR_EDIT_QUERY,
// } from "@/sanity/lib/queries";
// import { z } from "zod";
// import { ProductPayloadSchema, DeleteProductSchema, ProductGroupSchema } from "@/app/lib/zodSchemas";
// import { VariantAttribute } from "@/sanity/types/product_types";

// type ProductPayload = z.infer<typeof ProductPayloadSchema>;

// // 🔥 CONFIGURATION
// const MAX_CONCURRENT_UPLOADS = 5; 
// let cachedCategories: any[] | null = null;
// let cachedBrands: any[] | null = null;

// // --- Helper Functions ---

// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// const generateSlug = (text: string) => 
//   text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

// const safeFloat = (val: any) => {
//     if (typeof val === 'number') return val;
//     if (!val || val === "") return 0;
//     const num = parseFloat(val.toString().replace(/,/g, '').trim()); 
//     return isNaN(num) ? 0 : num;
// };

// const safeInt = (val: any) => {
//     if (typeof val === 'number') return Math.floor(val);
//     if (!val || val === "") return 0;
//     const num = parseInt(val.toString().replace(/,/g, '').trim(), 10);
//     return isNaN(num) ? 0 : num;
// };

// async function verifyAdmin(allowedRoles: string[]): Promise<string> {
//     const session = await auth();
//     const userRole = session?.user?.role;
//     if (!userRole || !allowedRoles.includes(userRole)) {
//         throw new Error("Permission Denied.");
//     }
//     return userRole;
// }

// async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
//     const results: T[] = [];
//     const executing: Promise<void>[] = [];
//     for (const task of tasks) {
//         const p = task().then(result => { results.push(result); });
//         executing.push(p);
//         const clean = () => executing.splice(executing.indexOf(p), 1);
//         p.then(clean).catch(clean);
//         if (executing.length >= limit) { await Promise.race(executing); }
//     }
//     await Promise.all(executing);
//     return results;
// }

// async function uploadImageWithRetry(url: string, filename: string, retries = 3): Promise<any> {
//     if(!url || url.trim() === '') return null; 

//     for (let i = 0; i < retries; i++) {
//         try {
//             const controller = new AbortController();
//             const timeoutId = setTimeout(() => controller.abort(), 10000); 

//             const imageResponse = await fetch(url, {
//                 headers: { 'User-Agent': 'Mozilla/5.0' },
//                 signal: controller.signal,
//                 cache: 'no-store'
//             });
//             clearTimeout(timeoutId);

//             if (!imageResponse.ok) throw new Error(`HTTP ${imageResponse.status}`);
            
//             return await writeClient.assets.upload('image', imageResponse.body as any, { filename });
//         } catch (error: any) {
//             if (i < retries - 1) {
//                 await sleep(1500 * (i + 1));
//                 continue;
//             }
//             console.error(`Failed to upload image: ${url}`);
//             return null;
//         }
//     }
// }

// function convertTiptapJsonToPortableText(tiptapJson: any) {
//     if (!tiptapJson || !tiptapJson.content) return [];
    
//     const convertNode = (node: any, index: number): any => {
//         const key = `node_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`;
//         switch (node.type) {
//             case 'paragraph': return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.map((child: any, i: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${i}`, marks: child.marks ? child.marks.map((mark: any) => mark.type) : [] })) : [] };
//             case 'heading': return { _type: 'block', style: `h${node.attrs.level}`, _key: key, children: node.content ? node.content.map((child: any, i: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${i}` })) : [] };
//             case 'bulletList': return { _type: 'block', _key: key, listItem: 'bullet', level: 1, children: node.content ? node.content.flatMap((li: any, i: number) => convertNode(li, i)?.children || []) : [] };
//             case 'orderedList': return { _type: 'block', _key: key, listItem: 'number', level: 1, children: node.content ? node.content.flatMap((li: any, i: number) => convertNode(li, i)?.children || []) : [] };
//             case 'listItem': return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.flatMap((p:any, i:number) => convertNode(p, i)?.children || []) : [] };
//             default: return { _type: 'block', style: 'normal', _key: key, children: [{ _type: 'span', text: node.text || '', _key: `${key}_span_0` }] };
//         }
//     }
//     return tiptapJson.content.map(convertNode).filter(Boolean);
// }

// // 🔥 NEW: Function to handle Multi-Column Attributes
// function parseCsvAttributes(row: any): VariantAttribute[] {
//     const attributes: VariantAttribute[] = [];

//     // 1. Check old single-string format (Just in case)
//     if (row.variant_attributes && typeof row.variant_attributes === 'string') {
//         const parsed = row.variant_attributes.split(',')
//             .map((pair: string) => {
//                 const parts = pair.split(':');
//                 if (parts.length < 2) return null;
//                 return { 
//                     _type: 'variantAttribute', 
//                     _key: `attr_${Date.now()}_${Math.random().toString(36).substring(7)}`, 
//                     name: parts[0].trim(), 
//                     value: parts.slice(1).join(':').trim() 
//                 };
//             })
//             .filter((item: any) => item !== null);
//         attributes.push(...parsed);
//     }

//     // 2. 🔥 CHECK SEPARATE COLUMNS (From your Screenshot)
//     // Attribute 1
//     if (row.attribute1_name && row.attribute1_value) {
//         attributes.push({
//             _type: 'variantAttribute',
//             _key: `attr1_${Date.now()}_${Math.random().toString(36).substring(7)}`,
//             name: row.attribute1_name.toString().trim(),
//             value: row.attribute1_value.toString().trim()
//         } as unknown as VariantAttribute);
//     }

//     // Attribute 2
//     if (row.attribute2_name && row.attribute2_value) {
//         attributes.push({
//             _type: 'variantAttribute',
//             _key: `attr2_${Date.now()}_${Math.random().toString(36).substring(7)}`,
//             name: row.attribute2_name.toString().trim(),
//             value: row.attribute2_value.toString().trim()
//         } as unknown as VariantAttribute);
//     }

//     // Attribute 3 (Agar ho)
//     if (row.attribute3_name && row.attribute3_value) {
//         attributes.push({
//             _type: 'variantAttribute',
//             _key: `attr3_${Date.now()}_${Math.random().toString(36).substring(7)}`,
//             name: row.attribute3_name.toString().trim(),
//             value: row.attribute3_value.toString().trim()
//         } as unknown as VariantAttribute);
//     }

//     return attributes;
// }

// // === ACTIONS ===

// export async function getPaginatedAdminProducts({ page = 1, limit = 15, searchTerm = '' }) {
//     try {
//         const start = (page - 1) * limit;
//         const end = start + limit;
//         const params = { searchTerm: searchTerm ? `*${searchTerm.trim()}*` : '*', exactSearchTerm: searchTerm.trim(), start, end };
//         const countParams = { searchTerm: params.searchTerm, exactSearchTerm: params.exactSearchTerm };
//         const [products, totalCount] = await Promise.all([
//             client.fetch(GET_PAGINATED_ADMIN_PRODUCTS_QUERY, params),
//             client.fetch(GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY, countParams)
//         ]);
//         return { products, totalPages: Math.ceil(totalCount / limit) };
//     } catch (e) { return { products: [], totalPages: 0 }; }
// }

// export async function getFormData() { 
//     try { return await client.fetch(GET_FORM_DATA_QUERY); } 
//     catch (e) { return { categories: [], brands: [] }; } 
// }

// export async function getSingleProductForEdit(slug: string) { 
//     try { return await client.fetch(GET_SINGLE_PRODUCT_FOR_EDIT_QUERY, { slug }); } 
//     catch (e) { return null; } 
// }

// export async function createProduct(d: ProductPayload) {
//     const v = ProductPayloadSchema.safeParse(d);
//     if (!v.success) return { success: false, message: v.error.issues[0].message };
//     try {
//         await verifyAdmin(['Super Admin', 'Content Editor']);
//         await writeClient.create({
//             _type: 'product',
//             title: v.data.title,
//             slug: { _type: 'slug', current: v.data.slug },
//             videoUrl: v.data.videoUrl,
//             description: convertTiptapJsonToPortableText(v.data.description),
//             brand: v.data.brandId ? { _type: 'reference', _ref: v.data.brandId } : undefined,
//             isBestSeller: v.data.isBestSeller,
//             isNewArrival: v.data.isNewArrival,
//             isFeatured: v.data.isFeatured,
//             isOnDeal: v.data.isOnDeal,
//             rating: safeFloat(v.data.rating), 
//             categories: (v.data.categoryIds || []).map(id => ({ _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: id })),
//             variants: v.data.variants.map(variant => ({
//                 ...variant,
//                 _type: 'productVariant' 
//             }))
//         });
//         revalidatePath('/Bismillah786/products');
//         revalidatePath('/');
//         return { success: true, message: 'Product Created' };
//     } catch (e: any) { return { success: false, message: e.message }; }
// }

// export async function updateProduct(id: string, d: ProductPayload) {
//     const v = ProductPayloadSchema.safeParse(d);
//     if (!v.success) return { success: false, message: v.error.issues[0].message };
//     try {
//         await verifyAdmin(['Super Admin', 'Content Editor']);
        
//         const categoryObjects = (v.data.categoryIds || []).map(id => ({ 
//             _key: `cat_${Date.now()}_${Math.random()}`, 
//             _type: 'reference', 
//             _ref: id 
//         }));

//         const variantObjects = v.data.variants.map(variant => ({
//             ...variant,
//             _type: 'productVariant'
//         }));

//         const patch = writeClient.patch(id).set({
//             title: v.data.title,
//             'slug.current': v.data.slug,
//             videoUrl: v.data.videoUrl,
//             description: convertTiptapJsonToPortableText(v.data.description),
//             brand: v.data.brandId ? { _type: 'reference', _ref: v.data.brandId } : undefined,
//             isBestSeller: v.data.isBestSeller,
//             isNewArrival: v.data.isNewArrival,
//             isFeatured: v.data.isFeatured,
//             isOnDeal: v.data.isOnDeal,
//             rating: safeFloat(v.data.rating), 
//             categories: [] 
//         }).set({
//             categories: categoryObjects,
//             variants: variantObjects
//         });

//         await patch.commit({ autoGenerateArrayKeys: true });
        
//         revalidatePath('/Bismillah786/products');
//         revalidatePath(`/product/${v.data.slug}`);
//         revalidatePath('/');
//         return { success: true, message: 'Product Updated' };
//     } catch (e: any) { return { success: false, message: e.message }; }
// }

// export async function deleteProduct(productId: string) {
//     const validation = DeleteProductSchema.safeParse({ productId });
//     if (!validation.success) {
//         return { success: false, message: validation.error.issues[0].message };
//     }
//     try {
//         await verifyAdmin(['Super Admin']);
//         await writeClient.delete(validation.data.productId);
//         revalidatePath('/Bismillah786/products');
//         revalidatePath('/');
//         return { success: true, message: 'Product Deleted' };
//     } catch (e: any) { return { success: false, message: e.message }; }
// }

// // === ACTION #7: BATCH CREATE (MULTI-COLUMN SUPPORT) ===
// export async function batchCreateProductsFromGroups(productGroups: unknown[][]) {
//     await verifyAdmin(['Super Admin', 'Content Editor']);
    
//     let successfulCount = 0;
//     let failedCount = 0;
//     const errors: string[] = [];

//     // Cache initialization
//     if (!cachedCategories || !cachedBrands) {
//         const [cats, brnds] = await Promise.all([
//             client.fetch(`*[_type == "category"]{_id, "slug": slug.current, name}`),
//             client.fetch(`*[_type == "brand"]{_id, name}`)
//         ]);
//         cachedCategories = cats;
//         cachedBrands = brnds;
//     }
  
//     for (const group of productGroups) {
//         const groupValidation = ProductGroupSchema.safeParse(group);
//         if (!groupValidation.success) { 
//             failedCount++; 
//             errors.push("Invalid Data Structure in one of the rows.");
//             continue; 
//         }

//         const [parentData, ...variantRows] = groupValidation.data;
//         const title = parentData.title!;
        
//         if(!parentData.slug) {
//             errors.push(`Skipping Product: "${title}" - Missing Slug`);
//             failedCount++;
//             continue;
//         }

//         try {
//             // A. BRAND
//             let brandRef = undefined;
//             if (parentData.brand && parentData.brand.trim() !== "") {
//                 const brandNameInput = parentData.brand.trim();
//                 let foundBrand = cachedBrands!.find((b: any) => b.name.toLowerCase() === brandNameInput.toLowerCase());

//                 if (!foundBrand) {
//                     foundBrand = await writeClient.create({
//                         _type: 'brand',
//                         name: brandNameInput,
//                         slug: { _type: 'slug', current: generateSlug(brandNameInput) },
//                     });
//                     cachedBrands!.push({ _id: foundBrand._id, name: foundBrand.name });
//                 }
//                 brandRef = { _type: 'reference', _ref: foundBrand._id };
//             }

//             // B. CATEGORIES
//             const categoryRefs = (cachedCategories && parentData.categories) 
//                 ? (parentData.categories || '').split(',').map((catId: string) => {
//                     const cleanCat = catId.trim();
//                     const found = cachedCategories!.find((c: any) => c.slug === cleanCat || c.name.toLowerCase() === cleanCat.toLowerCase());
//                     return found ? { _key: `cat_${Math.random().toString(36).substring(7)}`, _type: 'reference', _ref: found._id } : null;
//                 }).filter(Boolean)
//                 : [];

//             // C. IMAGES
//             const allImageTasks: (() => Promise<any>)[] = [];
//             const processedVariants: any[] = [];

//             for (let vIndex = 0; vIndex < variantRows.length; vIndex++) {
//                 const v = variantRows[vIndex];
                
//                 if ('variant_name' in v) {
//                     const vObj = { ...v, imageAssets: [] as any[] };
//                     processedVariants.push(vObj);

//                     const variantImageUrls = (v.variant_images || '').split(',').map((u: string) => u.trim()).filter(Boolean);
                    
//                     variantImageUrls.forEach((url: string) => {
//                         allImageTasks.push(async () => {
//                             const asset = await uploadImageWithRetry(url, `${parentData.slug}-v${vIndex}`);
//                             if(asset) {
//                                 vObj.imageAssets.push({ 
//                                     _key: `vimg_${Math.random().toString(36).substring(7)}`, 
//                                     _type: 'image', 
//                                     asset: { _type: 'reference', _ref: asset._id } 
//                                 });
//                             }
//                         });
//                     });
//                 }
//             }
//             await runWithConcurrency(allImageTasks, MAX_CONCURRENT_UPLOADS);

//             // D. CREATE PRODUCT
//             const newProduct: any = {
//                 _type: 'product',
//                 title: title,
//                 slug: { _type: 'slug', current: parentData.slug },
//                 videoUrl: parentData.videoUrl,
//                 description: parentData.description 
//                     ? [{
//                         _type: 'block',
//                         style: 'normal',
//                         _key: `desc_${Math.random().toString(36).substring(7)}`,
//                         children: [{ _type: 'span', text: parentData.description }]
//                       }]
//                     : [],
//                 brand: brandRef,
//                 categories: categoryRefs,
//                 isBestSeller: Boolean(parentData.isBestSeller),
//                 isNewArrival: Boolean(parentData.isNewArrival),
//                 isFeatured: Boolean(parentData.isFeatured),
//                 isOnDeal: Boolean(parentData.isOnDeal),
//                 rating: safeFloat(parentData.rating), 

//                 variants: processedVariants.map((v, idx) => ({
//                     _type: 'productVariant',
//                     _key: `var_${Date.now()}_${idx}`,
//                     name: v.variant_name || 'Default',
//                     sku: v.variant_sku,
//                     price: safeFloat(v.variant_price),
//                     salePrice: v.variant_salePrice ? safeFloat(v.variant_salePrice) : undefined,
//                     stock: safeInt(v.variant_stock),
//                     inStock: v.variant_inStock !== undefined ? Boolean(v.variant_inStock) : (safeInt(v.variant_stock) > 0),
//                     images: v.imageAssets,
                    
//                     // 🔥 UPDATED LOGIC FOR ATTRIBUTES
//                     attributes: parseCsvAttributes(v),
                    
//                     weight: v.variant_weight ? safeFloat(v.variant_weight) : undefined,
//                     dimensions: (v.variant_height || v.variant_width) ? { 
//                         _type: 'dimensions', 
//                         height: safeFloat(v.variant_height), 
//                         width: safeFloat(v.variant_width), 
//                         depth: safeFloat(v.variant_depth) 
//                     } : undefined,
//                 }))
//             };

//             await writeClient.create(newProduct);
//             successfulCount++;
            
//         } catch (error: any) {
//             failedCount++;
//             errors.push(`Error creating "${title}": ${error.message}`);
//             console.error(`Batch Error for ${title}:`, error);
//         }
//     }

//     revalidatePath('/Bismillah786/products');
//     revalidatePath('/');

//     return {
//         success: failedCount === 0,
//         message: `Import Completed. Created: ${successfulCount}, Failed: ${failedCount}`,
//         successful: successfulCount,
//         failed: failedCount,
//         errors,
//     };
// }
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { client, writeClient } from "@/sanity/lib/client";
import {
  GET_PAGINATED_ADMIN_PRODUCTS_QUERY,
  GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY,
  GET_FORM_DATA_QUERY,
  GET_SINGLE_PRODUCT_FOR_EDIT_QUERY,
} from "@/sanity/lib/queries";
import { z } from "zod";
import { ProductPayloadSchema, DeleteProductSchema, ProductGroupSchema } from "@/app/lib/zodSchemas";
import { VariantAttribute } from "@/sanity/types/product_types";

type ProductPayload = z.infer<typeof ProductPayloadSchema>;

// 🔥 CONFIGURATION
const MAX_CONCURRENT_UPLOADS = 5; 
let cachedCategories: any[] | null = null;
let cachedBrands: any[] | null = null;

// --- Helper Functions ---

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateSlug = (text: string) => 
  text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

const safeFloat = (val: any) => {
    if (typeof val === 'number') return val;
    if (!val || val === "") return 0;
    const num = parseFloat(val.toString().replace(/,/g, '').trim()); 
    return isNaN(num) ? 0 : num;
};

const safeInt = (val: any) => {
    if (typeof val === 'number') return Math.floor(val);
    if (!val || val === "") return 0;
    const num = parseInt(val.toString().replace(/,/g, '').trim(), 10);
    return isNaN(num) ? 0 : num;
};

async function verifyAdmin(allowedRoles: string[]): Promise<string> {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
        throw new Error("Permission Denied.");
    }
    return userRole;
}

async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];
    for (const task of tasks) {
        const p = task().then(result => { results.push(result); });
        executing.push(p);
        const clean = () => executing.splice(executing.indexOf(p), 1);
        p.then(clean).catch(clean);
        if (executing.length >= limit) { await Promise.race(executing); }
    }
    await Promise.all(executing);
    return results;
}

async function uploadImageWithRetry(url: string, filename: string, retries = 3): Promise<any> {
    if(!url || url.trim() === '') return null; 

    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); 

            const imageResponse = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: controller.signal,
                cache: 'no-store'
            });
            clearTimeout(timeoutId);

            if (!imageResponse.ok) throw new Error(`HTTP ${imageResponse.status}`);
            
            return await writeClient.assets.upload('image', imageResponse.body as any, { filename });
        } catch (error: any) {
            if (i < retries - 1) {
                await sleep(1500 * (i + 1));
                continue;
            }
            console.error(`Failed to upload image: ${url}`);
            return null;
        }
    }
}

function convertTiptapJsonToPortableText(tiptapJson: any) {
    if (!tiptapJson || !tiptapJson.content) return [];
    
    const convertNode = (node: any, index: number): any => {
        const key = `node_${Date.now()}_${index}_${Math.random().toString(36).substring(7)}`;
        switch (node.type) {
            case 'paragraph': return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.map((child: any, i: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${i}`, marks: child.marks ? child.marks.map((mark: any) => mark.type) : [] })) : [] };
            case 'heading': return { _type: 'block', style: `h${node.attrs.level}`, _key: key, children: node.content ? node.content.map((child: any, i: number) => ({ _type: 'span', text: child.text || '', _key: `${key}_span_${i}` })) : [] };
            case 'bulletList': return { _type: 'block', _key: key, listItem: 'bullet', level: 1, children: node.content ? node.content.flatMap((li: any, i: number) => convertNode(li, i)?.children || []) : [] };
            case 'orderedList': return { _type: 'block', _key: key, listItem: 'number', level: 1, children: node.content ? node.content.flatMap((li: any, i: number) => convertNode(li, i)?.children || []) : [] };
            case 'listItem': return { _type: 'block', style: 'normal', _key: key, children: node.content ? node.content.flatMap((p:any, i:number) => convertNode(p, i)?.children || []) : [] };
            default: return { _type: 'block', style: 'normal', _key: key, children: [{ _type: 'span', text: node.text || '', _key: `${key}_span_0` }] };
        }
    }
    return tiptapJson.content.map(convertNode).filter(Boolean);
}

// 🔥 NEW: Function to parse Specifications String into Object Array (Label/Value)
// Expected Input: "Material: Cotton | Gender: Unisex"
// Output: [{label: "Material", value: "Cotton"}, {label: "Gender", value: "Unisex"}]
function parseSpecificationsToKeyVal(specString?: string): any[] {
    if (!specString || typeof specString !== 'string') return [];
    
    // Split by pipe '|' which your scraper uses
    return specString.split('|')
        .map(item => item.trim())
        .filter(item => item.length > 0) // Remove empty entries
        .map(item => {
            const parts = item.split(':');
            const key = `spec_${Math.random().toString(36).substring(7)}`;
            
            if (parts.length >= 2) {
                // If colon exists, e.g. "Material: Nylon"
                return {
                    _key: key,
                    label: parts[0].trim(),
                    value: parts.slice(1).join(':').trim() // Rejoin rest if value has colons
                };
            } else {
                // If no colon, e.g. "Waterproof", treat as a general Feature
                return {
                    _key: key,
                    label: "Feature",
                    value: item
                };
            }
        });
}

// Function to handle Multi-Column Attributes for Variants
function parseCsvAttributes(row: any): VariantAttribute[] {
    const attributes: VariantAttribute[] = [];

    // 1. Check old single-string format
    if (row.variant_attributes && typeof row.variant_attributes === 'string') {
        const parsed = row.variant_attributes.split(',')
            .map((pair: string) => {
                const parts = pair.split(':');
                if (parts.length < 2) return null;
                return { 
                    _type: 'variantAttribute', 
                    _key: `attr_${Date.now()}_${Math.random().toString(36).substring(7)}`, 
                    name: parts[0].trim(), 
                    value: parts.slice(1).join(':').trim() 
                };
            })
            .filter((item: any) => item !== null);
        attributes.push(...parsed);
    }

    // 2. CHECK SEPARATE COLUMNS
    if (row.attribute1_name && row.attribute1_value) {
        attributes.push({
            _type: 'variantAttribute',
            _key: `attr1_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: row.attribute1_name.toString().trim(),
            value: row.attribute1_value.toString().trim()
        } as unknown as VariantAttribute);
    }
    if (row.attribute2_name && row.attribute2_value) {
        attributes.push({
            _type: 'variantAttribute',
            _key: `attr2_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: row.attribute2_name.toString().trim(),
            value: row.attribute2_value.toString().trim()
        } as unknown as VariantAttribute);
    }
    if (row.attribute3_name && row.attribute3_value) {
        attributes.push({
            _type: 'variantAttribute',
            _key: `attr3_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            name: row.attribute3_name.toString().trim(),
            value: row.attribute3_value.toString().trim()
        } as unknown as VariantAttribute);
    }

    return attributes;
}

// === ACTIONS ===

export async function getPaginatedAdminProducts({ page = 1, limit = 15, searchTerm = '' }) {
    try {
        const start = (page - 1) * limit;
        const end = start + limit;
        const params = { searchTerm: searchTerm ? `*${searchTerm.trim()}*` : '*', exactSearchTerm: searchTerm.trim(), start, end };
        const countParams = { searchTerm: params.searchTerm, exactSearchTerm: params.exactSearchTerm };
        const [products, totalCount] = await Promise.all([
            client.fetch(GET_PAGINATED_ADMIN_PRODUCTS_QUERY, params),
            client.fetch(GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY, countParams)
        ]);
        return { products, totalPages: Math.ceil(totalCount / limit) };
    } catch (e) { return { products: [], totalPages: 0 }; }
}

export async function getFormData() { 
    try { return await client.fetch(GET_FORM_DATA_QUERY); } 
    catch (e) { return { categories: [], brands: [] }; } 
}

export async function getSingleProductForEdit(slug: string) { 
    try { return await client.fetch(GET_SINGLE_PRODUCT_FOR_EDIT_QUERY, { slug }); } 
    catch (e) { return null; } 
}

export async function createProduct(d: ProductPayload) {
    const v = ProductPayloadSchema.safeParse(d);
    if (!v.success) return { success: false, message: v.error.issues[0].message };
    try {
        await verifyAdmin(['Super Admin', 'Content Editor']);
        await writeClient.create({
            _type: 'product',
            title: v.data.title,
            slug: { _type: 'slug', current: v.data.slug },
            videoUrl: v.data.videoUrl,
            description: convertTiptapJsonToPortableText(v.data.description),
            // 🔥 Updated: Ensure UI sends correct format, or handle conversion if UI is updated
            // For now, assuming UI sends compatible array or handled elsewhere. 
            // Since this function is for Manual Create, we assume UI matches schema.
            // If UI uses a text editor for specs, we might need a parser here similar to batch.
            specifications: v.data.specifications, 
            brand: v.data.brandId ? { _type: 'reference', _ref: v.data.brandId } : undefined,
            isBestSeller: v.data.isBestSeller,
            isNewArrival: v.data.isNewArrival,
            isFeatured: v.data.isFeatured,
            isOnDeal: v.data.isOnDeal,
            rating: safeFloat(v.data.rating), 
            categories: (v.data.categoryIds || []).map(id => ({ _key: `cat_${Date.now()}_${Math.random()}`, _type: 'reference', _ref: id })),
            variants: v.data.variants.map(variant => ({
                ...variant,
                _type: 'productVariant' 
            }))
        });
        revalidatePath('/Bismillah786/products');
        revalidatePath('/');
        return { success: true, message: 'Product Created' };
    } catch (e: any) { return { success: false, message: e.message }; }
}

export async function updateProduct(id: string, d: ProductPayload) {
    const v = ProductPayloadSchema.safeParse(d);
    if (!v.success) return { success: false, message: v.error.issues[0].message };
    try {
        await verifyAdmin(['Super Admin', 'Content Editor']);
        
        const categoryObjects = (v.data.categoryIds || []).map(id => ({ 
            _key: `cat_${Date.now()}_${Math.random()}`, 
            _type: 'reference', 
            _ref: id 
        }));

        const variantObjects = v.data.variants.map(variant => ({
            ...variant,
            _type: 'productVariant'
        }));

        const patch = writeClient.patch(id).set({
            title: v.data.title,
            'slug.current': v.data.slug,
            videoUrl: v.data.videoUrl,
            description: convertTiptapJsonToPortableText(v.data.description),
            specifications: v.data.specifications, // Assuming UI sends correct array format
            brand: v.data.brandId ? { _type: 'reference', _ref: v.data.brandId } : undefined,
            isBestSeller: v.data.isBestSeller,
            isNewArrival: v.data.isNewArrival,
            isFeatured: v.data.isFeatured,
            isOnDeal: v.data.isOnDeal,
            rating: safeFloat(v.data.rating), 
            categories: [] 
        }).set({
            categories: categoryObjects,
            variants: variantObjects
        });

        await patch.commit({ autoGenerateArrayKeys: true });
        
        revalidatePath('/Bismillah786/products');
        revalidatePath(`/product/${v.data.slug}`);
        revalidatePath('/');
        return { success: true, message: 'Product Updated' };
    } catch (e: any) { return { success: false, message: e.message }; }
}

export async function deleteProduct(productId: string) {
    const validation = DeleteProductSchema.safeParse({ productId });
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }
    try {
        await verifyAdmin(['Super Admin']);
        await writeClient.delete(validation.data.productId);
        revalidatePath('/Bismillah786/products');
        revalidatePath('/');
        return { success: true, message: 'Product Deleted' };
    } catch (e: any) { return { success: false, message: e.message }; }
}

// === ACTION #7: BATCH CREATE (MULTI-COLUMN & SCHEMA MATCHED) ===
export async function batchCreateProductsFromGroups(productGroups: unknown[][]) {
    await verifyAdmin(['Super Admin', 'Content Editor']);
    
    let successfulCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Cache initialization
    if (!cachedCategories || !cachedBrands) {
        const [cats, brnds] = await Promise.all([
            client.fetch(`*[_type == "category"]{_id, "slug": slug.current, name}`),
            client.fetch(`*[_type == "brand"]{_id, name}`)
        ]);
        cachedCategories = cats;
        cachedBrands = brnds;
    }
  
    for (const group of productGroups) {
        const groupValidation = ProductGroupSchema.safeParse(group);
        if (!groupValidation.success) { 
            failedCount++; 
            errors.push("Invalid Data Structure in one of the rows.");
            continue; 
        }

        const [parentData, ...variantRows] = groupValidation.data;
        const title = parentData.title!;
        
        if(!parentData.slug) {
            errors.push(`Skipping Product: "${title}" - Missing Slug`);
            failedCount++;
            continue;
        }

        // 🔥 DEBUG LOG: Specifications
        if (parentData.specifications) {
            console.log(`[Batch] Specifications String for "${title}":`, parentData.specifications.substring(0, 30) + "...");
        } else {
            console.log(`[Batch] No specifications found for "${title}"`);
        }

        try {
            // A. BRAND
            let brandRef = undefined;
            if (parentData.brand && parentData.brand.trim() !== "") {
                const brandNameInput = parentData.brand.trim();
                let foundBrand = cachedBrands!.find((b: any) => b.name.toLowerCase() === brandNameInput.toLowerCase());

                if (!foundBrand) {
                    foundBrand = await writeClient.create({
                        _type: 'brand',
                        name: brandNameInput,
                        slug: { _type: 'slug', current: generateSlug(brandNameInput) },
                    });
                    cachedBrands!.push({ _id: foundBrand._id, name: foundBrand.name });
                }
                brandRef = { _type: 'reference', _ref: foundBrand._id };
            }

            // B. CATEGORIES
            const categoryRefs = (cachedCategories && parentData.categories) 
                ? (parentData.categories || '').split(',').map((catId: string) => {
                    const cleanCat = catId.trim();
                    const found = cachedCategories!.find((c: any) => c.slug === cleanCat || c.name.toLowerCase() === cleanCat.toLowerCase());
                    return found ? { _key: `cat_${Math.random().toString(36).substring(7)}`, _type: 'reference', _ref: found._id } : null;
                }).filter(Boolean)
                : [];

            // 🔥 LOGIC: Prepare All Rows (Handling Parent as Variant)
            const allVariantRows = [...variantRows];
            
            // Check if parent row has variant data (price/sku/name)
            if (parentData.variant_price !== undefined || parentData.variant_sku || parentData.variant_name) {
                console.log(`[Batch] Parent row for "${title}" contains variant data. Treating as variant.`);
                // Assign default name if missing
                if (!parentData.variant_name) parentData.variant_name = "Standard";
                allVariantRows.unshift(parentData);
            }

            // C. IMAGES & VARIANTS PROCESSING
            const allImageTasks: (() => Promise<any>)[] = [];
            const processedVariants: any[] = [];

            for (let vIndex = 0; vIndex < allVariantRows.length; vIndex++) {
                const v = allVariantRows[vIndex];
                
                if (v.variant_name || v.variant_sku || v.variant_price !== undefined) {
                    const vObj = { ...v, imageAssets: [] as any[] };
                    if (!vObj.variant_name) vObj.variant_name = "Standard";
                    
                    processedVariants.push(vObj);

                    const variantImageUrls = (v.variant_images || '').split(',').map((u: string) => u.trim()).filter(Boolean);
                    
                    variantImageUrls.forEach((url: string) => {
                        allImageTasks.push(async () => {
                            const asset = await uploadImageWithRetry(url, `${parentData.slug}-v${vIndex}`);
                            if(asset) {
                                vObj.imageAssets.push({ 
                                    _key: `vimg_${Math.random().toString(36).substring(7)}`, 
                                    _type: 'image', 
                                    asset: { _type: 'reference', _ref: asset._id } 
                                });
                            }
                        });
                    });
                }
            }
            await runWithConcurrency(allImageTasks, MAX_CONCURRENT_UPLOADS);

            // D. CREATE PRODUCT
            const newProduct: any = {
                _type: 'product',
                title: title,
                slug: { _type: 'slug', current: parentData.slug },
                videoUrl: parentData.videoUrl,
                // Handle Description: String -> Portable Text (Block)
                description: parentData.description 
                    ? [{
                        _type: 'block',
                        style: 'normal',
                        _key: `desc_${Math.random().toString(36).substring(7)}`,
                        children: [{ _type: 'span', text: parentData.description }]
                      }]
                    : [],
                
                // 🔥 UPDATED: Use parseSpecificationsToKeyVal instead of Portable Text
                // This ensures it matches your Schema: {label: string, value: string}[]
                specifications: parseSpecificationsToKeyVal(parentData.specifications),

                brand: brandRef,
                categories: categoryRefs,
                isBestSeller: Boolean(parentData.isBestSeller),
                isNewArrival: Boolean(parentData.isNewArrival),
                isFeatured: Boolean(parentData.isFeatured),
                isOnDeal: Boolean(parentData.isOnDeal),
                rating: safeFloat(parentData.rating), 

                variants: processedVariants.map((v, idx) => ({
                    _type: 'productVariant',
                    _key: `var_${Date.now()}_${idx}`,
                    name: v.variant_name,
                    sku: v.variant_sku,
                    price: safeFloat(v.variant_price),
                    salePrice: v.variant_salePrice ? safeFloat(v.variant_salePrice) : undefined,
                    stock: safeInt(v.variant_stock),
                    inStock: v.variant_inStock !== undefined ? Boolean(v.variant_inStock) : (safeInt(v.variant_stock) > 0),
                    images: v.imageAssets,
                    
                    attributes: parseCsvAttributes(v),
                    
                    weight: v.variant_weight ? safeFloat(v.variant_weight) : undefined,
                    dimensions: (v.variant_height || v.variant_width) ? { 
                        _type: 'dimensions', 
                        height: safeFloat(v.variant_height), 
                        width: safeFloat(v.variant_width), 
                        depth: safeFloat(v.variant_depth) 
                    } : undefined,
                }))
            };

            await writeClient.create(newProduct);
            successfulCount++;
            
        } catch (error: any) {
            failedCount++;
            errors.push(`Error creating "${title}": ${error.message}`);
            console.error(`Batch Error for ${title}:`, error);
        }
    }

    revalidatePath('/Bismillah786/products');
    revalidatePath('/');

    return {
        success: failedCount === 0,
        message: `Import Completed. Created: ${successfulCount}, Failed: ${failedCount}`,
        successful: successfulCount,
        failed: failedCount,
        errors,
    };
}