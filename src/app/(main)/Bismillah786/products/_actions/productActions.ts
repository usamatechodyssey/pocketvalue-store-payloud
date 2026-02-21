
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