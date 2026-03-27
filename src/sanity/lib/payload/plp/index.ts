
import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { mapPayloadProductToSanity } from './productMapper';
import { buildProductQuery } from './queryBuilder';
import { getPayloadReviewsForProduct } from '../review.queries';

interface SearchOptions {
    searchTerm?: string;
    categorySlug?: string;
    campaignSlug?: string;
    isDeal?: boolean;
    filters?: any;
    minPrice?: number;
    maxPrice?: number;
    sortOrder?: string;
    page?: number;
}

// 🔥 HELPER: Recursive Category Finder
// Ye function kisi bhi category ke saare bachon (descendants) ki IDs nikal kar layega
const getAllDescendantIds = async (payload: any, parentSlug: string) => {
    // 1. Parent Category dhundo
    const parent = await payload.find({
        collection: 'categories',
        where: { slug: { equals: parentSlug } },
    });

    if (parent.docs.length === 0) return [];

    const parentId = parent.docs[0].id;
    let allIds = [parentId];

    // 2. Is parent ke direct children dhoondo
    let children = await payload.find({
        collection: 'categories',
        where: { parent: { equals: parentId } },
        limit: 100,
    });

    // 3. Har child ke bhi children dhoondo (Loop)
    while (children.docs.length > 0) {
        const childIds = children.docs.map((c: any) => c.id);
        allIds = [...allIds, ...childIds];

        // Next level fetch karo
        children = await payload.find({
            collection: 'categories',
            where: { parent: { in: childIds } },
            limit: 100,
        });
    }

    return allIds;
};

export const getPayloadProducts = async (options: SearchOptions) => {
    const payload = await getPayload({ config: configPromise });
    const { page = 1, sortOrder, filters, campaignSlug, searchTerm, categorySlug } = options;

    // --- PRE-FETCHING LOGIC ---

    // 1. Recursive Categories IDs
    let targetCategoryIds: string[] = [];
    if (categorySlug) {
        targetCategoryIds = await getAllDescendantIds(payload, categorySlug);
    }

    // 2. Brand Search IDs (Agar user ne brand search kiya hai)
    let matchingBrandIds: string[] = [];
    if (searchTerm) {
        const brandResults = await payload.find({
            collection: 'brands',
            where: { name: { contains: searchTerm } }, // Brand name match karo
            limit: 20
        });
        matchingBrandIds = brandResults.docs.map((b: any) => b.id);
    }

    // 3. Campaign Logic
    const queryOptions = {
        ...options,
        categoryIds: targetCategoryIds, // Pass the full tree
        brandIds: matchingBrandIds // Pass matching brands
    };
    
    // Campaign specific filter add karna
    const where = buildProductQuery(queryOptions);

    if (campaignSlug) {
        const campaigns = await payload.find({
            collection: 'campaigns',
            where: { slug: { equals: campaignSlug } }
        });
        if (campaigns.docs.length > 0) {
             where.and?.push({ activeCampaigns: { in: [campaigns.docs[0].id] } });
        }
    }
    
    // Brand Filters (Checkbox wale)
    if (filters?.brands?.length > 0) {
        const brands = await payload.find({
            collection: 'brands',
            where: { slug: { in: filters.brands } }
        });
        const brandIds = brands.docs.map((b: any) => b.id);
        if (brandIds.length > 0) {
            where.and?.push({ brand: { in: brandIds } });
        }
    }

    // --- SORTING ---
    let sort = '-createdAt';
    if (sortOrder === 'price-low-to-high') sort = 'variants.price';
    if (sortOrder === 'price-high-to-low') sort = '-variants.price';
    if (sortOrder === 'best-selling') sort = '-rating'; 

    // --- FINAL QUERY ---
    const result = await payload.find({
        collection: 'products',
        where,
        sort,
        page,
        limit: 40,
        depth: 2
    });

    const productsWithRatings = await Promise.all(result.docs.map(async (doc) => {
        const reviews = await getPayloadReviewsForProduct(doc.id);
        return mapPayloadProductToSanity(doc, reviews);
    }));

    return {
        products: productsWithRatings,
        totalCount: result.totalDocs
    };
};