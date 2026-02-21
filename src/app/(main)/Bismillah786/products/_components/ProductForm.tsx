
"use client";

import { useState, useTransition, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { createProduct, updateProduct } from "../_actions/productActions";
import { SanityCategory, SanityBrand } from "@/sanity/types/product_types";
import { Loader2 } from "lucide-react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import slugify from "slugify";

import ProductDetailsForm from "./form-tabs/ProductDetailsForm";
import ProductVariantsForm, {
  ProductVariant,
} from "./form-tabs/ProductVariantsForm";
import ProductOrganizationForm from "./form-tabs/ProductOrganizationForm";

interface ProductData {
  _id?: string;
  title?: string;
  slug?: { current: string };
  description?: any;
  videoUrl?: string;
  brandId?: string;
  categoryIds?: string[];
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isOnDeal?: boolean;
  rating?: number;
  variants?: ProductVariant[];
}

interface ProductFormProps {
  categories: SanityCategory[];
  brands: SanityBrand[];
  initialData?: ProductData;
}

// ✅ FIX: Move impure function OUTSIDE the component.
// Calling Date.now() or Math.random() during render is forbidden.
// Placing it here ensures it's just a helper function, not part of the render tree.
const createNewVariant = (): ProductVariant => ({
  _key: `v_${Date.now()}_${Math.random()}`,
  name: "Standard",
  sku: "",
  price: 0,
  inStock: true,
  stock: 10,
  images: [],
  attributes: [],
});

export default function ProductForm({
  categories,
  brands,
  initialData,
}: ProductFormProps) {
  const isEditMode = !!initialData?._id;
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug?.current || "",
    videoUrl: initialData?.videoUrl || "",
    description: initialData?.description || null,
    brandId: initialData?.brandId || "",
    categoryIds: initialData?.categoryIds || [],
    isBestSeller: initialData?.isBestSeller || false,
    isNewArrival: initialData?.isNewArrival || false,
    isFeatured: initialData?.isFeatured || false,
    isOnDeal: initialData?.isOnDeal || false,
    rating: initialData?.rating || undefined,
  });

  // ✅ FIX: Use Lazy Initialization for useState.
  // Instead of passing the value directly (which runs createNewVariant() every render),
  // we pass a function () => ... which React runs ONLY ONCE on mount.
  const [variants, setVariants] = useState<ProductVariant[]>(() =>
    initialData?.variants?.length ? initialData.variants : [createNewVariant()]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const newSlug = slugify(newTitle, { lower: true, strict: true });
    setFormData((prev) => ({ ...prev, title: newTitle, slug: newSlug }));
    setVariants((prevVariants) =>
      prevVariants.map((v) => ({ ...v, sku: generateSku(newTitle, v.name) }))
    );
  };

  const handleFormInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isChecked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: isChecked }));
  };

  const generateSku = (productTitle: string, variantName: string): string => {
    const productSlug = slugify(productTitle, {
      lower: true,
      strict: true,
      replacement: "",
    })
      .slice(0, 8)
      .toUpperCase();
    const variantSlug = slugify(variantName, {
      lower: true,
      strict: true,
      replacement: "-",
    }).toUpperCase();
    return `${productSlug}-${variantSlug}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.title) return toast.error("Product title is required.");
    if (formData.categoryIds.length === 0)
      return toast.error("Please select at least one category.");

    for (const variant of variants) {
      if (!variant.name) return toast.error("Every variant must have a name.");
      if (variant.price === undefined || variant.price < 0)
        return toast.error(
          `Variant "${variant.name}" must have a valid price.`
        );
      if (!variant.images || variant.images.length === 0) {
        return toast.error(
          `Variant "${variant.name}" must have at least one image.`
        );
      }
    }

    startTransition(async () => {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        videoUrl: formData.videoUrl,
        brandId: formData.brandId,
        categoryIds: formData.categoryIds,
        isBestSeller: formData.isBestSeller,
        isNewArrival: formData.isNewArrival,
        isFeatured: formData.isFeatured,
        isOnDeal: formData.isOnDeal,
        rating: formData.rating,
        variants: variants,
      };

      const result = isEditMode
        ? await updateProduct(initialData!._id!, payload)
        : await createProduct(payload);

      if (result.success) {
        toast.success(result.message);
        router.push("/Bismillah786/products");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-gray-200 dark:bg-gray-700 p-1">
          {["Details", "Variants", "Marketing & Organization"].map(
            (category) => (
              <Tab key={category} as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none ${selected ? "bg-white dark:bg-gray-800 shadow text-brand-primary" : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50"}`}
                  >
                    {category}
                  </button>
                )}
              </Tab>
            )
          )}
        </TabList>

        <TabPanels className="mt-4">
          <TabPanel className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <ProductDetailsForm
              formData={formData}
              onTitleChange={handleTitleChange}
              onInputChange={handleFormInputChange}
              onDescriptionChange={(newDesc) =>
                setFormData((p) => ({ ...p, description: newDesc }))
              }
            />
          </TabPanel>

          <TabPanel className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <ProductVariantsForm
              variants={variants}
              setVariants={setVariants}
              productTitle={formData.title}
              generateSku={generateSku}
              createNewVariant={createNewVariant}
            />
          </TabPanel>

          <TabPanel className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <ProductOrganizationForm
              formData={formData}
              brands={brands}
              categories={categories}
              onInputChange={handleFormInputChange}
              onCategoryChange={(catId) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryIds: prev.categoryIds.includes(catId)
                    ? prev.categoryIds.filter((id) => id !== catId)
                    : [...prev.categoryIds, catId],
                }))
              }
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <div className="flex justify-end pt-8 border-t dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={20} />}
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Product"
              : "Save Product"}
        </button>
      </div>
    </form>
  );
}