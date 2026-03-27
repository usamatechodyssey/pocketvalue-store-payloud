// src/sanity/lib/queries.ts
import { ShippingRule } from "@/types";
import SanityProduct, { BreadcrumbItem } from "../types/product_types";
import { client } from "./client";
import groq from "groq";
import { cache } from "react";

// === Product Fields Fragment (No Changes) ===
const productFields = groq`
  _id,
  title,
  _createdAt,
  "slug": slug.current,
  videoUrl,
  isBestSeller,
  isNewArrival,
   isOnDeal, // Naya field yahan add hua
  isFeatured,
  brand->{ _id, name, "slug": slug.current, logo },
  description,
  specifications,
  shippingAndReturns,
  "categoryIds": categories[]->_id,
  "variants": variants[]{
    _key, name, sku, price, salePrice, stock, inStock, images, weight, dimensions,
    attributes[]{ _key, name, value }
  },
  "defaultVariant": variants[0], 
  "rating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && isApproved == true].rating), rating, 0),
  "reviewCount": count(*[_type == "review" && product._ref == ^._id && isApproved == true])
`;

// === NEW QUERY FOR PRODUCT METADATA ===
export const GET_PRODUCT_METADATA = groq`
*[_type == "product" && slug.current == $slug][0] {
  title,
  "slug": slug.current,
  "description": pt::text(description),
  "image": variants[0].images[0],
  seo
}`;

// === FINAL, GUARANTEED WORKING "SUPER QUERY" FOR CATEGORY PLP ===
export const GET_CATEGORY_PLP_DATA = groq`
  *[_type == "category" && slug.current == $slug][0] {
    "currentCategory": { 
      _id, name, "slug": slug.current, desktopBanner, mobileBanner, description 
    },
    "grandparentRef": parent->parent._ref,
    "parentTree": parent->{
      _id, name, "slug": slug.current,
      "subCategories": *[_type=="category" && parent._ref == ^._id] | order(name asc) {
        _id, name, "slug": slug.current
      }
    },
    "selfTree": {
      _id, name, "slug": slug.current,
      "subCategories": *[_type=="category" && parent._ref == ^._id] | order(name asc) {
        _id, name, "slug": slug.current
      }
    },
    
    // --- PRODUCTS & FILTERS (PAGINATION YAHAN ADD HUI HAI) ---
    "initialProducts": *[
      _type == "product" && (
        $slug in categories[]->slug.current ||
        $slug in categories[]->parent->slug.current ||
        $slug in categories[]->parent->parent->slug.current
      )
    ] | order(_createdAt desc) [0...40] { // <-- FIX: Sirf pehle 12 products
      ${productFields}
    },

    // Naya: Total count bhi shuru mein hi le lein
    "totalCount": count(*[
      _type == "product" && (
        $slug in categories[]->slug.current ||
        $slug in categories[]->parent->slug.current ||
        $slug in categories[]->parent->parent->slug.current
      )
    ]),

    "filterData": {
      "brands": array::unique(*[
        _type == "product" && (
          $slug in categories[]->slug.current ||
          $slug in categories[]->parent->slug.current ||
          $slug in categories[]->parent->parent->slug.current
        )
      ].brand->{
        _id, name, "slug": slug.current
      }),
      "attributes": *[
        _type == "product" && (
          $slug in categories[]->slug.current ||
          $slug in categories[]->parent->slug.current ||
          $slug in categories[]->parent->parent->slug.current
        )
      ].variants[].attributes[]{
        name,
        value
      },
      "priceRange": {
        "min": math::min(*[
          _type == "product" && (
            $slug in categories[]->slug.current ||
            $slug in categories[]->parent->slug.current ||
            $slug in categories[]->parent->parent->slug.current
          )
        ].variants[].price),
        "max": math::max(*[
          _type == "product" && (
            $slug in categories[]->slug.current ||
            $slug in categories[]->parent->slug.current ||
            $slug in categories[]->parent->parent->slug.current
          )
        ].variants[].price)
      }
    }
  }
`;

// === NEW QUERY FOR CATEGORY METADATA ===
export const GET_CATEGORY_METADATA = groq`
*[_type == "category" && slug.current == $slug][0] {
  name,
  "slug": slug.current,
  "description": pt::text(description), // Plain text version of description
  "image": coalesce(desktopBanner, mobileBanner, image), // Fallback for image
  seo
}`;

// === NAYI "SUPER QUERY" FOR SEARCH PLP ===
export const GET_SEARCH_PLP_DATA = async (searchTerm: string) => {
  const trimmed = searchTerm?.trim();
  if (!trimmed)
    return { initialProducts: [], filterData: null, categoryTree: null };

  const query = groq`{
      "productIds": *[_type == "product" && (title match $term || brand->name match $term || categories[]->name match $term)]._id,
      "filterData": {
        "brands": array::unique(*[_type == "product" && (title match $term)].brand->{
           _id, name, "slug": slug.current
        }),
        "attributes": *[_type == "product" && (title match $term)].variants[].attributes[]{
          name, value
        },
        "priceRange": {
          "min": math::min(*[_type == "product" && (title match $term)].variants[].price),
          "max": math::max(*[_type == "product" && (title match $term)].variants[].price)
        }
      }
    }`;
  const { productIds, filterData } = await client.fetch(query, {
    term: `*${trimmed}*`,
  });

  const initialProducts = await getProductsByIds(productIds);
  // Search page ke liye categoryTree null rahega
  return { initialProducts, filterData, categoryTree: null };
};

// Helper function to fetch products by IDs
export const getProductsByIds = async (productIds: string[]) => {
  if (!productIds || productIds.length === 0) return [];
  const query = groq`*[_type == "product" && _id in $productIds] { ${productFields} }`;
  return await client.fetch(query, { productIds });
};

// --- AAPKE TAMAM PURANE, BEHTAREEN FUNCTIONS WESE HI RAHENGE ---
// Hum inhein bilkul nahi chherenge taake aapki baaqi site chalti rahe.

export const getAllProducts = async () => {
  const query = groq`*[_type == "product"]{ ${productFields} }`;
  return await client.fetch(query);
};

export const getTopBrands = async () => {
  const query = groq`*[_type == "brand"][0...8]{
    _id,
    name,
    "slug": slug.current,
    logo
  }`;
  return await client.fetch(query);
};

// === WISHLIST KE LIYE NAYI, POWERFUL QUERY ===
// Yeh query na sirf rating, balke live price aur stock bhi layegi
// === WISHLIST KE LIYE NAYI, POWERFUL QUERY (FINAL FIX) ===
export const getLiveProductDataForCards = async (
  productIds: string[],
): Promise<SanityProduct[]> => {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  const query = groq`
      *[_type == "product" && _id in $productIds] {
        _id,
        title,
        "slug": slug.current,
        description,
        brand->{ _id, name, "slug": slug.current, logo },
        
        // Rating calculation
        "rating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && isApproved == true].rating), rating, 0),
        "reviewCount": count(*[_type == "review" && product._ref == ^._id && isApproved == true]),
        
        // Variants full data
        "variants": variants[]{
            _key, name, sku, price, salePrice, stock, inStock, images, weight, dimensions,
            attributes[]{ _key, name, value }
        },
        
        // 🔥 FIX: Default variant mein 'attributes' add kiye hain taaki selector crash na ho
        "defaultVariant": variants[0]{
          _key, name, price, salePrice, inStock, images,
          attributes[]{ _key, name, value } 
        }
      }
    `;
  return await client.fetch(query, { productIds });
};

