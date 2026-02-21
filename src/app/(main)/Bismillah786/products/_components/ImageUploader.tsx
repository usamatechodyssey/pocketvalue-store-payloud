"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image"; // Import Next.js Image component
import { urlFor } from "@/sanity/lib/image"; // Import Sanity's urlFor

// Sanity se asset reference ki type
interface SanityAsset {
  _type: "reference";
  _ref: string;
}

interface ImageUploaderProps {
  uploadedImages: SanityAsset[];
  setUploadedImages: React.Dispatch<React.SetStateAction<SanityAsset[]>>;
}

export default function ImageUploader({ uploadedImages, setUploadedImages }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setIsUploading(true);
      toast.loading("Uploading images...");

      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
          // Assuming your API route is at /api/admin/upload-image
          const response = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) throw new Error("Upload failed");
          const { asset } = await response.json();
          return { _type: "reference" as const, _ref: asset._id };
        } catch (error) {
          console.error(`Failed to upload ${file.name}`, error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const newAssets = results.filter(Boolean) as SanityAsset[];

      setUploadedImages((prev) => [...prev, ...newAssets]);

      setIsUploading(false);
      toast.dismiss();
      if (newAssets.length > 0) {
        toast.success(`${newAssets.length} image(s) uploaded successfully!`);
      } else {
        toast.error("Some images failed to upload.");
      }
    },
    [setUploadedImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    disabled: isUploading,
  });

  const removeImage = (ref: string) => {
    setUploadedImages((prev) => prev.filter((img) => img._ref !== ref));
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive ? "border-brand-primary bg-brand-primary/10" : "border-gray-300 dark:border-gray-600"}
        ${isUploading ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed" : "hover:border-brand-primary"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          {isUploading ? (
            <Loader2 size={48} className="animate-spin text-brand-primary" />
          ) : (
            <UploadCloud size={48} className={isDragActive ? "text-brand-primary" : ""} />
          )}
          <p className="font-semibold mt-2">
            {isUploading ? "Uploading..." : isDragActive ? "Drop the files here" : "Click to upload or drag 'n' drop"}
          </p>
          <p className="text-xs">PNG, JPG, GIF, WEBP up to 10MB</p>
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Uploaded Images</h4>
          <p className="text-xs text-gray-500 mb-4">
            Click on an image to set it as the primary variant image. Drag to reorder.
          </p>
          <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {uploadedImages.map((image) => (
              <li
                key={image._ref}
                className="relative aspect-square border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 group"
              >
                <Image 
                  src={urlFor(image).width(200).height(200).url()}
                  alt="Uploaded preview"
                  fill
                  sizes="150px"
                  className="object-cover rounded-md p-1"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image._ref)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}