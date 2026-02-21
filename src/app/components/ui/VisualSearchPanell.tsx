
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  X,
  UploadCloud,
  Search,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import SanityProduct from "@/sanity/types/product_types";
import { getProductsBySlugs } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";

interface VisualSearchPanelProps {
  onClose: () => void;
}

const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

export default function VisualSearchPanel({ onClose }: VisualSearchPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SanityProduct[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: { perView: "auto", spacing: 16 },
    slideChanged: (slider) => setCurrentSlide(slider.track.details.rel),
    created: () => setLoaded(true),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSearch = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🔥 CHANGE: Ab request hamare apne Next.js API Route pe jayegi
      const response = await fetch("/api/visual-search", {
        method: "POST",
        // Headers mein API KEY nahi bhejni, server khud lagayega
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Could not connect to AI server.");
      }

      const aiData: { results: { slug: string; similarity: number }[] } =
        await response.json();

      const slugs = aiData.results.map((item) => item.slug).filter(Boolean);

      if (slugs.length > 0) {
        const products = await getProductsBySlugs(slugs);
        setResults(products);
      } else {
        setResults([]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        console.error("Visual Search Error:", err.message);
      } else {
         setError("Search failed. Please try again.");
         console.error("Visual Search Error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      handleSearch(selectedFile);

      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile, handleSearch]);

  const resetSearch = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const allResultSlugs = results.map((p) => p.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-6 z-50"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-brand-primary">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <ImageIcon size={20} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">
            Visual Search AI
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="text-gray-500" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2  xl:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <label
            className={`relative flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden
            ${
              previewUrl
                ? "border-brand-primary bg-gray-50 dark:bg-gray-900"
                : "border-gray-300 dark:border-gray-600 hover:border-brand-primary hover:bg-brand-primary/5"
            }`}
          >
            {previewUrl ? (
              <>
                <div className="relative w-full h-full p-4">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    resetSearch();
                  }}
                  className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors z-10"
                  title="Remove Image"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={32} />
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  or drag and drop an image
                </p>
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">
                  Max 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="md:col-span-2 flex flex-col h-64">
          {isLoading ? (
            <div className="grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <Loader2
                className="animate-spin text-brand-primary mb-3"
                size={32}
              />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse">
                Analyzing image...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="relative h-full flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  Found {results.length} similar items
                </h4>
                <div className="flex gap-2">
                  {loaded && instanceRef.current && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          instanceRef.current?.prev();
                        }}
                        disabled={currentSlide === 0}
                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          instanceRef.current?.next();
                        }}
                        disabled={
                          currentSlide >=
                          (instanceRef.current.track.details?.slides.length ||
                            0) -
                            1
                        }
                        className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div ref={sliderRef} className="keen-slider grow">
                {results.map((product) => {
                  const imageUrl = product.defaultVariant?.images?.[0]
                    ? urlFor(product.defaultVariant.images[0]).url()
                    : PLACEHOLDER_IMAGE_URL;

                  return (
                    <div
                      key={product._id}
                      className="keen-slider__slide"
                      style={{ minWidth: 140, maxWidth: 140 }}
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        onClick={onClose}
                        className="block h-full group"
                      >
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 h-full flex flex-col hover:border-brand-primary/50 transition-colors shadow-sm">
                          <div className="relative aspect-square w-full mb-2 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                            <Image
                              src={imageUrl}
                              alt={product.title}
                              fill
                              className="object-contain group-hover:scale-105 transition-transform duration-300"
                              sizes="150px"
                              unoptimized // 👈 Ye zaroori hai local images (SVG/PNG) ke liye
                            />

                          </div>
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-tight group-hover:text-brand-primary">
                            {product.title}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-right">
                <Link
                  href={`/search?slugs=${allResultSlugs.join(",")}`}
                  onClick={onClose}
                  className="text-xs font-bold text-brand-primary hover:underline"
                >
                  View all results &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <div className="grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400">
              {selectedFile ? (
                <>
                  <Search size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">No matches found for this image.</p>
                </>
              ) : (
                <>
                  <div className="flex gap-2 mb-3 opacity-50">
                    <div className="w-12 h-16 bg-gray-200 rounded-md"></div>
                    <div className="w-12 h-16 bg-gray-300 rounded-md"></div>
                    <div className="w-12 h-16 bg-gray-200 rounded-md"></div>
                  </div>
                  <p className="text-sm">
                    Upload an image to find similar products
                  </p>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="absolute bottom-4 left-6 right-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}