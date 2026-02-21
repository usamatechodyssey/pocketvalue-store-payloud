
// /app/Bismillah786/categories/_components/CategoriesClientPage.tsx

"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import { PlusCircle, Edit, Trash2, Loader2, Search, Zap } from "lucide-react"; // Zap icon imported
import { Category, deleteCategory } from "../_actions/categoryActions";
import Pagination from "../../products/_components/Pagination";
import CategoryFormModal from "./CategoryFormModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import MassDeletionModal from "./MassDeletionModal"; // NEW IMPORT
import { useSession } from "next-auth/react"; // NEW IMPORT

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CategoriesClientPage({
  initialCategories,
  initialTotalPages,
  allCategoriesForForm,
}: {
  initialCategories: Category[];
  initialTotalPages: number;
  allCategoriesForForm: { _id: string; name: string }[];
}) {
  // --- NEW STATE & LOGIC ---
  const { data: session } = useSession(); // Session Hook
  const isSuperAdmin = session?.user?.role === 'Super Admin'; // Role Check
  const [isMassDeleteModalOpen, setIsMassDeleteModalOpen] = useState(false); // New Modal State
  // -------------------------
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  useEffect(() => {
    if (debouncedSearchTerm !== currentSearch) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
      else params.delete("search");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }
  }, [debouncedSearchTerm, currentSearch, pathname, router, searchParams]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };
  const openDeleteModal = (category: Category) => setCategoryToDelete(category);

  const handleDelete = () => {
    if (!categoryToDelete) return;
    startDeleteTransition(async () => {
      const result = await deleteCategory(categoryToDelete._id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setCategoryToDelete(null);
    });
  };

  const hasCategories = initialCategories.length > 0;

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 flex justify-center items-center z-10 rounded-lg">
          <Loader2 className="animate-spin text-brand-primary" size={48} />
        </div>
      )}
      <div
        className={`transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="grow relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by category name..."
                className={`${inputStyles} pl-11`}
              />
            </div>
            
            {/* Action Buttons Group */}
            <div className="flex gap-3 shrink-0">
                {isSuperAdmin && (
                    <button
                        onClick={() => setIsMassDeleteModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
                        title="Permanently delete category hierarchy."
                    >
                        <Zap size={20} /> Surgeon
                    </button>
                )}
                <button
                    onClick={handleAddNew}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover"
                >
                    <PlusCircle size={20} /> Add New
                </button>
            </div>
            
          </div>

          <div className="lg:hidden space-y-3">
            {hasCategories &&
              initialCategories.map((cat) => (
                <div
                  key={cat._id}
                  className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600"
                >
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">
                      {cat.name}
                    </p>
                    <p className="text-xs font-mono text-gray-500">
                      {cat.slug}
                    </p>
                  </div>
                  <div className="mt-3 text-sm grid grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500">Parent</p>
                      <p>{cat.parent?.name || "--"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sub-cats</p>
                      <p>{cat.subCategoryCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Products</p>
                      <p>{cat.productCount}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t dark:border-gray-600 pt-2 flex justify-end items-center gap-4">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(cat)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Parent</th>
                  <th className="p-3 text-center">Sub-Categories</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {hasCategories &&
                  initialCategories.map((cat) => (
                    <tr
                      key={cat._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="p-3 font-medium">
                        {cat.name}
                        <p className="text-xs font-mono text-gray-500">
                          {cat.slug}
                        </p>
                      </td>
                      <td className="p-3">{cat.parent?.name || "--"}</td>
                      <td className="p-3 text-center">
                        {cat.subCategoryCount}
                      </td>
                      <td className="p-3 text-center">{cat.productCount}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end items-center gap-4">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(cat)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!hasCategories && (
            <div className="text-center py-16 text-gray-500">
              <p className="font-semibold">No categories found</p>
              {currentSearch && (
                <p className="text-sm mt-2">
                  Try adjusting your search or clearing it.
                </p>
              )}
            </div>
          )}
        </div>

        <Pagination
          totalPages={initialTotalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isPending={isPending}
        />
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        allCategories={allCategoriesForForm}
      />
      <DeleteConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={handleDelete}
        isPending={isDeletePending}
        itemName={categoryToDelete?.name || ""}
      />
      {/* NEW MODAL COMPONENT */}
      <MassDeletionModal
          isOpen={isMassDeleteModalOpen}
          onClose={() => setIsMassDeleteModalOpen(false)}
      />
    </div>
  );
}