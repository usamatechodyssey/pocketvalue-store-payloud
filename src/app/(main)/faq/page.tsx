
// /src/app/faq/page.tsx

import { client } from "@/sanity/lib/client";
import { GET_FAQ_QUERY, getBreadcrumbs } from "@/sanity/lib/queries";
import type { FaqPage } from "@/sanity/types/product_types";
import FaqAccordion from "@/app/(main)/faq/FaqAccordion";
import { HelpCircle } from "lucide-react";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

type FaqPageData = FaqPage & {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: any;
  };
};

export async function generateMetadata(): Promise<Metadata> {
  const faqData = await client.fetch<FaqPageData | null>(GET_FAQ_QUERY);
  const description =
    faqData?.seo?.metaDescription ||
    "Find answers to frequently asked questions about orders, shipping, returns, and more.";

  return generateBaseMetadata({
    title: faqData?.seo?.metaTitle || "Help Center & FAQ",
    description: description,
    image: faqData?.seo?.ogImage,
    path: "/faq",
  });
}

function portableTextToString(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) return "";
      return block.children.map((child: any) => child.text).join("");
    })
    .join(" \n\n");
}

export default async function Faq() {
  const [faqData, breadcrumbs] = await Promise.all([
    client.fetch<FaqPageData>(GET_FAQ_QUERY),
    getBreadcrumbs("faq"),
  ]);

  if (!faqData || !faqData.faqList) {
    return (
      <main className="w-full bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <HelpCircle size={48} className="mx-auto text-gray-400" />
          <h1 className="mt-4 text-4xl font-bold">FAQs Not Found</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {/* ✅ FIX: 'couldn't' -> 'couldn&apos;t' */}
            We couldn&apos;t load the questions right now. Please check back
            later.
          </p>
        </div>
      </main>
    );
  }

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.faqList.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: portableTextToString(item.answer),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <main className="w-full bg-white dark:bg-gray-900">
        <div className="bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {faqData.title}
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
              {/* ✅ FIX: 'We're' -> 'We&apos;re' */}
              Have a question? We&apos;re here to help. Find answers to common
              questions below.
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Breadcrumbs crumbs={breadcrumbs} />
            </div>
            <FaqAccordion items={faqData.faqList} />
          </div>
        </div>
      </main>
    </>
  );
}