export async function getSingleProduct(slug: string) {
  const query = groq`*[_type == "product" && slug.current == $slug][0] { 
    ${productFields},
    "categories": categories[]->{ _id, name, "slug": slug.current },
    // Reviews hamesha is query mein alag se, order ke saath fetch honge
    "reviews": *[_type == "review" && product._ref == ^._id && isApproved == true] | order(_createdAt desc)
  }`;
  return await client.fetch(query, { slug });
}

// === NAYA FUNCTION: RELATED PRODUCTS KE LIYE ===
export const getRelatedProducts = async (
  currentProductId: string,
  categoryIds: string[],
) => {
  if (!categoryIds || categoryIds.length === 0) return [];

  // Yeh query ussi category ke baaki products layegi, lekin current product ko chhor kar
  const query = groq`
    *[_type == "product" && count((categories[]->_id)[@ in $categoryIds]) > 0 && _id != $currentProductId][0...10] {
      ${productFields}
    }
  `;
  return await client.fetch(query, { categoryIds, currentProductId });
};

// export const HOMEPAGE_DATA_QUERY = groq`{
//     "featuredProductsTitle": "Featured Products",
//     "featuredProducts": *[_type == "product" && isFeatured == true] | order(_createdAt desc)[0...12] { ${productFields} },

//     "bestSellersTitle": "Best Sellers",
//     "bestSellers": *[_type == "product" && isBestSeller == true] | order(rating desc, reviewCount desc)[0...12]{ ${productFields} },

//     "newArrivalsTitle": "New Arrivals",
//     "newArrivals": *[_type == "product"] | order(_createdAt desc)[0...12]{ ${productFields} },

//     // === YAHAN NAYA CODE ADD HUA HAI ===
//     "sectionBanners": *[_type == "homepage" && _id == "homepage"][0].sectionBanners,
//     // ===================================

//     "featuredCategoriesData": *[_type == "homepage" && _id == "homepage"][0] {
//         featuredCategoriesTitle,
//         "featuredCategories": featuredCategories[]->{ _id, name, "slug": slug.current, "image": image.asset->url },
//         categoryGridTitle,
//         "categoryGrid": categoryGrid[]{
//           _key,
//           discountText,
//           category->{
//             _id,
//             name,
//             "slug": slug.current,
//             image
//           }
//         }
//     }
// }`;

// === YAHAN ASAL TABDEELI HAI ===
// Humne har level ki sub-category ke saath uski image fetch karne ka code add kar diya hai.
export const getNavigationCategories = async () => {
  const query = groq`
    *[_type == "category" && !defined(parent)] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      "image": image.asset->url, // Main category ki image (agar zaroorat pade)
      "subCategories": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
        _id,
        name,
        "slug": slug.current,
        "image": image.asset->url, // Level 2 ki image
        "subCategories": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
          _id,
          name,
          "slug": slug.current,
          "image": image.asset->url // Level 3 ki image
        }
      }
    }
  `;
  return await client.fetch(query);
};

export const getCategoryPageData = async (slugPath: string[]) => {
  const currentSlug = slugPath[slugPath.length - 1];
  const query = groq`
    *[_type == "category" && slug.current == $currentSlug][0] {
      "currentCategory": {
        _id, // _id bhi fetch karein
        name,
        "slug": slug.current,
        // === NAYE FIELDS YAHAN FETCH KIYE GAYE HAIN ===
         "desktopBanner": desktopBanner,
        "mobileBanner": mobileBanner,
        "description": description,
        // ===========================================
        "products": *[_type == "product" && references(^._id)] { ${productFields} },
        "subCategories": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
          _id, name, "slug": slug.current, "image": image.asset->url
        }
      },
      "categoryTree": coalesce(parent->parent->parent, parent->parent, parent, @) {
        _id, name, "slug": slug.current,
        "subCategories": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
          _id, name, "slug": slug.current,
          "subCategories": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
            _id, name, "slug": slug.current,
            "subCategories": *[_type == "category" && parent._ref == ^._id] | order(name asc) {
              _id, name, "slug": slug.current
            }
          }
        }
      }
    }
  `;
  const result = await client.fetch(query, { currentSlug });
  return result || { currentCategory: null, categoryTree: null };
};
const PRODUCTS_PER_PAGE = 40;
// src/sanity/lib/queries.ts

// ... (Baki upar ka code wese hi rahega, imports etc)

// === UPDATED SEARCH FUNCTION (SAFE & NON-DESTRUCTIVE) ===
export const searchProducts = async (
  options: {
    searchTerm?: string;
    categorySlug?: string;
    campaignSlug?: string;
    isDeal?: boolean;
    filters?: {
      brands?: string[];
      categories?: string[];
      availability?: string[]; // ✨ NEW: Stock Status
      isOnSale?: boolean; // ✨ NEW: Sale Status
      minRating?: number; // ✨ NEW: Star Rating
      [key: string]: any;
    };
    minPrice?: number;
    maxPrice?: number;
    sortOrder?: string;
    page?: number;
  } = {},
) => {
  const {
    searchTerm,
    categorySlug,
    campaignSlug,
    isDeal,
    filters = {}, // Default empty object
    minPrice,
    maxPrice,
    sortOrder = "best-match",
    page = 1,
  } = options;

  const params: { [key: string]: any } = {};

  // Base Conditions
  const conditions: string[] = [`_type == "product"`, `count(variants) > 0`];
  const variantConditions: string[] = [];

  // 1. Campaign & Context Logic
  if (campaignSlug) {
    conditions.push(
      `references(*[_type=="campaign" && slug.current == $campaignSlug]._id)`,
    );
    params.campaignSlug = campaignSlug;
  }
  if (isDeal) {
    conditions.push(`isOnDeal == true`);
  }

  // 2. Sort-Specific Pre-filtering
  if (sortOrder === "newest" && !searchTerm)
    conditions.push(`isNewArrival == true`);
  if (sortOrder === "best-selling" && !searchTerm)
    conditions.push(`isBestSeller == true`);

  // 3. ✨ NEW: Rating Filter Logic
  if (typeof filters.minRating === "number" && filters.minRating > 0) {
    // Check karo ke product ki rating required rating se bari ya barabar ho
    conditions.push(`rating >= $minRating`);
    params.minRating = filters.minRating;
  }

  // 4. Existing Standard Filters
  if (filters.isFeatured === true && !searchTerm)
    conditions.push(`isFeatured == true`);

  if (categorySlug) {
    conditions.push(
      `($categorySlug in categories[]->slug.current || $categorySlug in categories[]->parent->slug.current || $categorySlug in categories[]->parent->parent->slug.current)`,
    );
    params.categorySlug = categorySlug;
  }
  if (searchTerm?.trim()) {
    conditions.push(
      `(title match $searchTerm || brand->name match $searchTerm)`,
    );
    params.searchTerm = `*${searchTerm.trim()}*`;
  }
  if (filters.brands && filters.brands.length > 0) {
    conditions.push(`brand->slug.current in $brands`);
    params.brands = filters.brands;
  }
  if (filters.categories && filters.categories.length > 0) {
    conditions.push(
      `count((categories[]->slug.current)[@ in $categories]) > 0`,
    );
    params.categories = filters.categories;
  }

  // 5. Price Filters
  if (typeof minPrice === "number") {
    variantConditions.push(`coalesce(salePrice, price) >= $minPrice`);
    params.minPrice = minPrice;
  }
  if (typeof maxPrice === "number" && maxPrice !== Infinity && maxPrice > 0) {
    variantConditions.push(`coalesce(salePrice, price) <= $maxPrice`);
    params.maxPrice = maxPrice;
  }

  // 6. ✨ NEW: Availability (In Stock) Logic
  if (filters.availability && filters.availability.length > 0) {
    // Agar user "In Stock" select kare
    if (filters.availability.includes("in-stock")) {
      variantConditions.push(`inStock == true`);
    }
    // Note: "Out of stock" hum usually show nahi karte unless specifically asked,
    // lekin agar logic chahiye to yahan else if add kar sakte hain.
  }

  // 7. ✨ NEW: Promotions (On Sale) Logic
  if (filters.isOnSale) {
    // Check karo agar salePrice defined hai aur wo original price se kam hai
    variantConditions.push(`defined(salePrice) && salePrice < price`);
  }

  // 8. Dynamic Attribute Filters (Colors, Sizes etc)
  const attributeFilters = Object.entries(filters).filter(
    ([key, values]) =>
      ![
        "brands",
        "isFeatured",
        "categories",
        "availability",
        "isOnSale",
        "minRating",
      ].includes(key) &&
      Array.isArray(values) &&
      values.length > 0,
  );

  attributeFilters.forEach(([key, values]) => {
    const paramName = `${key.toLowerCase()}Values`;
    variantConditions.push(
      `count(attributes[lower(name) == "${key.toLowerCase()}" && lower(value) in $${paramName}]) > 0`,
    );
    params[paramName] = (values as string[]).map((v) => v.toLowerCase());
  });

  // Combine Variant Conditions
  if (variantConditions.length > 0) {
    conditions.push(`count(variants[${variantConditions.join(" && ")}]) > 0`);
  }

  // 9. Final Query Assembly
  const queryFilter = `*[${conditions.join(" && ")}]`;

  let ordering = "";
  switch (sortOrder) {
    case "price-low-to-high":
      ordering =
        "| order(coalesce(variants[0].salePrice, variants[0].price) asc)";
      break;
    case "price-high-to-low":
      ordering =
        "| order(coalesce(variants[0].salePrice, variants[0].price) desc)";
      break;
    case "newest":
      ordering = "| order(_createdAt desc)";
      break;
    case "best-selling":
      ordering = "| order(isBestSeller desc, rating desc, reviewCount desc)";
      break;
    // New Sort Option for Rating
    case "rating-high":
      ordering = "| order(rating desc)";
      break;
    default:
      if (searchTerm?.trim()) {
        ordering =
          "| score(boost(title match $searchTerm, 10)) | order(_score desc)";
      } else {
        ordering = "| order(_createdAt desc)";
      }
      break;
  }

  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = page * PRODUCTS_PER_PAGE;
  const pagination = `[${start}...${end}]`;

  const finalQuery = groq`{
    "products": ${queryFilter} ${ordering} ${pagination} { ${productFields} },
    "totalCount": count(${queryFilter})
  }`;

  const results = await client.fetch(finalQuery, params);
  return results;
};

