
// /app/admin/orders/_components/SendEmailModal.tsx

"use client";

import { useState, useTransition, Fragment, FormEvent } from "react";
import { toast } from "react-hot-toast";
import { sendCustomEmail } from "@/app/actions/orderActions"; // <-- UPDATED IMPORT PATH
import { Mail, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";

interface SendEmailModalProps {
  customerId: string;
  customerName: string;
}

export default function SendEmailModal({
  customerId,
  customerName,
}: SendEmailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ subject?: string; message?: string }>(
    {}
  );
  const [isPending, startTransition] = useTransition();

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSubject("");
      setMessage("");
      setErrors({});
    }, 300);
  };

  const validateForm = (): boolean => {
    const newErrors: { subject?: string; message?: string } = {};
    if (!subject.trim()) newErrors.subject = "Subject cannot be empty.";
    if (!message.trim()) newErrors.message = "Message body cannot be empty.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    startTransition(async () => {
      // This now calls the centralized, Mongoose-based server action
      const result = await sendCustomEmail(customerId, subject, message);
      if (result.success) {
        toast.success(result.message);
        closeModal();
      } else {
        toast.error(result.message);
      }
    });
  };

  // --- Standard Input Styles ---
  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

  return (
    <>
      <button
        onClick={openModal}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Mail size={16} />
        Send Custom Email
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60" />
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
                <DialogPanel
                  as="form"
                  onSubmit={handleSendEmail}
                  className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                      <DialogTitle
                        as="h3"
                        className="text-xl font-bold text-gray-900 dark:text-gray-100"
                      >
                        Email to {customerName}
                      </DialogTitle>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <fieldset disabled={isPending} className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Subject
                        </label>
                        <input
                          id="subject"
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={`mt-1 ${inputStyles}`}
                        />
                        {errors.subject && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.subject}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                          className={`mt-1 resize-y ${inputStyles}`}
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.message}
                          </p>
                        )}
                      </div>
                    </fieldset>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex items-center justify-center gap-2 min-w-30 px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover disabled:bg-opacity-70"
                    >
                      {isPending && (
                        <Loader2 className="animate-spin" size={18} />
                      )}
                      {isPending ? "Sending..." : "Send Email"}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Centralized Action:** The `import` for `sendCustomEmail` has been changed from the old, local `_actions` file to the new, central `/app/actions/orderActions.ts`.
// - **Standardized Input Styling:** The `<input>` and `<textarea>` elements have been updated to use the project's standard `inputStyles`, ensuring a consistent UI.
