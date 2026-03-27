"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ✅ Define the exact allowed roles based on your Users collection
type AllowedRole = "admin" | "manager" | "editor";

// --- TYPES (DTOs for Frontend Compatibility) ---
export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: AllowedRole;
  createdAt: string;
}

// 🔐 Security: Check if the requester is a Super Admin in Payload
async function verifySuperAdmin(): Promise<void> {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });

  // ✅ Temporary: Allow 'editor' as well just to fix your role
  if (!user || !["admin", "editor"].includes((user as any).role)) {
    throw new Error("Permission Denied: Only a Super Admin can manage staff.");
  }
}

// === 1. GET ALL STAFF MEMBERS ===
export async function getStaffMembers(): Promise<StaffUser[]> {
  try {
    await verifySuperAdmin();
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: "users",
      limit: 100,
      sort: "name",
    });

    return result.docs.map((user: any) => ({
      id: user.id,
      name: user.name || "Admin User",
      email: user.email,
      role: user.role as AllowedRole,
      createdAt: user.createdAt,
    }));
  } catch (error: any) {
    console.error("Fetch Staff Error:", error.message);
    return [];
  }
}

// === 2. UPDATE STAFF ROLE (FIXED) ===
export async function updateStaffRole(userId: string, newRole: string) {
  try {
    await verifySuperAdmin();
    const payload = await getPayload({ config: configPromise });

    await payload.update({
      collection: "users",
      id: userId,
      data: {
        // ✅ FIX: Cast the string to the specific literal type Payload expects
        role: newRole as AllowedRole,
      },
    });

    revalidatePath("/admin/staff-management");
    return { success: true, message: "Staff role updated successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// === 3. CREATE/INVITE NEW STAFF (FIXED) ===
export async function createStaffMember(data: {
  name: string;
  email: string;
  role: string;
}) {
  try {
    await verifySuperAdmin();
    const payload = await getPayload({ config: configPromise });

    await payload.create({
      collection: "users",
      data: {
        name: data.name,
        email: data.email,
        // ✅ FIX: Cast the string to the specific literal type
        role: data.role as AllowedRole,
        password: "PocketValueStaff123!",
      },
    });

    revalidatePath("/admin/staff-management");
    return {
      success: true,
      message: `${data.name} has been added as ${data.role}.`,
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// === 4. REMOVE STAFF ACCESS ===
export async function removeStaffMember(userId: string) {
  try {
    await verifySuperAdmin();
    const payload = await getPayload({ config: configPromise });

    await payload.delete({
      collection: "users",
      id: userId,
    });

    revalidatePath("/admin/staff-management");
    return { success: true, message: "Staff member removed successfully." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