// export const searchProducts = async (
//   options: {
//     searchTerm?: string;
//     categorySlug?: string;
//      campaignSlug?: string; // <-- ADD THIS
//     isDeal?: boolean; // Naya parameter
//     filters?: { [key:string]: any };
//     minPrice?: number;
//     maxPrice?: number;
//     sortOrder?: string;
//     page?: number;
//   } = {}
// ) => {
//   const {
//     searchTerm,
//     categorySlug,
//     campaignSlug, // <-- Destructure
//     isDeal, // Naya parameter
//     filters = {},
//     minPrice,
//     maxPrice,
//     sortOrder = 'best-match',
//     page = 1,
//   } = options;

//   // // --- DEBUGGING STEP #4: Check the final parameters inside the query function ---
//   // console.log("--- [DEBUG] Sanity Query: Received options ---", JSON.stringify(options, null, 2));
//   // // --------------------------------------------------------------------------------

//   const params: { [key: string]: any } = {};
//   const conditions: string[] = [`_type == "product"`, `count(variants) > 0`];
//   const variantConditions: string[] = [];

//    // Logic Add karein:
//   if (campaignSlug) {
//      // Find campaign ID by slug first (sub-query)
//      conditions.push(`references(*[_type=="campaign" && slug.current == $campaignSlug]._id)`);
//      params.campaignSlug = campaignSlug;
//   }

//   // Context-based conditions
//   if (isDeal) {
//       conditions.push(`isOnDeal == true`);
//   }
//   if (sortOrder === 'newest' && !searchTerm) {
//       conditions.push(`isNewArrival == true`);
//   }
//   if (sortOrder === 'best-selling' && !searchTerm) {
//       conditions.push(`isBestSeller == true`);
//   }
//   if (filters?.isFeatured === true && !searchTerm) {
//       conditions.push(`isFeatured == true`);
//   }

//   // Standard Filters
//   if (categorySlug) {
//     conditions.push(`($categorySlug in categories[]->slug.current || $categorySlug in categories[]->parent->slug.current || $categorySlug in categories[]->parent->parent->slug.current)`);
//     params.categorySlug = categorySlug;
//   }
//   if (searchTerm?.trim()) {
//     conditions.push(`(title match $searchTerm || brand->name match $searchTerm)`);
//     params.searchTerm = `*${searchTerm.trim()}*`;
//   }
//   if (filters.brands && filters.brands.length > 0) {
//     conditions.push(`brand->slug.current in $brands`);
//     params.brands = filters.brands;
//   }

//   // --- This is where the bug likely is ---
//   // We will check if this logic is ever reached
//   if (filters.categories && filters.categories.length > 0) {
//     // console.log("--- [DEBUG] Sanity Query: Applying CATEGORY filter ---", filters.categories);
//     conditions.push(`count((categories[]->slug.current)[@ in $categories]) > 0`);
//     params.categories = filters.categories;
//   }
//   // ---

//   if (typeof minPrice === 'number') {
//     variantConditions.push(`coalesce(salePrice, price) >= $minPrice`);
//     params.minPrice = minPrice;
//   }
//   if (typeof maxPrice === 'number' && maxPrice !== Infinity && maxPrice > 0) {
//     variantConditions.push(`coalesce(salePrice, price) <= $maxPrice`);
//     params.maxPrice = maxPrice;
//   }

//   const attributeFilters = Object.entries(filters).filter(([key, values]) => !['brands', 'isFeatured', 'categories'].includes(key) && Array.isArray(values) && values.length > 0);
//   attributeFilters.forEach(([key, values]) => {
//     const paramName = `${key.toLowerCase()}Values`;
//     variantConditions.push(`count(attributes[lower(name) == "${key.toLowerCase()}" && lower(value) in $${paramName}]) > 0`);
//     params[paramName] = (values as string[]).map(v => v.toLowerCase());
//   });

//   if (variantConditions.length > 0) {
//     conditions.push(`count(variants[${variantConditions.join(' && ')}]) > 0`);
//   }

//   const queryFilter = `*[${conditions.join(' && ')}]`;

//   let ordering = '';
//   switch (sortOrder) {
//     case 'price-low-to-high': ordering = '| order(coalesce(variants[0].salePrice, variants[0].price) asc)'; break;
//     case 'price-high-to-low': ordering = '| order(coalesce(variants[0].salePrice, variants[0].price) desc)'; break;
//     case 'newest': ordering = '| order(_createdAt desc)'; break;
//     case 'best-selling': ordering = '| order(isBestSeller desc, rating desc, reviewCount desc)'; break;
//     default:
//       if (searchTerm?.trim()) {
//         ordering = '| score(boost(title match $searchTerm, 10)) | order(_score desc)';
//       } else {
//         ordering = '| order(_createdAt desc)';
//       }
//       break;
//   }

