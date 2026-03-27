
import { Suspense } from "react";
// import { client } from "@/sanity/lib/client";
// import { HOMEPAGE_DATA_QUERY } from "@/sanity/lib/queries";
// ✅ NEW PAYLOAD IMPORT
import { getPayloadHomepageData } from "@/sanity/lib/payload/homepage.queries";
// Components
import HeroSection from "../components/home/HeroSection"; 
import HeroSkeleton from "../components/home/HeroSkeleton";
import RenderSection from "../components/home/builder/RenderSection";

// Metadata
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic'; 

export async function generateMetadata(): Promise<Metadata> {
  return generateBaseMetadata({
    path: "/", 
  });
}

// === THE CLEANEST PAGE EVER ===
export default async function Home() {
  // 1. Fetch Only Essential Data
  // ✅ Switch: Ab Homepage Data Payload se aayega
  const homepageData = await getPayloadHomepageData();
  const pageSections = homepageData?.pageSections || [];

  return (
    <main className="w-full flex flex-col items-center bg-white dark:bg-gray-950 overflow-x-hidden">
      
      {/* === 1. HERO (ALWAYS ON TOP) === */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* === 2. DYNAMIC BUILDER (THE MAGIC) === */}
      {/* Ab aap Sanity se jo chaho jahan chaho laga sakte ho */}
      <div className="w-full">
          {pageSections.length > 0 ? (
             <div className="flex flex-col w-full">
                {pageSections.map((section: any) => (
                    <RenderSection key={section._key} section={section} />
                ))}
             </div>
          ) : (
             // Empty State (Sirf tab dikhega agar Sanity khali ho)
             <div className="text-center py-20 text-gray-400">
                Homepage content not set. Please configure via Sanity Page Builder.
             </div>
          )}
      </div>

    </main>
  );
}