
// /app/admin/products/_components/form-tabs/ProductVariantsForm.tsx

"use client";

import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';
import VariantCard from './VariantCard';
// --- BUG FIX IS HERE: Import the single source of truth for types ---
import { ProductVariant } from '@/sanity/types/product_types';

interface ProductVariantsFormProps {
  variants: ProductVariant[];
  setVariants: Dispatch<SetStateAction<ProductVariant[]>>;
  productTitle: string;
  generateSku: (productTitle: string, variantName: string) => string;
  createNewVariant: () => ProductVariant;
}

export default function ProductVariantsForm({
  variants,
  setVariants,
  productTitle,
  generateSku,
  createNewVariant,
}: ProductVariantsFormProps)  {
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        ...createNewVariant(),
        name: `Variant ${prev.length + 1}`,
        sku: generateSku(productTitle, `Variant ${prev.length + 1}`),
      },
    ]);
  };

  const handleRemoveVariant = (key: string) => {
    if (variants.length <= 1) {
      return toast.error("A product must have at least one variant.");
    }
    setVariants(variants.filter((v) => v._key !== key));
  };

  // --- BUG FIX IS HERE ---
  const handleVariantChange = (key: string, field: string, value: any) => {
    setVariants((prevVariants) =>
      prevVariants.map((v) => {
        if (v._key !== key) return v;

        const updatedVariant = { ...v };
        const isNumericField = [
          "price",
          "salePrice",
          "stock",
          "weight",
        ].includes(field);
        const isDimensionField = field.startsWith("dimensions.");

        if (isNumericField) {
          (updatedVariant as any)[field] =
            value === "" ? undefined : Number(value);
        } else if (isDimensionField) {
          const dimKey = field.split(".")[1] as "height" | "width" | "depth";
          updatedVariant.dimensions = {
            ...updatedVariant.dimensions,
            // Do NOT add _type here. Sanity handles it.
            [dimKey]: value === "" ? undefined : Number(value),
          };
        } else {
          (updatedVariant as any)[field] = value;
        }

        if (field === "name") {
          updatedVariant.sku = generateSku(productTitle, value);
        }
        if (field === "stock") {
          updatedVariant.inStock = Number(value) > 0;
        }

        return updatedVariant;
      })
    );
  };

  return (
    <div className="space-y-6">
      {variants.map((variant, index) => (
        <VariantCard
          key={variant._key}
          variant={variant}
          index={index}
          totalVariants={variants.length}
          onVariantChange={handleVariantChange}
          onRemoveVariant={handleRemoveVariant}
        />
      ))}
      <button
        type="button"
        onClick={handleAddVariant}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline"
      >
        <PlusCircle size={16} /> Add Another Variant
      </button>
    </div>
  );
}

// Re-export the one true type for the parent form
export { type ProductVariant };

// --- SUMMARY OF CHANGES (FOR ALL 3 FILES) ---
// - **Unified Types:** Eliminated all local, duplicate definitions of `ProductVariant` and `ImageAsset`.
// - **Single Source of Truth:** All three components (`VariantImageUploader`, `VariantCard`, `ProductVariantsForm`) now import `ProductVariant` and `SanityImageObject` directly from `/sanity/types/product_types.ts`.
// - **Error Resolution:** This cascading fix resolves all related TypeScript errors by ensuring that the data types are consistent from the parent form all the way down to the image uploader.