//   const start = (page - 1) * PRODUCTS_PER_PAGE;
//   const end = page * PRODUCTS_PER_PAGE;
//   const pagination = `[${start}...${end}]`;

//   const finalQuery = groq`{
//     "products": ${queryFilter} ${ordering} ${pagination} { ${productFields} },
//     "totalCount": count(${queryFilter})
//   }`;

//   // // --- DEBUGGING STEP #5: Log the final query and params sent to Sanity ---
//   // console.log("--- [DEBUG] Sanity Query: Final GROQ Query ---", finalQuery.replace(/\s+/g, ' '));
//   // console.log("--- [DEBUG] Sanity Query: Final Params ---", params);
//   // // -----------------------------------------------------------------------

//   // We remove the filterData part as it's fetched separately now
//   const results = await client.fetch(finalQuery, params);
//   return results;
// };

export const HERO_CAROUSEL_QUERY = groq`
  *[_type == "heroCarousel"] | order(_createdAt asc) {
    _id, title, subtitle, buttonText, link,
    "desktopImage": desktopImage.asset->url,
    "mobileImage": mobileImage.asset->url
  }
`;

// ===============================================
// === NAYI BLOG QUERIES START HERE ===
// ===============================================

// Query #1: Saare blog posts fetch karne ke liye (Blog Homepage ke liye)
export const getAllPosts = async () => {
  const query = groq`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        mainImage,
        excerpt,
        publishedAt,
        "authorName": author->name,
        "authorImage": author->image
      }
    `;
  return await client.fetch(query);
};

export const getSinglePost = async (slug: string) => {
  const query = groq`
      *[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        "slug": slug.current,
        mainImage,
        body,
        publishedAt,
        "author": author->{ name, image, bio },
        "categories": categories[]->{ name, "slug": slug.current }
      }
    `;
  return await client.fetch(query, { slug });
};
// --- NEW PAGINATION FUNCTION & QUERY ---
const POSTS_PER_PAGE = 16; // 9 posts fit nicely in a 3-column grid

export const GET_TOTAL_POST_COUNT = groq`count(*[_type == "post"])`;

export const getPaginatedPosts = async (page: number = 1) => {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = page * POSTS_PER_PAGE;

  const query = groq`
    *[_type == "post"] | order(publishedAt desc) [${start}...${end}] {
      _id,
      title,
      "slug": slug.current,
      mainImage,
      excerpt,
      publishedAt,
      "authorName": author->name,
      "authorImage": author->image
    }
  `;
  return await client.fetch(query);
};

export const GET_SINGLE_POST_FOR_PAGE = groq`
*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  mainImage,
  body,
  publishedAt,
  excerpt,
  "author": author->{ name, image, bio },
  "categories": categories[]->{ _id, name, "slug": slug.current },
  "relatedProductSlugs": relatedProductSlugs,
  seo
}`;

export const getProductsByCategoryName = async (categoryName: string) => {
  if (!categoryName) return [];

  // Yeh query pehle category ko uske naam se dhoondti hai (case-insensitive)
  // Phir us category ke saare products fetch karti hai.
  const query = groq`
    *[_type == "category" && lower(name) == lower($categoryName)][0] {
      "products": *[_type == "product" && references(^._id)] {
        ${productFields} // Hum wahi purana, behtareen fragment istemal kar rahe hain
      }
    }
  `;
  const result = await client.fetch(query, { categoryName });
  // Agar category mili to uske products wapis bhejo, warna khali array
  return result ? result.products : [];
};

// --- Single, Correct Interface for Stock Status ---
interface StockStatus {
  _id: string;
  variants:
    | {
        _key: string;
        inStock: boolean;
        stock?: number;
        price: number;
        salePrice?: number;
      }[]
    | null;
}

// === UPDATED FUNCTION with the correct StockStatus type ===
export async function getProductsStockStatus(
  productIds: string[],
): Promise<StockStatus[]> {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  try {
    const query = groq`
      *[_type == "product" && _id in $productIds] {
        _id,
        "variants": variants[]{ _key, inStock, stock, price, salePrice }
      }
    `;
    const stockStatus = await client.fetch(query, { productIds });
    return stockStatus;
  } catch (error) {
    console.error("Failed to fetch product stock status:", error);
    return [];
  }
}

// 2. NAYI QUERY for Promo / Story Banners
export const PROMO_BANNERS_QUERY = groq`*[_type == "promoBanner"] {
  _id,
  title,
  image, // Poora image object fetch karein taake urlFor kaam kare
  link,
  buttonText
}`;

export const INSTAGRAM_QUERY = groq`*[_type == "instagramFeed" && _id == "instagramFeed"][0] {
  heading,
  subheading,
  instagramHandle,
  gallery[]{
    "alt": alt,
    "asset": asset->
  }
}`;

export const LIFESTYLE_BANNERS_QUERY = groq`
*[_type == "lifestyleBanner"] | order(_createdAt asc) {
  _id,
  title,
  subtitle,
  link,
  buttonText,
  mediaType,
  "desktopImage": desktopImage.asset->url,
  "mobileImage": mobileImage.asset->url,
  
  // === YAHAN ASAL TABDEELI HAI ===
  // Hum dono qisam ke video fields ko fetch kar rahe hain
  "desktopVideoFile": desktopVideoFile.asset->url,
  "mobileVideoFile": mobileVideoFile.asset->url,
  desktopVideoUrl,
  mobileVideoUrl
}`;
// 2. Informational Page Query (For dynamic pages like /about-us)
export const GET_PAGE_QUERY = groq`
*[_type == "page" && slug.current == $slug][0] {
  _id,
  title,
  body
}`;

export const GET_PAGE_DATA = groq`
*[_type == "page" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  body,
  "excerpt": pt::text(body),
  seo
}`;
// 3. FAQ Page Query - (UPDATED)
export const GET_FAQ_QUERY = groq`
*[_type == "faq" && _id == "faqPage"][0] {
  _id,
  title,
  faqList[]{
    _key,
    question,
    answer
  },
  seo
}`;

export const COUPON_BANNER_QUERY = groq`
  *[_type == "couponBanner"]{
    _id,
    link->{ _type, slug },
    mediaType,
    mediaUrls {
      mobile { asset->{url} },
      tablet { asset->{url} },
      desktop { asset->{url} }
    },
    width,
    height,
    objectFit,
    altText
  }
`;

// src/sanity/lib/queries.ts (UPDATE THIS FUNCTION)

