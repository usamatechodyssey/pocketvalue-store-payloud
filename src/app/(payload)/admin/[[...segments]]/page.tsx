//[[...segments]] is a catch-all route in Next.js that captures all segments of the URL after /admin. This allows us to handle dynamic routing for the admin interface of Payload CMS. The RootPage component from Payload CMS will render the appropriate view based on the URL segments and the configuration provided.
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams })

export default async function Page({ params, searchParams }: Args) {
  return <RootPage config={config} params={params} searchParams={searchParams} importMap={importMap} />
}