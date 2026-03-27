// src/app/(main)/category/[...slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ✅ PAYLOAD IMPORTS
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

import ProductListingClient from "@/app/components/category/ProductListingClient";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";
import { FiArrowLeft } from "react-icons/fi";
import { SanityCategory, SanityBrand } from "@/sanity/types/product_types";

type CategoryPageProps = {
  params: Promise<{ slug: string[] }>;
};

// --- 🔥 HELPER: Category Data Fetcher (Payload Version) ---
async function getPayloadCategoryPageData(slug: string) {
  const payload = await getPayload({ config: configPromise });

  // 1. Current Category Fetch karo
  const categoryResult = await payload.find({
    collection: "categories",
    where: { slug: { equals: slug } },
    depth: 2, 
  });

  const categoryDoc = categoryResult.docs[0];
  if (!categoryDoc) return null;

  // =========================================================
  // 🔥 FIX START: Sub-Categories (Children) Fetch Karna
  // =========================================================
  // Hum database se wo categories mangwayenge jinka parent ye current category hai
  const subCategoriesResult = await payload.find({
    collection: "categories",
    where: { 
        parent: { equals: categoryDoc.id } 
    },
    sort: 'name',
    limit: 50
  });

  // Unhein Sanity format mein map karein
  const mappedSubCategories: SanityCategory[] = subCategoriesResult.docs.map((sub: any) => ({
      _id: sub.id,
      name: sub.name,
      slug: sub.slug,
      parent: { _id: categoryDoc.id }, // Parent yehi current category hai
      image: (sub.image as any)?.url || null,
      subCategories: []
  }));
  // =========================================================
  // 🔥 FIX END
  // =========================================================


  // 2. Products Fetch karo (PLP Engine se)
  const productData = await getPayloadProducts({
    categorySlug: slug,
    page: 1,
    sortOrder: "newest",
  });

  const products = productData.products;
  
  // 3. Filter Data Calculate karo
  const brandMap = new Map();
  products.forEach((p: any) => {
    if (p.brand && p.brand._id) {
        brandMap.set(p.brand._id, p.brand);
    }
  });
  const brands = Array.from(brandMap.values()) as SanityBrand[];
  
  let minPrice = Infinity;
  let maxPrice = 0;
  const attributes: any[] = [];

  products.forEach((p: any) => {
    p.variants?.forEach((v: any) => {
      if (v.price < minPrice) minPrice = v.price;
      if (v.price > maxPrice) maxPrice = v.price;
      v.attributes?.forEach((attr: any) => {
         attributes.push({ name: attr.name, value: attr.value });
      });
    });
  });

  if (minPrice === Infinity) minPrice = 0;

  // 4. Data Mapping
  const currentCategory: SanityCategory = {
    _id: categoryDoc.id,
    name: categoryDoc.name,
    slug: categoryDoc.slug,
    parent: null, 
    // @ts-ignore
    desktopBanner: categoryDoc.desktopBanner,
    // @ts-ignore
    mobileBanner: categoryDoc.mobileBanner,
    // @ts-ignore
    description: categoryDoc.description,
    image: (categoryDoc.image as any)?.url
  };

  // 🔥 FIX: Ab selfTree mein hum 'mappedSubCategories' daal rahe hain
  const selfTree: SanityCategory = {
     _id: categoryDoc.id,
     name: categoryDoc.name,
     slug: categoryDoc.slug,
     parent: null,
     subCategories: mappedSubCategories, // ✅ Yahan list pass ho gayi
     image: (categoryDoc.image as any)?.url
  };

  // Logic to determine parent tree (Simple version for now)
  // Agar is category ka koi parent hai, to usay grandparentRef logic mein handle karte hain
  // Filhal hum 'selfTree' ko hi primary source bana rahe hain sidebar ke liye
  const hasParent = categoryDoc.parent; 

  return {
    initialProducts: products,
    totalCount: productData.totalCount,
    currentCategory,
    // Agar parent hai, to shayad humein parent ka tree dikhana chahiye, 
    // lekin abhi ke liye 'selfTree' (Children list) hi best hai user navigation ke liye
    grandparentRef: undefined, 
    parentTree: undefined, 
    selfTree, 
    filterData: {
      brands,
      attributes, 
      priceRange: { min: minPrice, max: maxPrice }
    }
  };
}


