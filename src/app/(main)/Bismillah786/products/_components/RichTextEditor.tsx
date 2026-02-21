// /app/Bismillah786/products/_components/RichTextEditor.tsx (The Dynamic Wrapper)

"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// ✅ FIX: Dynamic load the heavy content
const LazyTiptapEditor = dynamic(
  // ✅ Path RichTextEditorContent ko point kar raha hai
  () => import('./RichTextEditorContent'), 
  {
    ssr: false, // Client side component only
    loading: () => (
      <div className="w-full bg-gray-100 dark:bg-gray-700/50 rounded-b-md border border-t-0 border-gray-300 dark:border-gray-600 p-4 min-h-37.5 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={24} />
      </div>
    ),
  }
);

interface RichTextEditorProps {
  value: any; 
  onChange: (richTextAsJson: any) => void;
}

// ✅ Ye component chota hai, aur isay har file direct import karegi
export default function RichTextEditor(props: RichTextEditorProps) {
    return <LazyTiptapEditor {...props} />;
}