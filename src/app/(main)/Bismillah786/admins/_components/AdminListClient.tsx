
// /src/app/Bismillah786/admins/_components/AdminListClient.tsx

"use client";

import { useState, useTransition, useMemo } from "react";
import { AdminUser, updateUserRole } from "../_actions/adminActions";
import { Plus, Edit, UserPlus, Shield, Trash2 } from "lucide-react";
import Image from "next/image";
import ChangeRoleModal from "./ChangeRoleModal";
import InviteAdminModal from "./InviteAdminModal";
import { toast } from "react-hot-toast";

// --- Helper for role-specific styling (MUKAMMAL CODE) ---
const getRoleClasses = (role: string) => {
  switch (role) {
    case "Super Admin":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    case "Store Manager":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "Content Editor":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

interface AdminListClientProps {
  initialAdmins: AdminUser[];
}

export default function AdminListClient({ initialAdmins }: AdminListClientProps) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddNew = () => setIsInviteModalOpen(true);

  const handleEditRole = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setIsChangeRoleModalOpen(true);
  };

  const handleRemoveAdmin = (admin: AdminUser) => {
    if (!window.confirm(`Are you sure you want to remove admin access for ${admin.name}? Their role will be set to 'customer'.`)) return;

    startTransition(async () => {
      const result = await updateUserRole(admin._id, "customer");
      if (result.success) {
        setAdmins((prev) => prev.filter((a) => a._id !== admin._id));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const onAdminUpdate = (updatedAdmin: AdminUser) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin._id === updatedAdmin._id ? updatedAdmin : admin
      )
    );
  };

  const onAdminInvited = () => {
    startTransition(() => {
      window.location.reload();
    });
  };

  const sortedAdmins = useMemo(() => {
    return [...admins]
      .sort((a, b) => a.name.localeCompare(b.name))
      .sort((a, b) => (a.role === "Super Admin" ? -1 : 1));
  }, [admins]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Current Staff</h2>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-bold text-sm rounded-lg shadow-md hover:bg-brand-primary-hover"
        >
          <UserPlus size={16} /> Invite New Admin
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm border overflow-x-auto">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">User</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedAdmins.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <Image
                      src={admin.image || "/default-avatar.png"}
                      alt={admin.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{admin.name}</p>
                      <p className="text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleClasses(admin.role)}`}>
                    {admin.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {admin.role !== "Super Admin" ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditRole(admin)} className="p-2 text-gray-500 hover:text-brand-primary" aria-label="Edit Role">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleRemoveAdmin(admin)} className="p-2 text-gray-500 hover:text-red-600" aria-label="Remove Admin Access">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 text-gray-400 font-semibold text-xs">
                      <Shield size={14} />
                      <span>Owner</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InviteAdminModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onAdminInvited={onAdminInvited}
      />

      {editingAdmin && (
        <ChangeRoleModal
          isOpen={isChangeRoleModalOpen}
          onClose={() => setIsChangeRoleModalOpen(false)}
          onRoleChanged={onAdminUpdate}
          admin={editingAdmin}
        />
      )}
    </>
  );
}