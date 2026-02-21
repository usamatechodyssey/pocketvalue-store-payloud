// /app/admin/categories/import/page.tsx (FINAL & CORRECTED)

"use client";

import { useState, useTransition, useCallback } from "react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { batchCreateCategories } from "../_actions/categoryActions";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  File,
  X,
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { CATEGORY_CSV_TEMPLATE } from "@/app/components/admin/CategoryCsvTemplate";

export default function ImportCategoriesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const [report, setReport] = useState<{
    success: boolean;
    message: string;
    errors: string[];
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type !== "text/csv") {
        toast.error("Invalid file type. Please upload a CSV file.");
        return;
      }
      setFile(selectedFile);
      setReport(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  // This is a standard and correct way to handle client-side file downloads.
  const handleDownloadTemplate = () => {
    try {
      const blob = new Blob([CATEGORY_CSV_TEMPLATE], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pocketvalue_category_template.csv");
      document.body.appendChild(link);

      link.click(); // Trigger the download

      // Clean up the DOM and memory
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("CSV template download failed:", error);
      toast.error("Could not prepare the template for download.");
    }
  };

  const handleImport = () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    setReport(null);
    toast.loading("Parsing and processing CSV file...");

    startTransition(() => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          toast.dismiss();
          const categories = results.data as {
            name: string;
            slug: string;
            parent_slug: string;
            image_url: string;
          }[];
          if (categories.length === 0) {
            toast.error("CSV file is empty or does not contain valid data.");
            return;
          }

          toast.loading(`Importing ${categories.length} categories...`);
          const result = await batchCreateCategories(categories);
          toast.dismiss();
          setReport(result);

          if (result.success) {
            toast.success("Import process completed!");
          } else {
            toast.error(
              "Some categories failed to import. See report for details."
            );
          }
          setFile(null);
        },
        error: (error: any) => {
          toast.dismiss();
          toast.error(`Failed to parse CSV file: ${error.message}`);
        },
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/Bismillah786/categories"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back to categories"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Import Categories in Bulk
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700 space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 1: Get the Template
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Download our template to structure your categories with parent
            relationships.
          </p>
          <button
            onClick={handleDownloadTemplate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FileText size={16} /> Download Template
          </button>
        </div>

        <div className="border-t dark:border-gray-700 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Step 2: Upload Your File
          </h2>
          {!file ? (
            <div
              {...getRootProps()}
              className={`mt-4 p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? "border-brand-primary bg-brand-primary/10" : "border-gray-300 dark:border-gray-600 hover:border-brand-primary"}`}
            >
              <input {...getInputProps()} />
              <UploadCloud size={48} className="mx-auto text-gray-400" />
              <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragActive
                  ? "Drop the file here..."
                  : "Drag & drop a file here, or click to select"}
              </p>
              <p className="text-xs text-gray-500 mt-1">CSV file up to 5MB</p>
            </div>
          ) : (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="border-t dark:border-gray-700 pt-8 flex justify-end">
          <button
            onClick={handleImport}
            disabled={!file || isProcessing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing && <Loader2 className="animate-spin" size={20} />}
            {isProcessing ? "Processing..." : `Start Import`}
          </button>
        </div>

        {report && (
          <div className="border-t dark:border-gray-700 pt-8">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Import Report
            </h2>
            <div
              className={`p-4 rounded-md border ${report.success ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}
            >
              <div className="flex items-center gap-3">
                {report.success ? (
                  <CheckCircle className="text-green-500" />
                ) : (
                  <XCircle className="text-red-500" />
                )}
                <p className="font-semibold">{report.message}</p>
              </div>
              {report.errors.length > 0 && (
                <div className="mt-4 pl-8">
                  <h3 className="font-bold text-sm text-red-800 dark:text-red-300">
                    Error Details:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1 mt-2 max-h-40 overflow-y-auto pr-2">
                    {report.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
