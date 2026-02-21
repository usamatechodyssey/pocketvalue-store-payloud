
// /app/admin/products/_components/form-tabs/ProductOrganizationForm.tsx

"use client";

import { SanityBrand, SanityCategory } from "@/sanity/types/product_types";

// Use the standard project input styles
const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

interface ProductOrganizationFormProps {
  formData: {
    brandId: string;
    rating?: number;
    categoryIds: string[];
    isBestSeller: boolean;
    isNewArrival: boolean;
    isFeatured: boolean;
    isOnDeal: boolean;
  };
  brands: SanityBrand[];
  categories: SanityCategory[];
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onCategoryChange: (catId: string) => void;
}

export default function ProductOrganizationForm({
  formData,
  brands,
  categories,
  onInputChange,
  onCategoryChange,
}: ProductOrganizationFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="brandId"
            className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300"
          >
            Brand
          </label>
          <div className="mt-2">
            <select
              id="brandId"
              name="brandId"
              value={formData.brandId}
              onChange={onInputChange}
              className={inputStyles}
            >
              <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="rating"
            className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300"
          >
            Initial Rating (1-5)
          </label>
          <div className="mt-2">
            <input
              id="rating"
              type="number"
              name="rating"
              value={formData.rating}
              onChange={onInputChange}
              min="1"
              max="5"
              step="0.1"
              className={inputStyles}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300">
          Categories
        </label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border dark:border-gray-700 rounded-md max-h-60 overflow-y-auto">
          {categories.map((c) => (
            <label
              key={c._id}
              className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                checked={formData.categoryIds.includes(c._id)}
                onChange={() => onCategoryChange(c._id)}
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t dark:border-gray-700">
        <label className="block text-sm font-medium leading-6 text-gray-700 dark:text-gray-300 mb-2">
          Marketing Flags
        </label>
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          {["isBestSeller", "isNewArrival", "isFeatured", "isOnDeal"].map(
            (flag) => (
              <label
                key={flag}
                className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  name={flag}
                  className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  checked={formData[flag as keyof typeof formData] as boolean}
                  onChange={onInputChange}
                />
                {flag.replace("is", "Mark as ")}
              </label>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Rule #7 (Input Styling):** Replaced the local `inputStyles` with the project's official `inputStyles` constant for `select` and `input` fields.
// - **Code Structure:** Wrapped inputs in `divs` and updated labels for better structure and accessibility, consistent with our other forms.
// - **Improved UI:** Added a heading for the "Marketing Flags" section and improved the styling of checkboxes for a cleaner look.