export async function generateMetadata({
  params: paramsPromise,
}: CategoryPageProps) {
  const { slug } = await paramsPromise;
  const currentSlug = slug[slug.length - 1];

  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "categories",
    where: { slug: { equals: currentSlug } },
    depth: 1,
  });
  const category = result.docs[0];

  if (!category) {
    return {};
  }

  const ogImage = category.seo?.ogImage || category.image;

  return generateBaseMetadata({
    title: category.seo?.metaTitle || category.name,
    // @ts-ignore 
    description: category.seo?.metaDescription || category.description, 
    image: ogImage,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({
  params: paramsPromise,
}: CategoryPageProps) {
  const { slug } = await paramsPromise;
  const currentSlug = slug[slug.length - 1];

  const [plpData, breadcrumbs] = await Promise.all([
    getPayloadCategoryPageData(currentSlug),
    getPayloadBreadcrumbs("category", currentSlug),
  ]);

  if (!plpData || !plpData.currentCategory) {
    notFound();
  }

  const {
    initialProducts,
    filterData,
    totalCount,
    currentCategory,
    grandparentRef,
    parentTree,
    selfTree,
  } = plpData;

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: currentCategory.name,
    // @ts-ignore
    description: currentCategory.description || `Shop for ${currentCategory.name} on PocketValue.`,
    url: `${siteUrl}/category/${currentSlug}`,
  };

  let categoryTreeForSidebar: SanityCategory | undefined;
  
  // Logic: Agar parentTree hai to wo dikhao, warna selfTree (Children list) dikhao
  if (grandparentRef && parentTree) {
    categoryTreeForSidebar = parentTree;
  } else {
    categoryTreeForSidebar = selfTree;
  }

  const hasBanner =
    currentCategory.desktopBanner || currentCategory.mobileBanner;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-4 py-8 md:py-12">
        <div className="max-w-480 mx-auto">
          {/* --- HEADER LOGIC --- */}
          <div className="flex justify-between items-start mb-6 md:mb-8">
            <div>
              <Breadcrumbs crumbs={breadcrumbs} />
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary dark:text-gray-100 mt-2">
                {currentCategory.name}
              </h1>
            </div>
            {slug.length > 1 && (
              <Link
                href={`/category/${slug.slice(0, -1).join("/")}`}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline mt-2"
              >
                <FiArrowLeft size={16} />
                Back
              </Link>
            )}
          </div>

          {hasBanner && (
            <div className="relative w-full h-[30vh] sm:h-[40vh] md:h-[50vh] max-h-112.5 rounded-xl overflow-hidden mb-8 shadow-lg">
              <picture>
                {currentCategory.mobileBanner && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={urlFor(currentCategory.mobileBanner).url()}
                  />
                )}
                {currentCategory.desktopBanner && (
                  <source
                    media="(min-width: 768px)"
                    srcSet={urlFor(currentCategory.desktopBanner).url()}
                  />
                )}
                <Image
                  src={urlFor(
                    currentCategory.desktopBanner ||
                      currentCategory.mobileBanner!
                  ).url()}
                  alt={`${currentCategory.name} Category Banner`}
                  fill
                  className="object-cover"
                  priority
                />
              </picture>
            </div>
          )}

          {currentCategory.description && (
            <div className="prose prose-sm max-w-none mb-8 p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-300">
               <p>{currentCategory.description as string}</p>
            </div>
          )}
        </div>

        {initialProducts && initialProducts.length > 0 ? (
          <ProductListingClient
            initialProducts={initialProducts}
            filterData={filterData}
            // 🔥 AB YEHA DATA HOGA: selfTree.subCategories populated hain
            categoryTree={categoryTreeForSidebar} 
            totalCount={totalCount || 0}
            context={{ type: "category", value: currentSlug }}
          />
        ) : (
          <div className="max-w-full mx-auto">
            <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-text-primary dark:text-gray-200">
                No Products Found
              </h3>
              <p className="text-text-secondary dark:text-gray-400 mt-2">
                There are currently no products in the
                &quot;{currentCategory.name}&quot; category.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}