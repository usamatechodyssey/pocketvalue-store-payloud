
// /app/admin/returns/_components/UpdateReturnStatus.tsx

"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { updateReturnRequestStatus } from "../_actions/returnActions";
import { Loader2 } from "lucide-react";

interface Props {
  returnId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  "Pending",
  "Approved",
  "Processing",
  "Completed",
  "Rejected",
];
const RESOLUTION_OPTIONS = ["", "Refund", "StoreCredit", "Replacement"]; // "" ko 'None' ke liye shamil karein

export default function UpdateReturnStatus({ returnId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  // --- Hamara mustanad input style ---
  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm disabled:opacity-70";

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateReturnRequestStatus(returnId, formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Manage Request
      </h2>
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          disabled={isPending}
          className={inputStyles} // <-- Style apply kiya gaya
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="resolution"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Resolution (if approved)
        </label>
        <select
          id="resolution"
          name="resolution"
          disabled={isPending}
          className={inputStyles} // <-- Style apply kiya gaya
        >
          {RESOLUTION_OPTIONS.map((res) => (
            <option key={res} value={res}>
              {res || "None"}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="adminComments"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Admin Notes (Internal)
        </label>
        <textarea
          id="adminComments"
          name="adminComments"
          rows={3}
          disabled={isPending}
          className={`${inputStyles} resize-y`} // <-- Style apply kiya gaya
          placeholder="e.g., Customer provided photos. Approved for refund."
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold px-6 py-2.5 rounded-md hover:bg-brand-primary-hover transition-colors disabled:bg-gray-400"
      >
        {isPending && <Loader2 className="animate-spin" size={18} />}
        {isPending ? "Updating..." : "Update Request"}
      </button>
    </form>
  );
}

// --- SUMMARY OF CHANGES ---
// - **UI/UX Consistency (Rule #6):** Tamam form elements (`<select>`, `<textarea>`) par hamara mustanad `inputStyles` variable apply kar diya gaya hai, jis se unka design poore admin panel ke sath 100% consistent ho gaya hai.
