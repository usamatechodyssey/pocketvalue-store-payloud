
// /src/app/Bismillah786/admins/_components/InviteAdminModal.tsx (FINAL & CORRECTED)

"use client";

import { useState, useTransition, Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X, Loader2, UserPlus } from "lucide-react";
import { toast } from "react-hot-toast";
import { inviteAdmin } from "../_actions/adminActions";

interface InviteAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminInvited: () => void;
}

const ROLES_TO_ASSIGN: Array<"Store Manager" | "Content Editor"> = [
  "Store Manager",
  "Content Editor",
];

export default function InviteAdminModal({
  isOpen,
  onClose,
  onAdminInvited,
}: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"Store Manager" | "Content Editor">(
    "Content Editor"
  );
  const [isPending, startTransition] = useTransition();

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !role) {
      toast.error("Please enter an email and select a role.");
      return;
    }

    startTransition(async () => {
      const result = await inviteAdmin(email, role);
      if (result.success) {
        toast.success(result.message);
        setEmail("");
        setRole("Content Editor");
        onClose();
        onAdminInvited();
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                  <DialogTitle
                    as="h3"
                    className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <UserPlus size={22} /> Invite New Admin
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {/* ✅ FIX: 'User's' -> 'User&apos;s' */}
                      User&apos;s Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter the email of an existing customer"
                      required
                      className={inputStyles}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The user must already have a customer account on your
                      store.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Assign Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) =>
                        setRole(
                          e.target.value as "Store Manager" | "Content Editor"
                        )
                      }
                      required
                      className={inputStyles}
                    >
                      {ROLES_TO_ASSIGN.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-5 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover disabled:bg-opacity-50"
                    >
                      {isPending && (
                        <Loader2 className="animate-spin" size={16} />
                      )}
                      {isPending ? "Sending Invite..." : "Promote to Admin"}
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