"use client";

import { useTransition } from "react";
import { toast } from "react-hot-toast";
import { updateReturnRequestStatusPayload } from "@/app/actions/payloadReturnAdminActions";
import { Loader2 } from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Approved", "Processing", "Completed", "Rejected"];
const RESOLUTION_OPTIONS = ["", "Refund", "StoreCredit", "Replacement"];

export default function UpdateReturnStatus({ returnId, currentStatus }: { returnId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateReturnRequestStatusPayload(returnId, formData);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  };

  const inputStyles = "w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:ring-brand-primary sm:text-sm";

  return (
    <form action={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-4">
      <h2 className="text-xl font-bold dark:text-white">Manage Request</h2>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Update Status</label>
        <select name="status" defaultValue={currentStatus} disabled={isPending} className={inputStyles}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Resolution</label>
        <select name="resolution" disabled={isPending} className={inputStyles}>
          {RESOLUTION_OPTIONS.map(res => <option key={res} value={res}>{res || "Select Resolution..."}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Internal Admin Notes</label>
        <textarea name="adminComments" rows={3} disabled={isPending} className={inputStyles} placeholder="Add notes for the customer..."></textarea>
      </div>
      <button type="submit" disabled={isPending} className="w-full py-3 bg-brand-primary text-white font-bold rounded-lg hover:opacity-90 flex justify-center items-center gap-2">
        {isPending && <Loader2 className="animate-spin" size={18}/>} Update Request
      </button>
    </form>
  );
}