export const getProductsBySlugs = async (
  slugs: string[],
): Promise<SanityProduct[]> => {
  // === DEBUGGING KE LIYE NAYI LINE ===
  console.log(
    "DEBUG 2: Sanity se in slugs ke products maange ja rahe hain:",
    slugs,
  );
  // ==================================

  if (!slugs || slugs.length === 0) {
    return [];
  }
  const query = groq`
      *[_type == "product" && slug.current in $slugs] {
        ${productFields}
      }
    `;
  const products = await client.fetch(query, { slugs });

  // API se anay wale slugs ki tarteeb barqarar rakhna
  const sortedProducts = slugs
    .map((slug) => products.find((p: SanityProduct) => p.slug === slug))
    .filter(Boolean) as SanityProduct[];
  return sortedProducts;
};
// === NEW FUNCTION FOR INFINITE SCROLL ===
export const getPaginatedProducts = async (page: number, limit: number) => {
  const start = (page - 1) * limit;
  const end = page * limit;

  // GROQ ki slicing [start...end] bohot powerful hai
  const query = groq`
    *[_type == "product"] | order(_createdAt desc) [${start}...${end}] {
      ${productFields} // Wahi purana, behtareen product fragment
    }
  `;
  return await client.fetch(query);
};
// === NEW QUERY FOR FLASH SALE ===
export const FLASH_SALE_QUERY = groq`
*[_type == "flashSale" && _id == "flashSale" && isEnabled == true][0] {
  title,
  endDate,
  // Hum product references ko expand karke unki poori details fetch karenge
  "products": products[]->{
    ${productFields} // Wahi purana, behtareen product fragment
  }
}`;
export const getSearchSuggestions = async () => {
  const query = groq`
    *[_type == "settings" && _id == "settings"][0] {
      "trendingKeywords": searchSettings.trendingKeywords,
      "popularCategories": searchSettings.popularCategories[]->{
        _id,
        name,
        "slug": slug.current,
        "image": image.asset->url
      }
    }
  `;
  return await client.fetch(query);
};
// === NAYA FUNCTION: DEALS PAGE KE LIYE ===
export const GET_DEALS_PLP_DATA = groq`{
  // Pehle 12 products fetch karein jo deal per hain
  "initialProducts": *[_type == "product" && isOnDeal == true] | order(_createdAt desc) [0...${PRODUCTS_PER_PAGE}] {
    ${productFields}
  },
  // Deal products ki total tadaad
  "totalCount": count(*[_type == "product" && isOnDeal == true]),

  // Sirf deal products se filter data banayein
  "filterData": {
    "brands": array::unique(*[
      _type == "product" && isOnDeal == true
    ].brand->{
      _id, name, "slug": slug.current
    }),
    "attributes": *[
      _type == "product" && isOnDeal == true
    ].variants[].attributes[]{
      name,
      value
    },
    "priceRange": {
      "min": math::min(*[
        _type == "product" && isOnDeal == true
      ].variants[].price),
      "max": math::max(*[
        _type == "product" && isOnDeal == true
      ].variants[].price)
    }
  },

  // === NAYA DATA YAHAN ADD HUA HAI ===
  // Sirf un categories ko unique karke lao jinmein deals mojood hain
  "dealCategories": array::unique(
    *[_type == "product" && isOnDeal == true].categories[]->{
      _id,
      name,
      "slug": slug.current
    }
  )
}`;

// --- NAYA, BEHTAR FUNCTION FILTER DATA KE LIYE ---
export const GET_FILTER_DATA_FOR_PLP = async (
  options: {
    searchTerm?: string;
    categorySlug?: string;
    sortOrder?: string;
    isFeatured?: boolean;
  } = {},
) => {
  const { searchTerm, categorySlug, sortOrder, isFeatured } = options;

  const params: { [key: string]: any } = {};
  const conditions: string[] = [`_type == "product"`, `count(variants) > 0`];

  // Bilkul wahi conditions jo searchProducts mein hain
  if (sortOrder === "newest") conditions.push(`isNewArrival == true`);
  if (sortOrder === "best-selling") conditions.push(`isBestSeller == true`);
  if (isFeatured) conditions.push(`isFeatured == true`);

  if (categorySlug) {
    conditions.push(
      `($categorySlug in categories[]->slug.current || $categorySlug in categories[]->parent->slug.current || $categorySlug in categories[]->parent->parent->slug.current)`,
    );
    params.categorySlug = categorySlug;
  }
  if (searchTerm?.trim()) {
    conditions.push(
      `(title match $searchTerm || brand->name match $searchTerm)`,
    );
    params.searchTerm = `*${searchTerm.trim()}*`;
  }

  const queryFilter = `*[${conditions.join(" && ")}]`;

  const filterQuery = groq`{
      "brands": array::unique(${queryFilter}.brand->{
         _id, name, "slug": slug.current
      }),
      "attributes": ${queryFilter}.variants[].attributes[]{
        name, value
      },
      "priceRange": {
        "min": math::min(${queryFilter}.variants[].price),
        "max": math::max(${queryFilter}.variants[].price)
      }
    }`;

  return await client.fetch(filterQuery, params);
};

// === NEW QUERY FOR COUPON VERIFICATION (No changes, but keep it here) ===
export const GET_COUPON_BY_CODE = groq`
  *[_type == "coupon" && code == $code && isActive == true][0] {
    _id,
    code,
    discountType,
    discountValue,
    maximumDiscount,
    minimumPurchaseAmount,
    startDate,
    expiryDate,
    totalUsageLimit,
    usageLimitPerUser, 
    isStackable,
    applicableTo,
    // Fetch IDs for validation
    "applicableProductIds": applicableProducts[]->_id,
    "applicableCategoryIds": applicableCategories[]->_id
  }
`;

// === UPDATED QUERY FOR RULE-BASED SHIPPING ===
// This query now aliases _key to _id for a stable, unique identifier.
export const GET_SHIPPING_RULES = groq`
  *[_type == "settings" && _id == "settings"][0] {
    "shippingRules": shippingRules[]{
      "_id": _key,
      name,
      minAmount,
      cost,
      isOnCall  
    }
  }
`;

// === UPDATED HELPER FUNCTION TO FETCH THE RULES ===
export async function getShippingRules(): Promise<ShippingRule[]> {
  try {
    const result = await client.fetch(GET_SHIPPING_RULES);
    if (!result || !result.shippingRules) return [];
    const sortedRules = result.shippingRules.sort(
      (a: ShippingRule, b: ShippingRule) => b.minAmount - a.minAmount,
    );
    return sortedRules;
  } catch (error) {
    console.error("Failed to fetch shipping rules from Sanity:", error);
    return [];
  }
}

// =========================================================
// === UPDATED SETTINGS QUERY & TYPE ===
// =========================================================

export interface GlobalSettings {
  siteName?: string;
  siteLogo?: any;
  storeContactEmail?: string;
  storePhoneNumber?: string;
  storeAddress?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  topBarAnnouncements?: string[];
  // === NEW FIELD ADDED HERE ===
  secondaryNavLinks?: {
    label: string;
    url: string;
    position: "left" | "right";
    isHighlight: boolean;
  }[];
  // ============================
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}

const GET_GLOBAL_SETTINGS_QUERY = groq`
  *[_type == "settings" && _id == "settings"][0] {
    siteName,
    siteLogo,
    storeContactEmail,
    storePhoneNumber,
    storeAddress,
    socialLinks {
      facebook,
      instagram,
      twitter
    },
    topBarAnnouncements,
    // === NEW FIELD FETCHED HERE ===
    secondaryNavLinks[] {
      label,
      url,
      position,
      isHighlight
    },
    // ==============================
    seo
  }
`;

export const getGlobalSettings = cache(async (): Promise<GlobalSettings> => {
  try {
    const settings = await client.fetch(GET_GLOBAL_SETTINGS_QUERY);
    return settings || {};
  } catch (error) {
    console.error("Failed to fetch global settings:", error);
    return {};
  }
});
// =========================================================
// === NEW BREADCRUMB GENERATION LOGIC STARTS HERE ===
// =========================================================

/**
 * A reusable GROQ query that recursively fetches the parent categories of a given category slug.
 * It traverses up to 4 levels deep (e.g., L4 -> L3 -> L2 -> L1).
 * The resulting `path` will be an array of category objects in reverse order (from parent to child).
 */
export const GET_BREADCRUMB_PATH_QUERY = groq`
  *[_type == 'category' && slug.current == $slug][0] {
    "path": [
      parent->parent->parent->{name, "slug": slug.current},
      parent->parent->{name, "slug": slug.current},
      parent->{name, "slug": slug.current},
      {name, "slug": slug.current}
    ]
  }
`;

/**
 * A versatile, server-side function to generate a complete breadcrumb trail for any page type.
 * @param type - The type of the current page ('product', 'category', or a static page title).
 * @param slug - The slug of the product or category. Not needed for static pages.
 * @returns A promise that resolves to an array of BreadcrumbItem objects.
 */
