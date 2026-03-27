
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BreadcrumbItem } from "@/sanity/types/product_types";

interface BreadcrumbsProps {
  crumbs: BreadcrumbItem[];
}

export default function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  // --- BreadcrumbList JSON-LD Schema Generation ---
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item:
        index < crumbs.length - 1
          ? `${process.env.NEXT_PUBLIC_BASE_URL}${crumb.href}`
          : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="w-full">
        {/* 
           FIX 1: 'flex-wrap' 
           Isse agar categories zyada hongi to wo screen se bahar jaane ke bajaye 
           next line par aa jayengi.
        */}
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            
            return (
              // FIX 2: 'min-w-0'
              // Ye flex child ko force karta hai ke wo shrink ho sake.
              <li key={index} className="flex items-center min-w-0">
                {isLast ? (
                  // FIX 3: Handling Long Text (Truncate + Max Width)
                  // Mobile par max-width 150px rakhi hai, Tablet/Desktop par badha di hai.
                  // 'truncate' text ko '...' kar dega agar wo width se zyada hoga.
                  <span
                    className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-37.5 sm:max-w-75 md:max-w-112.5"
                    aria-current="page"
                    title={crumb.name} // Mouse hover par pura naam dikhega
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    // Links ko bhi thoda limit kia hai taki wo mobile par puri screen na le lein
                    className="hover:text-brand-primary hover:underline truncate max-w-25 sm:max-w-none"
                  >
                    {crumb.name}
                  </Link>
                )}
                
                {!isLast && (
                  <ChevronRight
                    size={14} // Icon size thoda chota kiya for better alignment
                    className="shrink-0 text-gray-400"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}