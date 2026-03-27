

// // ✅ FINAL EXPORT: Sentry hat gaya, sirf PWA reh gaya
// export default withPayload(withPWA(nextConfig));
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  
  
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/fonts/**/*'], 
  },
  
  serverExternalPackages: [
    '@react-pdf/renderer', 
    'mongoose', 
    'mongodb', 
    'bcryptjs',
    'nodemailer',
    'sharp' // Sharp ko bhi yahan add karna behtar hai
  ],

  reactStrictMode: true, 

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
    styledComponents: true, 
  },

  experimental: {
    webpackBuildWorker: false, 
     // 🔥 FIX: Server Actions ki limit barha kar 10MB kar den
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      'lodash', 
      'react-icons', 
      '@headlessui/react',
      'recharts',
      'date-fns',
      'gsap',
      'swiper',
      'react-select',
      'react-leaflet',
      'leaflet',
      '@tiptap/react'
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      if (!config.optimization.splitChunks) {
          config.optimization.splitChunks = {};
      }
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) { 
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/|$])/)?.[1];
              return packageName ? `npm.${packageName.replace('@', '')}` : null;
            },
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },

  images: {
    loaderFile: './image-loader.ts',
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95], 
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io', port: '', pathname: '**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', port: '', pathname: '**' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com', port: '', pathname: '**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', port: '', pathname: '**' },
    ],
  },
  transpilePackages: ['papaparse'],
};

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", 
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPayload(withPWA(nextConfig));