export const getBreadcrumbs = cache(
  async (
    type:
      | "product"
      | "category"
      | "page"
      | "deals"
      | "search"
      | "blog"
      | "contact-us"
      | "faq",
    slug?: string,
  ): Promise<BreadcrumbItem[]> => {
    const breadcrumbs: BreadcrumbItem[] = [{ name: "Home", href: "/" }];

    try {
      if ((type === "product" || type === "category") && slug) {
        // For products, find their primary category first. For categories, use the slug directly.
        const categorySlugQuery =
          type === "product"
            ? groq`*[_type == 'product' && slug.current == $slug][0]{ "categorySlug": categories[0]->slug.current }`
            : groq`*[_type == 'category' && slug.current == $slug][0]{ "categorySlug": slug.current }`;

        const result = await client.fetch<{ categorySlug: string }>(
          categorySlugQuery,
          { slug },
        );

        if (result?.categorySlug) {
          const pathData = await client.fetch<{
            path: { name: string; slug: string }[];
          }>(GET_BREADCRUMB_PATH_QUERY, { slug: result.categorySlug });

          if (pathData?.path) {
            // The query returns a sparse array with nulls for non-existent parents.
            // Filter out the nulls and map the valid categories to our breadcrumb structure.
            pathData.path.filter(Boolean).forEach((crumb) => {
              breadcrumbs.push({
                name: crumb.name,
                href: `/category/${crumb.slug}`,
              });
            });
          }
        }

        // If it's a product, add its own title at the end (without a link).
        if (type === "product") {
          const productTitle = await client.fetch<{ title: string }>(
            groq`*[_type == 'product' && slug.current == $slug][0]{ title }`,
            { slug },
          );
          if (productTitle) {
            breadcrumbs.push({
              name: productTitle.title,
              href: `/product/${slug}`,
            });
          }
        }
      } else if (type === "page" && slug) {
        const pageTitle = await client.fetch<string>(
          groq`*[_type == 'page' && slug.current == $slug][0].title`,
          { slug },
        );
        if (pageTitle) breadcrumbs.push({ name: pageTitle, href: `/${slug}` });

        // --- BUG FIX IS HERE ---
        // Handle specific, named static pages directly.
      } else if (type === "contact-us") {
        breadcrumbs.push({ name: "Contact Us", href: "/contact-us" });
      } else if (type === "deals") {
        breadcrumbs.push({ name: "Deals", href: "/deals" });
      } else if (type === "faq") {
        breadcrumbs.push({ name: "FAQ", href: "/faq" });
      } else if (type === "search") {
        breadcrumbs.push({ name: "Search Results", href: "/search" });
      } else if (type === "blog") {
        breadcrumbs.push({ name: "Blog", href: "/blog" });
        if (slug) {
          const postTitle = await client.fetch<string>(
            groq`*[_type == 'post' && slug.current == $slug][0].title`,
            { slug },
          );
          if (postTitle)
            breadcrumbs.push({ name: postTitle, href: `/blog/${slug}` });
        }
      }
    } catch (error) {
      console.error("Failed to generate breadcrumbs:", error);
      return [{ name: "Home", href: "/" }];
    }

    return breadcrumbs;
  },
);

// =========================================================
// === NEW ADMIN-SPECIFIC QUERIES START HERE ===
// =========================================================

/**
 * A GROQ query to fetch a paginated list of products for the admin panel.
 * It fetches a lightweight subset of fields needed for the list view.
 */
export const GET_PAGINATED_ADMIN_PRODUCTS_QUERY = groq`
*[_type == "product" && (
    title match $searchTerm || 
    _id == $exactSearchTerm ||
    _id match $searchTerm || 
    variants[].sku match $searchTerm ||
    variants[]._key match $searchTerm
)] | order(_createdAt desc) [$start...$end] {
  _id,
  title,
  "slug": slug.current,
  "price": coalesce(variants[0].price, 0),
  "stock": coalesce(variants[0].stock, 0),
  "inStock": coalesce(variants[0].inStock, false),
  "mainImage": variants[0].images[0],
  "variantsCount": count(variants),
  "variants": variants[]{ _key, name, sku, price, stock, inStock }
}`;

/**
 * A GROQ query to count the total number of products matching a search term for pagination.
 */
export const GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY = groq`
count(*[_type == "product" && (
    title match $searchTerm || 
    _id == $exactSearchTerm ||
    _id match $searchTerm || 
    variants[].sku match $searchTerm ||
    variants[]._key match $searchTerm
)])`;

/**
 * A GROQ query to fetch all categories and brands for populating form dropdowns.
 */
export const GET_FORM_DATA_QUERY = groq`{
    "categories": *[_type == "category"] | order(name asc) { _id, name },
    "brands": *[_type == "brand"] | order(name asc) { _id, name }
}`;

/**
 * A GROQ query to fetch a single, complete product document for the edit form.
 * It includes all fields necessary to populate the form's initial state.
 */
export const GET_SINGLE_PRODUCT_FOR_EDIT_QUERY = groq`
*[_type == "product" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    videoUrl,
    "brandId": brand->_id,
    isBestSeller,
    isNewArrival,
    isFeatured,
    isOnDeal,
    rating,
    "categoryIds": coalesce(categories[]->_ref, []), 
    variants,
    "allImageAssets": variants[].images[].asset
}`;

// === (The rest of the file, including getGlobalSettings and getBreadcrumbs, remains unchanged) ===

// --- SUMMARY OF CHANGES ---
// - **Centralized Queries (Rule #4):** Moved all GROQ queries from `productActions.ts` into this central file.
// - **`GET_PAGINATED_ADMIN_PRODUCTS_QUERY`:** Created a new exported constant for fetching the list of products for the admin panel, including the powerful search logic.
// - **`GET_TOTAL_ADMIN_PRODUCTS_COUNT_QUERY`:** Created a corresponding query to efficiently count the total matching products for pagination.
// - **`GET_FORM_DATA_QUERY`:** Created an exported constant for fetching categories and brands for the product form.
// - **`GET_SINGLE_PRODUCT_FOR_EDIT_QUERY`:** Created an exported constant for fetching the full product data needed for the edit page.

// ... (Upar wale imports aur productFields wese hi rahenge)

// // === 🔥 UPDATED HOMEPAGE MASTER QUERY (FINAL) 🔥 ===
// export const HOMEPAGE_DATA_QUERY = groq`{
//     "pageSections": *[_type == "homepage" && _id == "homepage"][0].pageSections[]{
//       _key,
//       _type,

//       // === A. BANNER SECTION (Grid/Mosaic) ===
//       _type == 'bannerSection' => {
//         desktopLayout,
//         gridColumns,
//         heightMode,
//         aspectRatio,
//         fixedHeight,
//         customHeightPx,
//         mobileBehavior,
//         containerSettings,
//         banners[]{
//           "desktopImage": desktopImage.asset->url,
//           "mobileImage": mobileImage.asset->url,
//           altText, link, heading, subheading, buttonText, contentPosition, overlayOpacity, textColor
//         }
//       },

//       // === B. DEAL SECTION (Universal Engine) ===
//       _type == 'dealSection' => {
//         title,
//         subtitle,
//         fetchStrategy,
//         viewType,
//         backgroundStyle,
//         enableTimer,
//         endTime,

//         // Side Banner Support
//         showSideBanner,
//         sideBanner {
//             "image": image.asset->url,
//             link
//         },

