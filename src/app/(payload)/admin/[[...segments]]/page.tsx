import type { Metadata } from 'next'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { ImportMap } from 'payload'

// ✅ Alias use kar rahe hain
import configPromise from '@payload-config'

const importMap: ImportMap = {}

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config: configPromise, params, searchParams })

const Page = async ({ params, searchParams }: Args) => {
  // 1. Pehle hum wait karte hain taake config load ho jaye (Crash Fix)
  const resolvedConfig = await configPromise

  return RootPage({
    // 2. Phir hum usse wapis Promise bana kar pass karte hain (Type Error Fix)
    config: Promise.resolve(resolvedConfig), 
    params,
    searchParams,
    importMap,
  })
}

export default Page