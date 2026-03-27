// src/collections/Users.ts
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true, // Email aur Password Payload automatically handle karega
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Admin", // Sidebar mein Admin group mein nazar aayega
  },
  access: {
    // 🔓 Read: Koi bhi login staff member list dekh sakta hai
    read: ({ req: { user } }) => !!user,

    // 🔐 Create/Update/Delete: Sirf 'admin' (Super Admin) ko ijazat hai
    create: ({ req: { user } }) => (user as any)?.role === "admin",
    update: ({ req: { user } }) => (user as any)?.role === "admin",
    delete: ({ req: { user } }) => (user as any)?.role === "admin",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Super Admin", value: "admin" },
        { label: "Store Manager", value: "manager" },
        { label: "Content Editor", value: "editor" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Determines what parts of the dashboard this user can access.",
      },
    },
  ],
};
