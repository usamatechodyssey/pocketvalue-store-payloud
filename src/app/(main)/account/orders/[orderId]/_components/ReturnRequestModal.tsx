
// /src/app/account/orders/[orderId]/_components/ReturnRequestModal.tsx (FINAL & CORRECTED)

"use client";

import { useState, useTransition, Fragment } from "react";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Loader2 } from "lucide-react";
import { createReturnRequestAction } from "@/app/actions/returnActions";
// --- THE ARCHITECTURAL FIX IS HERE ---
import { ClientOrderProduct } from "@/app/actions/orderActions"; // <-- Import the new, SAFE type

import ReturnableItem from "./ReturnableItem"; // Corrected the path

// Standard input style (no change)
const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  products: ClientOrderProduct[]; // <-- Use the ClientOrderProduct[] type for props
}

const DEFAULT_REASON = "Item was defective or damaged";

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  products,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedItems, setSelectedItems] = useState<
    Record<
      string,
      {
        productId: string;
        variantKey: string;
        quantity: number;
        reason: string;
      }
    >
  >({});
  const [comments, setComments] = useState("");

  const handleItemToggle = (product: ClientOrderProduct) => {
    // <-- Use the correct type
    const { cartItemId, _id, variant } = product;
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      if (newSelected[cartItemId]) {
        delete newSelected[cartItemId];
      } else {
        newSelected[cartItemId] = {
          productId: _id, // _id from ClientOrderProduct is the Sanity product ID
          variantKey: variant?._key || "",
          quantity: 1,
          reason: DEFAULT_REASON,
        };
      }
      return newSelected;
    });
  };

  const handleItemChange = (
    cartItemId: string,
    field: "quantity" | "reason",
    value: string | number
  ) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cartItemId]: { ...prev[cartItemId], [field]: value },
    }));
  };

  const handleSubmit = () => {
    const itemsToSubmit = Object.values(selectedItems);
    if (itemsToSubmit.length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("orderNumber", orderNumber);
      formData.append("items", JSON.stringify(itemsToSubmit));
      formData.append("customerComments", comments);
      const result = await createReturnRequestAction(formData);
      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
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
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100"
                >
                  Request a Return
                </DialogTitle>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select the items you wish to return and provide a reason for
                    each.
                  </p>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {products.map((p) => (
                      <ReturnableItem
                        key={p.cartItemId}
                        product={p} // <-- Pass the ClientOrderProduct object to the child
                        isSelected={!!selectedItems[p.cartItemId]}
                        selectedQuantity={
                          selectedItems[p.cartItemId]?.quantity || 1
                        }
                        selectedReason={
                          selectedItems[p.cartItemId]?.reason || DEFAULT_REASON
                        }
                        onToggle={() => handleItemToggle(p)}
                        onItemChange={(field, value) =>
                          handleItemChange(p.cartItemId, field, value)
                        }
                      />
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor="return-comments"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Comments (Optional)
                    </label>
                    <textarea
                      id="return-comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      placeholder="Provide more details about your return request..."
                      className={`${inputStyles} mt-1`}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400"
                  >
                    {isPending && (
                      <Loader2 className="animate-spin" size={16} />
                    )}
                    Submit Request
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
