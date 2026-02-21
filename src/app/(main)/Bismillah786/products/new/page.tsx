
// /app/admin/products/new/page.tsx

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../_components/ProductForm";
import { getFormData } from "../_actions/productActions";

// This is a Server Component that fetches initial data for the form.
export default async function NewProductPage() {
  // Data for categories and brands is fetched on the server before the page loads.
  // This improves performance and avoids loading spinners on the client.
  const { categories, brands } = await getFormData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/Bismillah786/products"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back to products list"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Add a New Product
          </h1>
          <p className="text-sm text-gray-500">
            Fill in the details below to create a new product.
          </p>
        </div>
      </div>

      {/* 
        The ProductForm is a Client Component that handles all interactivity.
        We pass the server-fetched data as initial props.
      */}
      <ProductForm categories={categories || []} brands={brands || []} />
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **No Changes:** After a thorough review, this file was found to be fully compliant with our architectural patterns (Server Component fetching data for a Client Component) and required no modifications.
