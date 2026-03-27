//layout.tsx is the main layout component for the Payload CMS admin interface in a Next.js application. It uses the RootLayout component from @payloadcms/next/layouts to wrap the entire admin interface, providing a consistent structure and styling. The configuration for Payload CMS is imported from payload.config.ts, and an import map is provided to facilitate dynamic imports of components or modules as needed. Additionally, a server function is imported from actions.ts to handle server-side operations for the admin interface. This layout component ensures that all admin pages are rendered within the context of Payload CMS, allowing for seamless integration and functionality.
import configPromise from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import { importMap } from './admin/importMap'
import { serverFunction } from './actions' // ✅ Dedicated file se import
// @ts-ignore
import '@payloadcms/next/css'
import './admin.css' // ✅ Custom CSS for admin interface


export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout 
      config={configPromise} 
      importMap={importMap} 
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  )
}