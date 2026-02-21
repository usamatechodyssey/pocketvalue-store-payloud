
"use client";

import { useState, useEffect, useTransition, Fragment } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  Transition,
  DialogPanel,
  TransitionChild,
  DialogTitle,
} from "@headlessui/react";
import { X, Loader2 } from "lucide-react";
import {
  upsertCategory,
  UpsertCategoryPayload,
  Category,
} from "../_actions/categoryActions";
import slugify from "slugify";
import Select, { StylesConfig, OnChangeValue } from "react-select";
import { useTheme } from "next-themes";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Partial<Category> | null;
  allCategories: { _id: string; name: string }[];
}

type SelectOptionType = { value: string; label: string };

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
  allCategories,
}: CategoryFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const { theme } = useTheme();
  // Safe check for ID
  const isEditing = !!category?._id;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedParent, setSelectedParent] = useState<SelectOptionType | null>(
    null
  );

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  // ✅ FIX: Performance Optimization
  // Dependencies are broken down to primitives to avoid object reference loops.
  useEffect(() => {
    if (isOpen) {
      const catName = category?.name || "";
      const catSlug = category?.slug || "";

      // Only update if different
      if (name !== catName) setName(catName);
      if (slug !== catSlug) setSlug(catSlug);

      const parentId = category?.parent?._id;
      const parentName = category?.parent?.name;

      if (parentId && parentName) {
        // Only update if different to avoid loop
        if (selectedParent?.value !== parentId) {
          setSelectedParent({
            value: parentId,
            label: parentName,
          });
        }
      } else {
        if (selectedParent !== null) setSelectedParent(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, category?._id, category?.name, category?.slug, category?.parent?._id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing) {
      setSlug(slugify(newName, { lower: true, strict: true }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(slugify(e.target.value, { lower: true, strict: true }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload: UpsertCategoryPayload = {
      id: category?._id,
      name,
      slug,
      parentId: selectedParent?.value || null,
    };
    startTransition(async () => {
      const result = await upsertCategory(payload);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  const parentCategoryOptions: SelectOptionType[] = allCategories
    .filter((c) => c._id !== category?._id)
    .map((cat) => ({ value: cat._id, label: cat.name }));

  const customSelectStyles: StylesConfig<SelectOptionType, false> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1F2937" : "white",
      borderColor: state.isFocused
        ? "#f97316"
        : theme === "dark"
        ? "#374151"
        : "#d1d5db",
      borderRadius: "0.375rem",
      padding: "0.1rem",
      boxShadow: state.isFocused ? "0 0 0 2px #f97316" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#f97316" : "#9CA3AF",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      zIndex: 100,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f97316"
        : state.isFocused
        ? theme === "dark"
          ? "#374151"
          : "#f3f4f6"
        : "transparent",
      color: "inherit",
    }),
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl">
                <form onSubmit={handleSubmit}>
                  <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <DialogTitle as="h3" className="text-xl font-bold">
                      {isEditing ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        className={inputStyles}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={handleSlugChange}
                        className={inputStyles}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Parent Category
                      </label>
                      <Select<SelectOptionType>
                        instanceId="parent-category-select"
                        options={parentCategoryOptions}
                        value={selectedParent}
                        onChange={(
                          option: OnChangeValue<SelectOptionType, false>
                        ) => setSelectedParent(option)}
                        isClearable
                        isSearchable
                        styles={customSelectStyles}
                        placeholder="Search or select a parent..."
                        menuPosition="fixed"
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 mt-6 -mx-6 -mb-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-md disabled:bg-opacity-70"
                    >
                      {isPending && (
                        <Loader2 className="animate-spin" size={18} />
                      )}
                      {isPending
                        ? isEditing
                          ? "Updating..."
                          : "Creating..."
                        : isEditing
                        ? "Update"
                        : "Create"}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}