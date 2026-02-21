

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import ProductListingClient from "@/app/components/category/ProductListingClient";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import {
  GET_CATEGORY_PLP_DATA,
  GET_CATEGORY_METADATA,
  getBreadcrumbs,
} from "@/sanity/lib/queries";
import { generateBaseMetadata } from "@/utils/metadata";
import { urlFor } from "@/sanity/lib/image";
import { FiArrowLeft } from "react-icons/fi";

type CategoryPageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({
  params: paramsPromise,
}: CategoryPageProps) {
  const { slug } = await paramsPromise;
  const currentSlug = slug[slug.length - 1];

  const category = await client.fetch<any>(GET_CATEGORY_METADATA, {
    slug: currentSlug,
  });

  if (!category) {
    return {};
  }

  return generateBaseMetadata({
    title: category.seo?.metaTitle || category.name,
    description: category.seo?.metaDescription || category.description,
    image: category.seo?.ogImage || category.image,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({
  params: paramsPromise,
}: CategoryPageProps) {
  const { slug } = await paramsPromise;
  const currentSlug = slug[slug.length - 1];

  const [plpData, breadcrumbs] = await Promise.all([
    client.fetch(GET_CATEGORY_PLP_DATA, { slug: currentSlug }),
    getBreadcrumbs("category", currentSlug),
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
    description:
      currentCategory.description ||
      `Shop for ${currentCategory.name} on PocketValue.`,
    url: `${siteUrl}/category/${currentSlug}`,
  };

  let categoryTreeForSidebar;
  if (grandparentRef) {
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
          {/* --- HEADER LOGIC MOVED HERE FROM CategoryHeader --- */}
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
              <p>{currentCategory.description}</p>
            </div>
          )}
        </div>

        {initialProducts && initialProducts.length > 0 ? (
          <ProductListingClient
            initialProducts={initialProducts}
            filterData={filterData}
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
                {/* ✅ FIX: Replaced " with &quot; */}
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