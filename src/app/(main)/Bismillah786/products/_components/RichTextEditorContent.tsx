// /app/Bismillah786/products/_components/RichTextEditorContent.tsx (The Heavy Tiptap Code)
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// Tiptap ki CSS file agar RichTextEditor ke paas thi, to ab is file ke paas aayegi
import "./tiptap-styles.css";

interface RichTextEditorProps {
  value: any;
  onChange: (richTextAsJson: any) => void;
}

// ✅ Component ka naam RichTextEditorContent rakh diya
const TiptapEditorContent = ({ value, onChange }: RichTextEditorProps) => { 
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert rounded-b-md border border-t-0 p-4 min-h-[150px] focus:outline-none focus:border-brand-primary dark:border-gray-600 w-full",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  return (
    <div className="rounded-md border border-gray-300 dark:border-gray-600">
      <EditorContent editor={editor} />
    </div>
  );
};

// ✅ Default Export bhi RichTextEditorContent hoga
export default TiptapEditorContent;