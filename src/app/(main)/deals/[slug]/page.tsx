import { client } from "@/sanity/lib/client";
import { GET_CAMPAIGN_DATA } from "@/sanity/lib/queries";
import ProductListingClient from "@/app/components/category/ProductListingClient";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, ' ').toUpperCase()} - PocketValue Deals`,
    description: `Exclusive offers for ${slug}`,
  };
}

export default async function CampaignPage({ params }: PageProps) {
  const { slug } = await params;
  
  const data = await client.fetch(GET_CAMPAIGN_DATA, { slug });

  if (!data) return notFound();

  const { title, description, banner, products, filterData, totalCount } = data;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* === CAMPAIGN BANNER HEADER (Full Width) === */}
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

      {/* === PRODUCT LISTING (Consistent Alignment) === */}
      {/* ALIGNMENT FIX: max-w-[1920px] & px-4 md:px-8 */}
      <div className="max-w-480 mx-auto px-2 md:px-4 py-8 md:py-12">
        <ProductListingClient
            initialProducts={products || []}
            filterData={filterData}
            totalCount={totalCount || 0}
            context={{ type: "deals", value: slug }} 
            categoryTree={undefined}
        />
      </div>

    </main>
  );
}