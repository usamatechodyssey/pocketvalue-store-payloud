"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { deleteProduct } from "../_actions/productActions";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
  productTitle: string;
}

export default function DeleteProductButton({ productId, productTitle }: DeleteProductButtonProps) {
  // Using useTransition for better UX during server action calls
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      startTransition(async () => {
        const result = await deleteProduct(productId);
        if (result.success) {
          toast.success(result.message);
          // Revalidation is handled by the server action
        } else {
          toast.error(result.message);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-500/10 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      aria-label={`Delete ${productTitle}`}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}