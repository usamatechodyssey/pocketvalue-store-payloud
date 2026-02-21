
"use client"; // <--- ✅ ADD THIS LINE!
// /app/Bismillah786/products/import/page.tsx (Dynamic Wrapper)
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import Link from "next/link";

// ✅ FIX: Heavy papaparse aur useDropzone wali file ko lazy load karein
const ImportProductsContent = dynamic(
  // Path to the actual content file
  () => import("./ImportProductsContent"),
  {
    ssr: false, // Client-side logic hai
    loading: () => (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700 h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    ),
  }
);

// Ye file chota rahega aur sirf wrapper render karega
export default function ImportProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Bulk Import Products
        </h1>
        <Link
          href="/Bismillah786/products"
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          ← Back to Products
        </Link>
      </div>
      {/* Lazy Loaded Content */}
      <ImportProductsContent />
    </div>
  );
}
