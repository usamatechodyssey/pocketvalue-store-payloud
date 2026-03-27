

// export default FilterSidebar;
"use client";

import { memo, useEffect } from "react"; // 🔥 Added useEffect
import { usePathname } from "next/navigation"; // 🔥 Added usePathname
import { SanityBrand, SanityCategory } from "@/sanity/types/product_types";
import { X, Filter, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import FilterSection from "./FilterSection";
import CategoryNode from "./FilterCategoryTree";
import FilterCheckboxRow from "./FilterCheckboxRow";
import SearchableFilterList from "./SearchableFilterList";
import DualRangeSlider from "./DualRangeSlider";
import StarRatingFilter from "./StarRatingFilter";

interface Filters {
  brands: string[];
  categories?: string[];
  availability?: string[];
  isOnSale?: boolean;
  minRating?: number;
  [key: string]: any;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  brands: SanityBrand[];
  attributes: { name: string; values: string[] }[];
  priceRange: { min: number | null; max: number | null };
  appliedFilters: Filters;
  onFilterChange: (group: string, value: any) => void;
  onPriceApply: (price: { min: string; max: string }) => void;
  onClearFilters: () => void;
  categoryTree?: SanityCategory;
  dealCategories?: SanityCategory[];
}

const FilterSidebar = memo(function FilterSidebar({
  isOpen,
  onClose,
  brands,
  attributes,
  priceRange,
  appliedFilters,
  onFilterChange,
  onPriceApply,
  onClearFilters,
  categoryTree,
  dealCategories,
}: FilterSidebarProps) {
  
  // 🔥 FIX START: Auto-Close logic
  const pathname = usePathname();

  useEffect(() => {
    // Sirf tab band karo jab Mobile Sidebar khula ho
    // (Desktop par ye hamesha dikhta hai, wahan masla nahi hoga kyunke AnimatePresence handle kar lega)
    if (isOpen) {
        onClose();
    }
  }, [pathname]); 
  // 🔥 FIX END

  const currentMinPrice = 
    appliedFilters.minPrice !== undefined && appliedFilters.minPrice !== null 
      ? Number(appliedFilters.minPrice) 
      : (priceRange.min ?? 0);

  const currentMaxPrice = 
    appliedFilters.maxPrice !== undefined && appliedFilters.maxPrice !== null 
      ? Number(appliedFilters.maxPrice) 
      : (priceRange.max ?? 10000);

  // --- INTERNAL CONTENT ---
  const sidebarContentJsx = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* 1. HEADER */}
      <div className="shrink-0 p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Filter size={18} />
          </div>
          <h2 className="text-lg font-clash font-bold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-50 text-gray-500 hover:text-red-500 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. SCROLLABLE MIDDLE SECTION */}
      <div className="px-5 pt-2 pb-4 overflow-y-auto custom-scrollbar grow">
        {categoryTree && (
          <FilterSection title="Categories">
            <ul className="space-y-0.5">
              <CategoryNode category={categoryTree} parentPath={`/category`} />
            </ul>
          </FilterSection>
        )}

        {dealCategories && dealCategories.length > 0 && (
          <FilterSection title="Deal Categories">
            <div className="space-y-1">
              {dealCategories.map((cat) => (
                <FilterCheckboxRow
                  key={cat._id}
                  label={cat.name}
                  checked={appliedFilters.categories?.includes(cat.slug) || false}
                  onChange={() => onFilterChange("categories", cat.slug)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection title="Promotions" defaultOpen={true}>
          <div className="space-y-1">
            <label className="flex items-center gap-3 cursor-pointer group py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 
                        ${
                          appliedFilters.isOnSale
                            ? "bg-brand-danger border-brand-danger"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-brand-danger"
                        }`}
              >
                {appliedFilters.isOnSale && (
                  <Zap size={12} className="text-white fill-white" />
                )}
              </div>
              <input
                type="checkbox"
                checked={!!appliedFilters.isOnSale}
                onChange={() => onFilterChange("isOnSale", !appliedFilters.isOnSale)}
                className="hidden"
              />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                On Sale / Deals
              </span>
            </label>
          </div>
        </FilterSection>

        {/* PRICE RANGE SLIDER */}
        <FilterSection title="Price Range" defaultOpen={true}>
          <DualRangeSlider
            key={`${currentMinPrice}-${currentMaxPrice}`} 
            min={priceRange.min ?? 0}
            max={priceRange.max ?? 10000}
            currentMin={currentMinPrice}
            currentMax={currentMaxPrice}
            onChange={(min, max) => onPriceApply({ min, max })}
          />
        </FilterSection>

        <FilterSection title="Availability">
          <FilterCheckboxRow
            label="In Stock"
            checked={appliedFilters.availability?.includes("in-stock") || false}
            onChange={() => onFilterChange("availability", "in-stock")}
          />
        </FilterSection>

        <FilterSection title="Customer Ratings">
          <StarRatingFilter
            selectedRating={appliedFilters.minRating || null}
            onChange={(rating) => onFilterChange("minRating", rating)}
          />
        </FilterSection>

        {brands.length > 0 && (
          <FilterSection title="Brands">
            <SearchableFilterList
              items={brands.map((b) => ({ id: b._id, name: b.name, value: b.slug }))}
              selectedValues={appliedFilters.brands || []}
              onChange={(val) => onFilterChange("brands", val)}
              placeholder="Find a brand..."
            />
          </FilterSection>
        )}

        {attributes.map((attr) => (
          <FilterSection title={attr.name} key={attr.name} defaultOpen={false}>
            <SearchableFilterList
              items={attr.values.map((v) => ({ id: v, name: v, value: v }))}
              selectedValues={appliedFilters[attr.name.toLowerCase()] || []}
              onChange={(val) => onFilterChange(attr.name.toLowerCase(), val)}
              placeholder={`Search ${attr.name}...`}
            />
          </FilterSection>
        ))}
      </div>

      {/* 3. FOOTER */}
      <div className="shrink-0 p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 mt-auto">
        <button
          onClick={onClearFilters}
          className="w-full py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <X size={16} />
          Reset All Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-28 h-fit self-start">
        <div className="flex flex-col rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden ">
          {sidebarContentJsx}
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 w-[85vw] max-w-[320px] bg-white dark:bg-gray-900 z-40 flex flex-col lg:hidden shadow-2xl overflow-hidden
                         h-dvh pb-20 md:pb-0"
            >
              <div className="h-full flex flex-col">{sidebarContentJsx}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

export default FilterSidebar;