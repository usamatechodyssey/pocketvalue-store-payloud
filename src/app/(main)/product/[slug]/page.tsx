// src/app/(main)/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import ProductSectionWithBanner from "@/app/components/home/ProductCarousel";
import ProductClientManager from "@/app/components/product/ProductClientManager";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import { portableTextToString } from "@/utils/portableTextToString";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import SanityProduct from "@/sanity/types/product_types"; // Import type

// --- 🛑 OLD SANITY IMPORTS (Commented) ---
/*
import {
  getSingleProduct,
  getRelatedProducts,
  getBreadcrumbs,
} from "@/sanity/lib/queries";
*/

// --- ✅ NEW PAYLOAD IMPORTS ---
import {
  getPayloadSingleProduct,
  getPayloadRelatedProducts, // Related products ke liye alag function bana rahe hain jo categoryIds ke basis pe fetch karega
} from "@/sanity/lib/payload/product.queries";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// 🔥 LOCAL FIX: TypeScript ko shant karne ke liye
// Hum bata rahe hain ke Product mein SEO field bhi ho sakti hai
interface ProductWithSEO extends SanityProduct {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
}

// =====================================================
// 🔥 METADATA GENERATION
// =====================================================
export async function generateMetadata({
  params: paramsPromise,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await paramsPromise;

  // ✅ Fetch & Cast (Is 'as' ki waja se error khatam ho jayega)
  const rawProduct = await getPayloadSingleProduct(slug);
  const product = rawProduct as ProductWithSEO | null;

  if (!product) {
    return {};
  }

  const title = product.seo?.metaTitle || product.title;
  const description =
    product.seo?.metaDescription ||
    (product.description
      ? portableTextToString(product.description).substring(0, 160)
      : "");

  const rawImage = product.seo?.ogImage || product.defaultVariant?.images?.[0];
  const imageUrlString = rawImage
    ? urlFor(rawImage).width(1200).height(630).url()
    : "";

  const price =
    product.defaultVariant?.salePrice || product.defaultVariant?.price || 0;
  const brand = product.brand?.name || "PocketValue";

  const ogEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"}/api/og`;
  const ogUrl = new URL(ogEndpoint);

  ogUrl.searchParams.set("title", title);
  ogUrl.searchParams.set("price", price.toLocaleString());
  ogUrl.searchParams.set("brand", brand);
  if (imageUrlString) ogUrl.searchParams.set("image", imageUrlString);

  const baseMetadata = await generateBaseMetadata({
    title,
    description,
    image: rawImage,
    path: `/product/${product.slug}`,
  });

  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      title: title,
      description: description,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...baseMetadata.twitter,
      card: "summary_large_image",
      images: [ogUrl.toString()],
    },
  };
}

// =====================================================
// 🛒 PRODUCT PAGE COMPONENT
// =====================================================
export default async function ProductDetailPage({
  params: paramsPromise,
}: ProductDetailPageProps) {
  const { slug } = await paramsPromise;

  // ✅ Fetch & Cast
  const rawProduct = await getPayloadSingleProduct(slug);
  const product = rawProduct as ProductWithSEO | null;

  if (!product) {
    notFound();
  }

  const [relatedProducts, breadcrumbs] = await Promise.all([
    getPayloadRelatedProducts(product._id, product.categoryIds || []),
    getPayloadBreadcrumbs("product", slug),
  ]);
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    description: portableTextToString(product.description),
    image: product.defaultVariant?.images?.[0]
      ? urlFor(product.defaultVariant.images[0]).url()
      : "",
    sku: product.defaultVariant?.sku || product._id,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || "PocketValue",
    },
    // Reviews Schema
    ...(product.reviewCount &&
      product.reviewCount > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.rating?.toFixed(1) || "5",
          reviewCount: product.reviewCount,
        },
      }),
    // Pricing & Availability Schema
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: product.defaultVariant?.salePrice || product.defaultVariant?.price,
      availability: product.defaultVariant?.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk"}/product/${product.slug}`,
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      )
        .toISOString()
        .split("T")[0], // Next year same date
    },

    // ============================================================
    // 🔥 ENTERPRISE ADDITION: Video Object for Rich Results
    // ============================================================
    ...(product.videoUrl && {
      subjectOf: {
        "@type": "VideoObject",
        name: `${product.title} - Official Video`,
        description: `Watch the features and demo of ${product.title} on PocketValue.`,
        thumbnailUrl: product.defaultVariant?.images?.[0]
          ? urlFor(product.defaultVariant.images[0]).url()
          : "",
        contentUrl: product.videoUrl, // Direct video link (Cloudinary/YouTube)
        uploadDate: product._createdAt || new Date().toISOString(),
      },
    }),
    // ============================================================
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="w-full bg-gray-50 dark:bg-gray-950 pb-20">
        <div className="max-w-480 mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="mb-6 md:mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
          </div>

          <ProductClientManager product={product} />
        </div>

        {relatedProducts && relatedProducts.length > 0 && (
          <div className="w-full mt-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <ProductSectionWithBanner
              products={relatedProducts}
              title="You Might Also Like"
            />
          </div>
        )}
      </main>
    </>
  );
}
