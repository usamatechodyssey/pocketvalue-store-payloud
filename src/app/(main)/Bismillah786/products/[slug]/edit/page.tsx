
// /app/admin/products/[slug]/edit/page.tsx

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ProductForm from "../../_components/ProductForm";
import {
  getFormData,
  getSingleProductForEdit,
} from "../../_actions/productActions";
import { portableTextToTiptapJson } from "@/utils/portableTextToTiptap";

// Correct Next.js 16+ typing for async page params
type EditProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProductPage(props: EditProductPageProps) {
  // --- RULE #8 COMPLIANCE: Correctly await the params promise ---
  const { slug } = await props.params;

  const [product, formData] = await Promise.all([
    getSingleProductForEdit(slug),
    getFormData(),
  ]);

  if (!product) {
    notFound();
  }

  let tiptapDescription;
  try {
    tiptapDescription = portableTextToTiptapJson(product.description);
  } catch (error) {
    console.error("Failed to convert Portable Text to Tiptap JSON:", error);
    tiptapDescription = null;
  }

  const initialData = {
    ...product,
    slug: { current: product.slug },
    description: tiptapDescription,
    categoryIds: product.categoryIds || [],
    brandId: product.brandId || "",
    variants: product.variants || [],
  };

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
            Edit Product
          </h1>
          <p
            className="text-sm text-gray-500 truncate max-w-sm"
            title={product.title}
          >
            Editing: {product.title}
          </p>
        </div>
      </div>

      <ProductForm
        categories={formData.categories || []}
        brands={formData.brands || []}
        initialData={initialData}
      />
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Rule #8 Compliance:** The component was already using the correct type for `params`, but the code has been re-verified to ensure `await props.params` is used correctly, making it fully compliant with Next.js 16+ standards. No other changes were necessary as the file follows all other architectural rules.