//         // Strategy 1: Manual
//         fetchStrategy == 'manual' => {
//           "products": manualProducts[]->{ ${productFields} }
//         },
//         // Strategy 2: Campaign
//         fetchStrategy == 'campaign' => {
//           "campaignSlug": selectedCampaign->slug.current,
//           "products": *[_type == 'product' && references(^.selectedCampaign._ref)] | order(_createdAt desc)[0...12] { ${productFields} }
//         },
//         // Strategy 3: Category
//         fetchStrategy == 'category' => {
//            "categorySlug": selectedCategory->slug.current,
//            "products": *[_type == 'product' && references(^.selectedCategory._ref)] | order(_createdAt desc)[0...12] { ${productFields} }
//         },
//         // Strategy 4: Tag
//         fetchStrategy == 'tag' => {
//            tagType,
//            "products": *[_type == 'product' && (
//              (^.tagType == 'newArrivals' && isNewArrival == true) ||
//              (^.tagType == 'bestSellers' && isBestSeller == true) ||
//              (^.tagType == 'featured' && isFeatured == true)
//            )] | order(_createdAt desc)[0...12] { ${productFields} }
//         }
//       },

//       // === C. PRODUCT SHOWCASE (Row) ===
//       _type == 'productShowcase' => {
//           title, type,
//           manualProducts[]->{ ${productFields} },
//           showSideBanner,
//           sideBanner { "image": image.asset->url, link }
//       },

//       // === D. CATEGORY CAROUSEL (Circles) ===
//       _type == 'categoryShowcase' => {
//           title,
//           categories[]->{ _id, name, "slug": slug.current, "image": image.asset->url }
//       },

//       // === E. CATEGORY GRID (Bento) ===
//       _type == 'categoryGrid' => {
//           title,
//           items[]{
//             discountText,
//             category->{ _id, name, "slug": slug.current, "image": image.asset->url }
//           }
//       },

//       // === F. COUPON SECTION ===
//       _type == 'couponSection' => {
//           fullWidth,
//           couponReference->{
//              mediaType, mediaUrls, width, height, objectFit, altText, link
//           }
//       },

//       // === G. BRAND SECTION ===
//       _type == 'brandSection' => {
//           title,
//           manualBrands[]->{ _id, name, "slug": slug.current, "logo": logo.asset->url }
//       },

//       // === H. LAYOUT SECTION (Trust/News/Infinite) ===
//       _type == 'layoutSection' => {
//           type,
//           gridTitle
//       }
//     },

//     // --- LEGACY DATA (BACKUP) ---
//     "featuredProductsTitle": "Featured Products",
//     "featuredProducts": *[_type == "product" && isFeatured == true] | order(_createdAt desc)[0...12] { ${productFields} },

//     "bestSellersTitle": "Best Sellers",
//     "bestSellers": *[_type == "product" && isBestSeller == true] | order(rating desc, reviewCount desc)[0...12]{ ${productFields} },

//     "newArrivalsTitle": "New Arrivals",
//     "newArrivals": *[_type == "product"] | order(_createdAt desc)[0...12]{ ${productFields} },

//     "sectionBanners": *[_type == "homepage" && _id == "homepage"][0].sectionBanners,

//     "featuredCategoriesData": *[_type == "homepage" && _id == "homepage"][0] {
//         featuredCategoriesTitle,
//         "featuredCategories": featuredCategories[]->{ _id, name, "slug": slug.current, "image": image.asset->url },
//         categoryGridTitle,
//         "categoryGrid": categoryGrid[]{
//           _key,
//           discountText,
//           category->{
//             _id,
//             name,
//             "slug": slug.current,
//             image
//           }
//         }
//     }
// }`;
// ... (Upar wale imports aur productFields wese hi rahenge)
// src/sanity/lib/queries.ts

// ... (baaki saari queries waisi hi rahengi) ...

// === 🔥 UPDATED HOMEPAGE MASTER QUERY (FINAL WITH INFINITE GRID) 🔥 ===
export const HOMEPAGE_DATA_QUERY = groq`{
    "pageSections": *[_type == "homepage" && _id == "homepage"][0].pageSections[]{
      _key,
      _type,

      // === A. BANNER SECTION ===
      _type == 'bannerSection' => {
        // ... (ye section theek hai)
        desktopLayout,
        gridColumns,
        heightMode,
        aspectRatio,
        fixedHeight,
        customHeightPx,
        mobileBehavior,
        containerSettings,
        banners[]{
          "desktopImage": desktopImage.asset->url,
          "mobileImage": mobileImage.asset->url,
          altText, link, heading, subheading, buttonText, contentPosition, overlayOpacity, textColor
        }
      },

      // ... (baaki saare sections theek hain) ...
      // === B. DEAL SECTION ===
      _type == 'dealSection' => {
        title, subtitle, fetchStrategy, viewType, backgroundStyle, enableTimer, endTime, showSideBanner,
        sideBanner { "image": image.asset->url, link },
        fetchStrategy == 'manual' => { "products": manualProducts[]->{ ${productFields} } },
        fetchStrategy == 'campaign' => { "campaignSlug": selectedCampaign->slug.current, "products": *[_type == 'product' && references(^.selectedCampaign._ref)] | order(_createdAt desc)[0...12] { ${productFields} } },
        fetchStrategy == 'category' => { "categorySlug": selectedCategory->slug.current, "products": *[_type == 'product' && references(^.selectedCategory._ref)] | order(_createdAt desc)[0...12] { ${productFields} } },
        fetchStrategy == 'tag' => { tagType, "products": *[_type == 'product' && ((^.tagType == 'newArrivals' && isNewArrival == true) || (^.tagType == 'bestSellers' && isBestSeller == true) || (^.tagType == 'featured' && isFeatured == true))] | order(_createdAt desc)[0...12] { ${productFields} } }
      },
      // === C. PRODUCT SHOWCASE ===
      _type == 'productShowcase' => {
        title, type, manualProducts[]->{ ${productFields} }, showSideBanner, 
        sideBanner { "image": image.asset->url, link },
        type == 'newest' => { "products": *[_type == 'product'] | order(_createdAt desc)[0...12] { ${productFields} } },
        type == 'best-selling' => { "products": *[_type == 'product' && isBestSeller == true] | order(rating desc)[0...12] { ${productFields} } },
        type == 'featured' => { "products": *[_type == 'product' && isFeatured == true] | order(_createdAt desc)[0...12] { ${productFields} } }
      },
      // === D. CATEGORY CAROUSEL ===
      _type == 'categoryShowcase' => { title, categories[]->{ _id, name, "slug": slug.current, "image": image.asset->url } },
      // === E. CATEGORY GRID ===
      _type == 'categoryGrid' => { title, items[]{ discountText, category->{ _id, name, "slug": slug.current, "image": image.asset->url } } },

      // === F. COUPON SECTION (🔥 YAHAN FIX KIYA GAYA HAI) ===
      _type == 'couponSection' => {
          fullWidth,
          couponReference->{
             mediaType,
             mediaUrls {
                mobile { asset->{url} },
                tablet { asset->{url} },
                desktop { asset->{url} }
             },
             width, 
             height, 
             objectFit, 
             altText, 
             link->{ _type, "slug": slug.current }
          }
      },

      // === G. BRAND SECTION ===
      _type == 'brandSection' => {
          title,
          manualBrands[]->{ _id, name, "slug": slug.current, "logo": logo.asset->url }
      },
      // === H. LAYOUT SECTION ===
      _type == 'layoutSection' => {
          type, gridTitle,
          type == 'infiniteGrid' => { "initialProducts": *[_type == "product"] | order(_createdAt desc)[0...40] { ${productFields} } }
      }
    },

    // --- Legacy Data ---
    "featuredProductsTitle": "Featured Products",
    "featuredProducts": *[_type == "product" && isFeatured == true] | order(_createdAt desc)[0...12] { ${productFields} },
    "bestSellersTitle": "Best Sellers",
    "bestSellers": *[_type == "product" && isBestSeller == true] | order(rating desc, reviewCount desc)[0...12]{ ${productFields} },
    "newArrivalsTitle": "New Arrivals",
    "newArrivals": *[_type == "product"] | order(_createdAt desc)[0...12]{ ${productFields} },
    "sectionBanners": *[_type == "homepage" && _id == "homepage"][0].sectionBanners,
    "featuredCategoriesData": *[_type == "homepage" && _id == "homepage"][0] {
        featuredCategoriesTitle,
        "featuredCategories": featuredCategories[]->{ _id, name, "slug": slug.current, "image": image.asset->url },
        categoryGridTitle,
        "categoryGrid": categoryGrid[]{
          _key,
          discountText,
          category->{ _id, name, "slug": slug.current, image }
        }
    }
}`;
// === 🔥 UPDATED HOMEPAGE MASTER QUERY (FINAL WITH INFINITE GRID) 🔥 ===
// export const HOMEPAGE_DATA_QUERY = groq`{
//     "pageSections": *[_type == "homepage" && _id == "homepage"][0].pageSections[]{
//       _key,
//       _type,

