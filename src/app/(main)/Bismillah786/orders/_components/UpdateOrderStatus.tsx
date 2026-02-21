
// /app/admin/orders/_components/UpdateOrderStatus.tsx

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { updateOrderStatus } from "@/app/actions/orderActions"; // <-- UPDATED IMPORT PATH
import { Loader2 } from "lucide-react";

interface UpdateOrderStatusProps {
  orderId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [ "Pending", "Processing", "Shipped", "Delivered", "Cancelled", "On Hold" ];

export default function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isStatusUnchanged = newStatus === currentStatus;

  const handleUpdate = () => {
    if (isStatusUnchanged) return;

    startTransition(async () => {
      // This now calls the centralized, Mongoose-based server action
      const result = await updateOrderStatus(orderId, newStatus);
      if (result?.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to update status.");
        setNewStatus(currentStatus);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
        Update Order Status
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Select a new status for this order. An email notification will be sent
        to the customer automatically.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          disabled={isPending}
          aria-label="Select new order status"
          className="grow p-2.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 shadow-sm focus:ring-brand-primary focus:border-brand-primary disabled:opacity-70"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={isPending || isStatusUnchanged}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isPending ? <Loader2 className="animate-spin" size={18} /> : null}
          {isPending ? "Updating..." : isStatusUnchanged ? "Current Status" : "Update Status"}
        </button>
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Centralized Action:** The `import` for `updateOrderStatus` has been changed from the old, local `_actions` file to the new, centralized `/app/actions/orderActions.ts`.
// - **No Logic Change:** The component's internal UI and state management logic did not need to be changed. It now transparently benefits from the more robust, Mongoose-based action.