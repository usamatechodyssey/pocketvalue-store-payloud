import { client } from "@/sanity/lib/client";
import { GET_DEALS_PLP_DATA, getBreadcrumbs, GET_ALL_CAMPAIGNS } from "@/sanity/lib/queries"; 
import ProductListingClient from "@/app/components/category/ProductListingClient";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import { SanityCategory } from "@/sanity/types/product_types";
import { generateBaseMetadata } from "@/utils/metadata";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return generateBaseMetadata({
    title: "Today's Deals",
    description: "Check out the latest deals and special offers.",
    path: "/deals",
  });
}

interface DealsPageData {
  initialProducts: any[];
  filterData: any;
  totalCount: number;
  dealCategories: (SanityCategory | null)[];
}

interface Campaign {
  _id: string;
  title: string;
  slug: string;
  banner?: string;
  description?: string;
}

export default async function DealsPage() {
  const [data, breadcrumbs, campaigns] = await Promise.all([
    client.fetch<DealsPageData | null>(GET_DEALS_PLP_DATA),
    getBreadcrumbs("deals"),
    client.fetch<Campaign[]>(GET_ALL_CAMPAIGNS),
  ]);

  if (!data) {
    return <div>Could not load deals at this time.</div>;
  }

  const { initialProducts, filterData, totalCount, dealCategories } = data;

  const uniqueDealCategories = dealCategories
    ? Array.from(new Map(dealCategories.filter((category): category is SanityCategory => !!category).map((category) => [category._id, category]))).map(([, category]) => category)
    : [];

  return (
    // ALIGNMENT FIX: Main wrapper padding matched with Home/Category
    <main className="w-full bg-gray-50 dark:bg-gray-900 px-2 md:px-4 py-8 md:py-12">
      <div className="max-w-480 mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4">
            Deals & Promotions
          </h1>
        </div>

        {/* === ACTIVE CAMPAIGNS GRID === */}
        {campaigns && campaigns.length > 0 && (
          <div className="mb-16">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Active Sales Events</h2>
              {/* ALIGNMENT FIX: Consistent grid gap */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {campaigns.map((campaign) => (
                      <Link key={campaign._id} href={`/deals/${campaign.slug}`} className="group relative h-48 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                          {/* Banner Image or Gradient */}
                          {campaign.banner ? (
                              <Image src={campaign.banner} alt={campaign.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                              <div className="absolute inset-0 bg-linear-to-br from-brand-primary to-purple-600" />
                          )}
                          
                          {/* Overlay Content */}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col justify-center p-6">
                              <h3 className="text-2xl font-bold text-white mb-1">{campaign.title}</h3>
                              <p className="text-white/80 text-sm line-clamp-2 mb-4">{campaign.description}</p>
                              <span className="inline-flex items-center text-white text-sm font-semibold group-hover:underline">
                                  Explore Deal <ArrowRight size={16} className="ml-1" />
                              </span>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
        )}

        {/* === ALL PRODUCTS GRID (MIX) === */}
        <div id="all-deals">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Browse All Discounted Items</h2>
            <ProductListingClient
              initialProducts={initialProducts || []}
              filterData={filterData}
              totalCount={totalCount || 0}
              context={{ type: "deals" }}
              categoryTree={undefined}
              dealCategories={uniqueDealCategories}
            />
        </div>
      </div>
    </main>
  );
}