//       // === A. BANNER SECTION ===
//       _type == 'bannerSection' => {
//         desktopLayout,
//         gridColumns,
//         heightMode,
//         aspectRatio,
//         fixedHeight,
//         customHeightPx,
//         mobileBehavior,
//         containerSettings,
//         banners[]{
//           "desktopImage": desktopImage.asset->url,
//           "mobileImage": mobileImage.asset->url,
//           altText, link, heading, subheading, buttonText, contentPosition, overlayOpacity, textColor
//         }
//       },

//       // === B. DEAL SECTION ===
//       _type == 'dealSection' => {
//         title,
//         subtitle,
//         fetchStrategy,
//         viewType,
//         backgroundStyle,
//         enableTimer,
//         endTime,
//         showSideBanner,
//         sideBanner { "image": image.asset->url, link },

//         fetchStrategy == 'manual' => {
//           "products": manualProducts[]->{ ${productFields} }
//         },
//         fetchStrategy == 'campaign' => {
//           "campaignSlug": selectedCampaign->slug.current,
//           "products": *[_type == 'product' && references(^.selectedCampaign._ref)] | order(_createdAt desc)[0...12] { ${productFields} }
//         },
//         fetchStrategy == 'category' => {
//            "categorySlug": selectedCategory->slug.current,
//            "products": *[_type == 'product' && references(^.selectedCategory._ref)] | order(_createdAt desc)[0...12] { ${productFields} }
//         },
//         fetchStrategy == 'tag' => {
//            tagType,
//            "products": *[_type == 'product' && (
//              (^.tagType == 'newArrivals' && isNewArrival == true) ||
//              (^.tagType == 'bestSellers' && isBestSeller == true) ||
//              (^.tagType == 'featured' && isFeatured == true)
//            )] | order(_createdAt desc)[0...12] { ${productFields} }
//         }
//       },

//       // === C. PRODUCT SHOWCASE ===
//       _type == 'productShowcase' => {
//           title, type,
//           manualProducts[]->{ ${productFields} },
//           showSideBanner,
//           sideBanner { "image": image.asset->url, link },

//           // Auto Fetch Logic for Product Showcase
//           type == 'newest' => { "products": *[_type == 'product'] | order(_createdAt desc)[0...12] { ${productFields} } },
//           type == 'best-selling' => { "products": *[_type == 'product' && isBestSeller == true] | order(rating desc)[0...12] { ${productFields} } },
//           type == 'featured' => { "products": *[_type == 'product' && isFeatured == true] | order(_createdAt desc)[0...12] { ${productFields} } }
//       },

//       // === D. CATEGORY CAROUSEL ===
//       _type == 'categoryShowcase' => {
//           title,
//           categories[]->{ _id, name, "slug": slug.current, "image": image.asset->url }
//       },

//       // === E. CATEGORY GRID ===
//       _type == 'categoryGrid' => {
//           title,
//           items[]{ discountText, category->{ _id, name, "slug": slug.current, "image": image.asset->url } }
//       },

//      // === F. COUPON SECTION ===
//       _type == 'couponSection' => {
//           fullWidth,
//           couponReference->{
//              mediaType, mediaUrls, width, height, objectFit, altText, link
//           }
//       },

//       // === G. BRAND SECTION ===
//       _type == 'brandSection' => {
//           title,
//           manualBrands[]->{ _id, name, "slug": slug.current, "logo": logo.asset->url }
//       },

//       // === H. LAYOUT SECTION (WITH INFINITE GRID DATA) ===
//       _type == 'layoutSection' => {
//           type,
//           gridTitle,
//           // 🔥 THIS WAS MISSING - NOW ADDED
//           type == 'infiniteGrid' => {
//              "initialProducts": *[_type == "product"] | order(_createdAt desc)[0...12] { ${productFields} }
//           }
//       }
//     },

//     // --- LEGACY DATA ---
//     "featuredProductsTitle": "Featured Products",
//     "featuredProducts": *[_type == "product" && isFeatured == true] | order(_createdAt desc)[0...12] { ${productFields} },
//     "bestSellersTitle": "Best Sellers",
//     "bestSellers": *[_type == "product" && isBestSeller == true] | order(rating desc, reviewCount desc)[0...12]{ ${productFields} },
//     "newArrivalsTitle": "New Arrivals",
//     "newArrivals": *[_type == "product"] | order(_createdAt desc)[0...12]{ ${productFields} },
//     "sectionBanners": *[_type == "homepage" && _id == "homepage"][0].sectionBanners,
//     "featuredCategoriesData": *[_type == "homepage" && _id == "homepage"][0] {
//         featuredCategoriesTitle,
//         "featuredCategories": featuredCategories[]->{ _id, name, "slug": slug.current, "image": image.asset->url },
//         categoryGridTitle,
//         "categoryGrid": categoryGrid[]{
//           _key,
//           discountText,
//           category->{ _id, name, "slug": slug.current, image }
//         }
//     }
// }`;

// === 1. FETCH ALL ACTIVE CAMPAIGNS ===
export const GET_ALL_CAMPAIGNS = groq`
  *[_type == "campaign" && isActive == true] {
    _id,
    title,
    "slug": slug.current,
    description,
    "banner": banner.asset->url,
    endDate
  }
`;

// === 2. FETCH SPECIFIC CAMPAIGN DATA (FIXED PAGINATION) ===
export const GET_CAMPAIGN_DATA = groq`
  *[_type == "campaign" && slug.current == $slug][0] {
    title,
    description,
    "banner": banner.asset->url,
    endDate,

    // 🔥 PAGINATION ADDED [0...40]
    "products": *[_type == "product" && references(^._id)] | order(_createdAt desc) [0...40] {
      ${productFields}
    },
    "totalCount": count(*[_type == "product" && references(^._id)]),

    "filterData": {
      "brands": array::unique(*[_type == "product" && references(^._id)].brand->{_id, name, "slug": slug.current}),
      "attributes": *[_type == "product" && references(^._id)].variants[].attributes[]{name, value},
      "priceRange": {
        "min": math::min(*[_type == "product" && references(^._id)].variants[].price),
        "max": math::max(*[_type == "product" && references(^._id)].variants[].price)
      }
    }
  }
`;
