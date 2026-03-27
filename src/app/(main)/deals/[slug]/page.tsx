// src/app/(main)/deals/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import ProductListingClient from "@/app/components/category/ProductListingClient";

// 🛑 OLD SANITY IMPORTS (Commented)
// import { client } from "@/sanity/lib/client";
// import { GET_CAMPAIGN_DATA } from "@/sanity/lib/queries";

// ✅ NEW PAYLOAD IMPORTS
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { SanityBrand, SanityCategory } from "@/sanity/types/product_types";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries"; // Breadcrumbs ke liye
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// --- HELPER: Campaign Data Fetcher (Payload Version) ---
async function getPayloadCampaignData(slug: string) {
  const payload = await getPayload({ config: configPromise });

  // 1. Campaign Fetch Karein
  const campaignResult = await payload.find({
    collection: "campaigns",
    where: { slug: { equals: slug } },
    depth: 1, // Banner image expand karne ke liye
  });

  const campaignDoc = campaignResult.docs[0];
  
  if (!campaignDoc || !campaignDoc.isActive) return null;

  // 2. Products Fetch Karein (PLP Engine se)
  const productData = await getPayloadProducts({
    campaignSlug: slug, // PLP Engine khud samajh jayega ke filter kaise lagana hai
    page: 1,
    sortOrder: "newest",
  });

  const products = productData.products;

  // 3. Filters Calculate Karein
  const brandMap = new Map();
  let minPrice = Infinity;
  let maxPrice = 0;
  const attributes: any[] = [];

  products.forEach((p: any) => {
    if (p.brand && p.brand._id) brandMap.set(p.brand._id, p.brand);
    p.variants?.forEach((v: any) => {
      if (v.price < minPrice) minPrice = v.price;
      if (v.price > maxPrice) maxPrice = v.price;
      v.attributes?.forEach((attr: any) => { attributes.push({ name: attr.name, value: attr.value }); });
    });
  });

  if (minPrice === Infinity) minPrice = 0;
  const brands = Array.from(brandMap.values()) as SanityBrand[];

  return {
    title: campaignDoc.title,
    description: campaignDoc.description,
    // @ts-ignore
    banner: (campaignDoc.banner as any)?.url || null, 
    products: products,
    totalCount: productData.totalCount,
    filterData: {
      brands,
      attributes,
      priceRange: { min: minPrice, max: maxPrice }
    }
  };
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ').toUpperCase()} - PocketValue Deals`,
    description: `Exclusive offers for ${slug}`,
  };
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params;
  
  // ✅ Switch to Payload
  const data = await getPayloadCampaignData(slug);
  const breadcrumbs = await getPayloadBreadcrumbs("deals", slug); // Breadcrumbs bhi Payload se

  if (!data) return notFound();

  const { title, description, banner, products, filterData, totalCount } = data;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* === CAMPAIGN BANNER HEADER === */}
      <div className="relative w-full h-50 md:h-75 bg-gray-800 flex items-center justify-center overflow-hidden">
        {banner ? (
            <Image src={banner} alt={title} fill className="object-cover opacity-60" />
        ) : (
            <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-brand-secondary opacity-90" />
        )}
        <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-clash font-bold text-white drop-shadow-lg uppercase tracking-wide">
                {title}
            </h1>
            {description && <p className="text-white/90 mt-2 text-lg max-w-2xl mx-auto">{description}</p>}
        </div>
      </div>

      <div className="max-w-480 mx-auto px-2 md:px-4 py-8 md:py-12">
        {/* Breadcrumbs bhi CampaignPage par show karo */}
        <div className="mb-8">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        <ProductListingClient
            initialProducts={products || []}
            filterData={filterData}
            totalCount={totalCount || 0}
            context={{ type: "deals", value: slug }} 
            categoryTree={undefined} // Campaign page par categoryTree nahi hota
        />
      </div>

    </main>
  );
}