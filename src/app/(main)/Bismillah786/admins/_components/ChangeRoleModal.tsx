
"use client";

import { useState, useTransition, Fragment, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X, Loader2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import { updateUserRole, AdminUser } from "../_actions/adminActions";
import Image from "next/image";

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleChanged: (updatedAdmin: AdminUser) => void;
  admin: AdminUser;
}

type AssignableRole = "Store Manager" | "Content Editor" | "customer";
const EDITABLE_ROLES: Array<"Store Manager" | "Content Editor"> = [
  "Store Manager",
  "Content Editor",
];

export default function ChangeRoleModal({
  isOpen,
  onClose,
  onRoleChanged,
  admin,
}: ChangeRoleModalProps) {
  const [newRole, setNewRole] = useState<AssignableRole>(
    (admin.role as AssignableRole) || "customer"
  );
  const [isPending, startTransition] = useTransition();

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  // ✅ FIX: Performance Optimization
  // Only update state if the modal is OPEN and the role is DIFFERENT.
  // Dependencies are primitives (admin.role, admin._id) to prevent object reference loops.
  useEffect(() => {
    if (isOpen && admin.role && newRole !== admin.role) {
      setNewRole(admin.role as AssignableRole);
    }
    // We intentionally exclude 'newRole' from deps to avoid circular updates,
    // relying on isOpen or admin changes to trigger the reset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, admin.role, admin._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole === admin.role) {
      toast.error("You haven't selected a new role.");
      return;
    }

    startTransition(async () => {
      const result = await updateUserRole(admin._id, newRole);

      if (result.success) {
        onRoleChanged({ ...admin, role: newRole });
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
                    <Edit size={22} /> Change Role
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {/* Added fallback for image to prevent errors */}
                  <Image
                    src={admin.image || "/default-avatar.png"}
                    alt={admin.name || "Admin"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{admin.name}</p>
                    <p className="text-xs text-gray-500">{admin.email}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Assign New Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) =>
                        setNewRole(e.target.value as AssignableRole)
                      }
                      required
                      className={inputStyles}
                    >
                      {EDITABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      <option value="customer">
                        Remove Admin Access (Set to Customer)
                      </option>
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
                      {isPending ? "Updating..." : "Update Role"}
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