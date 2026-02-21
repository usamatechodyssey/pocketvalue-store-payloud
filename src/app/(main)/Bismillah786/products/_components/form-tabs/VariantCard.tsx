

"use client";

import { Trash2, Plus, X } from "lucide-react";
import VariantImageUploader from "./VariantImageUploader";
import {
  ProductVariant,
  SanityImageObject,
} from "@/sanity/types/product_types";

const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

interface VariantCardProps {
  variant: ProductVariant;
  index: number;
  totalVariants: number;
  onVariantChange: (key: string, field: string, value: any) => void;
  onRemoveVariant: (key: string) => void;
}

export default function VariantCard({
  variant,
  index,
  totalVariants,
  onVariantChange,
  onRemoveVariant,
}: VariantCardProps) {
  
  // --- HANDLERS ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVariantChange(variant._key, e.target.name, e.target.value);
  };

  const handleImagesChange = (newImages: SanityImageObject[]) => {
    onVariantChange(variant._key, "images", newImages);
  };

  // 🔥 NEW: Handle Attribute Changes
  const handleAddAttribute = () => {
    const currentAttributes = variant.attributes || [];
    const newAttribute = {
      _key: `attr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      _type: 'variantAttribute', // Important for Sanity
      name: "",
      value: "",
    };
    onVariantChange(variant._key, "attributes", [...currentAttributes, newAttribute]);
  };

  const handleAttributeChange = (attrIndex: number, field: "name" | "value", newValue: string) => {
    const currentAttributes = [...(variant.attributes || [])];
    currentAttributes[attrIndex] = {
      ...currentAttributes[attrIndex],
      [field]: newValue,
    };
    onVariantChange(variant._key, "attributes", currentAttributes);
  };

  const handleRemoveAttribute = (attrIndex: number) => {
    const currentAttributes = [...(variant.attributes || [])];
    currentAttributes.splice(attrIndex, 1);
    onVariantChange(variant._key, "attributes", currentAttributes);
  };

  return (
    <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 relative shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b dark:border-gray-600 pb-3">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
          Variant #{index + 1}
        </h3>
        {totalVariants > 1 && (
          <button
            type="button"
            onClick={() => onRemoveVariant(variant._key)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="Remove Variant"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Main Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Red / Large"
              value={variant.name}
              onChange={handleInputChange}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">SKU</label>
            <input
              type="text"
              name="sku"
              value={variant.sku}
              onChange={handleInputChange}
              className={`${inputStyles} font-mono text-xs`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Price (PKR)</label>
            <input
              type="number"
              name="price"
              value={variant.price ?? ""}
              onChange={handleInputChange}
              required
              className={inputStyles}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Sale Price</label>
            <input
              type="number"
              name="salePrice"
              value={variant.salePrice ?? ""}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Stock</label>
            <input
              type="number"
              name="stock"
              value={variant.stock ?? ""}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={variant.weight ?? ""}
              onChange={handleInputChange}
              className={inputStyles}
            />
          </div>
        </div>

        {/* 🔥 NEW: ATTRIBUTES SECTION 🔥 */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-600">
          <label className="text-xs font-semibold uppercase text-gray-500 mb-3 block">
            Variant Attributes
          </label>
          
          <div className="space-y-3">
            {(!variant.attributes || variant.attributes.length === 0) && (
              <p className="text-sm text-gray-400 italic">No attributes added (e.g. Size, Color, Material)</p>
            )}

            {variant.attributes?.map((attr, attrIndex) => (
              <div key={attr._key} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Name (e.g. Color)"
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(attrIndex, "name", e.target.value)}
                  className={`${inputStyles} flex-1`}
                />
                <span className="text-gray-400">:</span>
                <input
                  type="text"
                  placeholder="Value (e.g. Red)"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(attrIndex, "value", e.target.value)}
                  className={`${inputStyles} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(attrIndex)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddAttribute}
              className="text-sm flex items-center gap-1 text-brand-primary font-medium mt-2 hover:underline"
            >
              <Plus size={16} /> Add Attribute
            </button>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Dimensions (cm)</label>
          <div className="flex gap-2">
            <div className="relative w-full">
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">H</span>
              <input
                type="number"
                name="dimensions.height"
                value={variant.dimensions?.height ?? ""}
                onChange={handleInputChange}
                className={`${inputStyles} pl-7`}
              />
            </div>
            <div className="relative w-full">
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">W</span>
              <input
                type="number"
                name="dimensions.width"
                value={variant.dimensions?.width ?? ""}
                onChange={handleInputChange}
                className={`${inputStyles} pl-7`}
              />
            </div>
            <div className="relative w-full">
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">D</span>
              <input
                type="number"
                name="dimensions.depth"
                value={variant.dimensions?.depth ?? ""}
                onChange={handleInputChange}
                className={`${inputStyles} pl-7`}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500 mb-2 block">Variant Images</label>
          <VariantImageUploader
            images={variant.images}
            onImagesChange={handleImagesChange}
          />
        </div>
      </div>
    </div>
  );
}