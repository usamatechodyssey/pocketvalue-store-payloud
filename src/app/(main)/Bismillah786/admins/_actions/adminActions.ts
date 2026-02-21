// /src/app/Bismillah786/admins/_actions/adminActions.ts (REFACTORED WITH ZOD)

"use server";

import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/lib/mongoose";
import User, { IUser } from "@/models/User";
import { Types } from "mongoose";
import { UpdateUserRoleSchema, InviteAdminSchema } from "@/app/lib/zodSchemas";


export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
  image?: string;
  createdAt: string;
};
type PlainAdminUser = Omit<IUser, '_id' | 'createdAt' | 'toObject' | 'save'> & { _id: Types.ObjectId; createdAt: Date; };
interface ServerResponse { success: boolean; message: string; }

async function verifySuperAdmin(): Promise<{ isSuperAdmin: boolean; session: any }> {
    const session = await auth();
    const userRole = session?.user?.role;
    return { isSuperAdmin: userRole === 'Super Admin', session };
}

// === ACTION #1: GET ALL ADMIN USERS (CORRECTLY TYPED) ===
export async function getAdmins(): Promise<AdminUser[]> {
    const { isSuperAdmin } = await verifySuperAdmin();
    if (!isSuperAdmin) return [];

    try {
        await connectMongoose();
        
        // Use .lean<PlainAdminUser[]>() to explicitly type the result
        const adminsFromDb = await User.find({
            role: { $in: ['Super Admin', 'Store Manager', 'Content Editor'] }
        }).lean<PlainAdminUser[]>();

        // Now, TypeScript knows the exact shape of each `admin` object.
        const plainAdmins: AdminUser[] = adminsFromDb.map(admin => ({
            _id: admin._id.toString(), // NO ERROR HERE
            name: admin.name,
            email: admin.email,
            role: admin.role,
            image: admin.image,
            createdAt: admin.createdAt.toISOString(),
        }));

        return plainAdmins;

    } catch (error) {
        console.error("Failed to fetch admins:", error);
        return [];
    }
}

// === ACTION #2: UPDATE A USER'S ROLE (Refactored with Zod) ===
export async function updateUserRole(userId: string, newRole: 'Store Manager' | 'Content Editor' | 'customer'): Promise<ServerResponse> {
    const validation = UpdateUserRoleSchema.safeParse({ userId, newRole });
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }
    const { userId: validatedUserId, newRole: validatedNewRole } = validation.data;
    
    const { isSuperAdmin } = await verifySuperAdmin();
    if (!isSuperAdmin) {
        return { success: false, message: "Permission denied." };
    }

    try {
        await connectMongoose();
        const userToUpdate = await User.findById(validatedUserId);

        if (!userToUpdate) {
            return { success: false, message: "User not found." };
        }
        if (userToUpdate.role === 'Super Admin') {
            return { success: false, message: "A Super Admin's role cannot be changed." };
        }

        userToUpdate.role = validatedNewRole;
        await userToUpdate.save();

        revalidatePath('/Bismillah786/admins');
        revalidatePath(`/Bismillah786/users/${validatedUserId}`);
        return { success: true, message: "User role updated successfully." };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}

// === ACTION #3: INVITE/PROMOTE A USER (Refactored with Zod) ===
export async function inviteAdmin(email: string, role: 'Store Manager' | 'Content Editor'): Promise<ServerResponse> {
    const validation = InviteAdminSchema.safeParse({ email, role });
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }
    const { email: validatedEmail, role: validatedRole } = validation.data;

    const { isSuperAdmin } = await verifySuperAdmin();
    if (!isSuperAdmin) {
        return { success: false, message: "Permission denied." };
    }

    try {
        await connectMongoose();
        const userToInvite = await User.findOne({ email: validatedEmail });

        if (!userToInvite) {
            return { success: false, message: `No user found with the email "${validatedEmail}". Ask them to sign up first.` };
        }
        if (userToInvite.role !== 'customer') {
            return { success: false, message: `This user is already an admin: ${userToInvite.role}.` };
        }

        userToInvite.role = validatedRole;
        await userToInvite.save();

        revalidatePath('/Bismillah786/admins');
        return { success: true, message: `${userToInvite.name} has been promoted to ${role}.` };
    } catch (error) {
        console.error("Error inviting admin:", error);
        return { success: false, message: "An internal server error occurred." };
    }
}