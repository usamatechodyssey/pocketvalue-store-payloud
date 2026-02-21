import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true, // Is se login features enable ho jayenge
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // Email aur Password Payload khud handle kar leta hai 'auth: true' ki wajah se
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: 'admin',
      required: true,
    },
  ],
}