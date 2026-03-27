// src/app/components/admin/ImportProductsContent.tsx
"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import Papa from "papaparse";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  File,
  X,
  Timer,
  Play,
  Pause,
  RefreshCw,
  Wifi,
  WifiOff,
  Terminal,
  ChevronRight, // ✅ AlertTriangle, Activity use honge
} from "lucide-react";
import { useDropzone } from "react-dropzone";

// ✅ NEW IMPORT: Payload Product Action
import { batchCreateProductsPayload } from "@/app/actions/payloadProductActions";
// ✅ NEW IMPORT: CSV Template
import { CSV_TEMPLATE } from "@/app/components/admin/CsvTemplate";
import toast from "react-hot-toast";

// ✅ CONFIGURATION CONSTANTS (Defined locally for this component)
const BATCH_SIZE = 1; // Safe batch size for complex logic. Can be increased later.
const RETRY_DELAY = 2000; // 2 seconds delay on network error

// ✅ Type Definitions
type ProcessStatus =
  | "idle"
  | "parsing"
  | "processing"
  | "paused"
  | "waiting_network"
  | "completed";
interface Stats {
  processed: number;
  success: number;
  failed: number;
}
interface BatchResult {
  success: boolean;
  successful: number;
  failed: number;
  errors: string[];
}

export default function ImportProductsContent() {
  // --- STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [isOnline, setIsOnline] = useState(true);

  // Data & Queue
  const [pendingGroups, setPendingGroups] = useState<any[][]>([]);
  const [totalInitialCount, setTotalInitialCount] = useState(0);

  // Statistics
  const [stats, setStats] = useState<Stats>({
    processed: 0,
    success: 0,
    failed: 0,
  });
  const [logs, setLogs] = useState<string[]>([]); // For Terminal

  // Timing
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const startTimeRef = useRef<number>(0);
  const processedRef = useRef<number>(0);

  // Control Refs
  const shouldStopRef = useRef(false);
  const [isPending, startTransition] = useTransition(); // ✅ 'isPending' ab use ho raha hai for Button Disable

  // --- 1. NETWORK MONITORING (AUTO-PAUSE) ---
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      if (status === "waiting_network") {
        addLog("🟢 Internet Restored. Resuming in 3s...", "success");
        setTimeout(() => {
          setStatus("processing");
          startProcessing(); // Auto Resume
        }, 3000);
      } else if (typeof window !== "undefined") {
        toast.success("Internet Connected");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (status === "processing") {
        shouldStopRef.current = true; // Stop loop
        setStatus("waiting_network");
        addLog("🔴 Connection Lost! Pausing process...", "error");
        if (typeof window !== "undefined") {
          toast.error("No Internet. Pausing...");
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [status]);

  // --- 2. LOGGING SYSTEM (TERMINAL) ---
  // ✅ FIX: 'type' parameter ko ab use kar rahe hain
  const addLog = (
    message: string,
    logType: "info" | "success" | "error" | "warning" = "info",
  ) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    let prefixIcon = "";
    if (logType === "success") prefixIcon = "✅";
    else if (logType === "error") prefixIcon = "❌";
    else if (logType === "warning") prefixIcon = "⚠️";
    else prefixIcon = "💬";

    setLogs((prev) =>
      [`[${timestamp}] ${prefixIcon} ${message}`, ...prev].slice(0, 50),
    );
  };

  // --- 3. FILE HANDLING ---
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (acceptedFiles[0].type !== "text/csv") {
          addLog("Invalid file type. CSV only.", "error");
          if (typeof window !== "undefined")
            toast.error("Invalid file type. CSV only.");
          return;
        }
        setFile(acceptedFiles[0]);
        resetAll();
      }
    },
    [addLog],
  ); // addLog ko dependency mein daala

  // ✅ FIX: 'isDragActive' ko JSX mein use kiya
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  const resetAll = () => {
    setStatus("idle");
    setPendingGroups([]);
    setStats({ processed: 0, success: 0, failed: 0 });
    setLogs([]);
    setTimeLeft("--:--");
    setTotalInitialCount(0);
    shouldStopRef.current = false;
  };

  // --- 4. CSV PARSING ---
  const parseFile = () => {
    if (!file) return;
    setStatus("parsing");
    addLog("Analyzing CSV file structure...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      comments: "//",
      complete: (results) => {
        const rawData: any[] = results.data;
        if (rawData.length === 0) {
          if (typeof window !== "undefined") toast.error("CSV is empty.");
          setStatus("idle");
          return;
        }

        const groups: any[][] = [];
        let currentGroup: any[] = [];
        for (const row of rawData) {
          if (row.title && row.title.trim() !== "") {
            if (currentGroup.length > 0) groups.push(currentGroup);
            currentGroup = [row];
          } else if (currentGroup.length > 0) {
            currentGroup.push(row);
          }
        }
        if (currentGroup.length > 0) groups.push(currentGroup);

        if (groups.length === 0) {
          if (typeof window !== "undefined")
            toast.error("No products found. Check CSV headers.");
          setStatus("idle");
          return;
        }

        setPendingGroups(groups);
        setTotalInitialCount(groups.length);
        setStatus("idle");
        addLog(
          `✅ Analysis Complete. Found ${groups.length} products.`,
          "success",
        );
        if (typeof window !== "undefined")
          toast.success(`Ready to import ${groups.length} products.`);
      },
      error: (err) => {
        if (typeof window !== "undefined") toast.error("CSV Parse Error");
        addLog(`Error parsing CSV: ${err.message}`, "error");
        setStatus("idle");
      },
    });
  };

  // --- 5. CORE PROCESSING LOOP (Calls Server Action) ---
  const startProcessing = async () => {
    if (!isOnline) {
      setStatus("waiting_network");
      return;
    }
    if (pendingGroups.length === 0) return;

    shouldStopRef.current = false;
    setStatus("processing");

    if (stats.processed === 0) {
      startTimeRef.current = Date.now();
      processedRef.current = 0;
      addLog("🚀 Starting Import Process...", "info");
    } else {
      startTimeRef.current = Date.now() - processedRef.current * 1000; // Adjust for resume
      addLog("▶️ Resuming Import...", "info");
    }

    let currentQueue = [...pendingGroups];

    while (currentQueue.length > 0 && !shouldStopRef.current) {
      const batch = currentQueue.slice(0, BATCH_SIZE);

      try {
        addLog(`Processing batch of ${batch.length} products...`, "info");

        let result: BatchResult = {
          success: false,
          successful: 0,
          failed: 0,
          errors: [],
        };
        await new Promise<void>((resolve) => {
          startTransition(async () => {
            try {
              result = await batchCreateProductsPayload(batch);
            } catch (e: any) {
              result = {
                success: false,
                successful: 0,
                failed: batch.length,
                errors: [e.message || "Unknown Server Action error"],
              };
            }
            resolve();
          });
        });

        const s = result.successful || 0;
        const f = result.failed || 0;

        setStats((prev) => {
          const newProcessed = prev.processed + batch.length;
          processedRef.current = newProcessed;
          return {
            processed: newProcessed,
            success: prev.success + s,
            failed: prev.failed + f,
          };
        });

        if (result.errors?.length) {
          result.errors.forEach((err: string) => addLog(`❌ ${err}`, "error"));
        } else {
          addLog(`✅ Batch complete. ${s} Success.`, "success");
        }

        currentQueue = currentQueue.slice(BATCH_SIZE);
        setPendingGroups(currentQueue);

        calculateTimeLeft();

        await new Promise((r) => setTimeout(r, 100));
      } catch (error: any) {
        const msg = error.message || "";
        if (msg.includes("fetch") || msg.includes("Network") || !isOnline) {
          addLog(
            `⚠️ Network Glitch. Retrying in ${RETRY_DELAY}ms...`,
            "warning",
          );
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          if (!isOnline) shouldStopRef.current = true;
        } else {
          addLog(`💀 Critical Batch Error: ${msg}`, "error");
          setStats((prev) => ({
            ...prev,
            processed: prev.processed + batch.length,
            failed: prev.failed + batch.length,
          }));
          currentQueue = currentQueue.slice(BATCH_SIZE);
          setPendingGroups(currentQueue);
        }
      }
    }

    if (!shouldStopRef.current) {
      setStatus("completed");
      setTimeLeft("Completed");
      addLog("🎉 Import Job Finished!", "success");
      if (typeof window !== "undefined") toast.success("Import Completed!");
    }
  };

  const calculateTimeLeft = useCallback(() => {
    if (processedRef.current === 0 || totalInitialCount === 0) return;
    const elapsed = Date.now() - startTimeRef.current;
    const speed = elapsed / processedRef.current;
    const remaining = totalInitialCount - processedRef.current;
    const msLeft = speed * remaining;

    if (msLeft <= 0) {
      setTimeLeft("Finishing...");
      return;
    }
    const mins = Math.floor(msLeft / 60000);
    const secs = Math.floor((msLeft % 60000) / 1000);
    setTimeLeft(`${mins}m ${secs}s`);
  }, [totalInitialCount]);

  useEffect(() => {
    calculateTimeLeft();
  }, [stats.processed, calculateTimeLeft]);

  const handleDownloadTemplate = () => {
    const cleanCsvData = CSV_TEMPLATE.split("\n")
      .filter((line) => !line.startsWith("//"))
      .join("\n");
    const blob = new Blob([cleanCsvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "pocketvalue_template_v2.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDER ---
  const progressPercent =
    totalInitialCount > 0
      ? Math.min(Math.round((stats.processed / totalInitialCount) * 100), 100)
      : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Bulk Product Import
            {isOnline ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1 font-medium">
                <Wifi size={10} /> Online
              </span>
            ) : (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1 font-medium animate-pulse">
                <WifiOff size={10} /> Offline
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Import products efficiently with smart batching.
          </p>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <FileText size={16} /> Template
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: STATUS & CONTROLS */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. UPLOAD BOX (Visible when IDLE) */}
          {status === "idle" && totalInitialCount === 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-primary transition-all group">
              {!file ? (
                <div
                  {...getRootProps()}
                  className="text-center cursor-pointer py-10"
                >
                  <input {...getInputProps()} />
                  <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={40} className="text-brand-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">
                    Click or Drag CSV File
                  </h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Supports multi-variant rows
                  </p>
                  {/* ✅ FIX: isDragActive ko use kiya */}
                  {isDragActive && (
                    <p className="text-sm font-semibold text-brand-primary mt-2">
                      Drop your CSV here!
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center animate-in fade-in">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <File
                      size={48}
                      className="text-green-500 shadow-green-200 drop-shadow-md"
                    />
                    <div className="text-left">
                      <p className="font-bold text-lg text-gray-800 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                      className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <button
                    onClick={parseFile}
                    className="w-full max-w-sm mx-auto py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-lg shadow-lg shadow-brand-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Analyze File <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. CONFIRMATION (Parsed) */}
          {status === "idle" && totalInitialCount > 0 && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border-l-4 border-brand-primary animate-in slide-in-from-right-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Ready to Launch?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Found{" "}
                <span className="font-bold text-brand-primary">
                  {totalInitialCount} products
                </span>
                . System is ready to process.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={startProcessing}
                  disabled={isPending}
                  className="flex-1 py-3 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Play size={20} />
                  )}{" "}
                  Start Import
                </button>
                <button
                  onClick={resetAll}
                  disabled={isPending}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* 3. ACTIVE DASHBOARD (Processing/Paused/Completed) */}
          {status !== "idle" && status !== "parsing" && (
            <div className="space-y-6">
              {/* Progress Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    {status === "processing" && (
                      <Loader2
                        className="animate-spin text-brand-primary"
                        size={24}
                      />
                    )}
                    {status === "paused" && (
                      <Pause className="text-yellow-500" size={24} />
                    )}
                    {status === "waiting_network" && (
                      <WifiOff
                        className="text-red-500 animate-pulse"
                        size={24}
                      />
                    )}
                    {status === "completed" && (
                      <CheckCircle className="text-green-500" size={24} />
                    )}

                    <div>
                      <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                        {status === "processing"
                          ? "Importing..."
                          : status === "paused"
                            ? "Paused"
                            : status === "waiting_network"
                              ? "Waiting for Internet..."
                              : "Complete"}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        {stats.processed} / {totalInitialCount} Processed
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2">
                    {(status === "processing" ||
                      status === "waiting_network") && (
                      <button
                        onClick={() => (shouldStopRef.current = true)}
                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 border border-yellow-200"
                      >
                        <Pause size={20} />
                      </button>
                    )}
                    {status === "paused" && (
                      <button
                        onClick={startProcessing}
                        className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 font-bold flex gap-2"
                      >
                        <Play size={20} /> Resume
                      </button>
                    )}
                    {status === "completed" && (
                      <button
                        onClick={resetAll}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold flex gap-2"
                      >
                        <RefreshCw size={20} /> New File
                      </button>
                    )}
                  </div>
                </div>

                {/* Big Bar */}
                <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[10px] text-white font-bold
                                        ${
                                          status === "paused"
                                            ? "bg-yellow-400"
                                            : status === "waiting_network"
                                              ? "bg-red-400"
                                              : status === "completed"
                                                ? "bg-green-500"
                                                : "bg-blue-500"
                                        } /* ✅ FIX: 'processing' status ke liye blue-500 color use kiya */
                                    `}
                    style={{ width: `${progressPercent}%` }}
                  >
                    {progressPercent > 5 && `${progressPercent}%`}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 text-blue-500">
                    <Timer size={18} />{" "}
                    <span className="text-xs font-bold uppercase">
                      Time Left
                    </span>
                  </div>
                  <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                    {timeLeft}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 text-green-500">
                    <CheckCircle size={18} />{" "}
                    <span className="text-xs font-bold uppercase">Success</span>
                  </div>
                  <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                    {stats.success}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2 text-red-500">
                    <XCircle size={18} />{" "}
                    <span className="text-xs font-bold uppercase">Failed</span>
                  </div>
                  <p className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">
                    {stats.failed}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: TERMINAL / LOGS */}
        <div className="bg-gray-900 text-gray-200 p-4 rounded-xl shadow-xl border border-gray-700 flex flex-col h-125 font-mono text-sm">
          <div className="flex items-center gap-2 border-b border-gray-700 pb-3 mb-2">
            <Terminal size={16} className="text-brand-primary" />
            <span className="font-bold text-xs uppercase tracking-wider text-gray-400">
              Live Activity Log
            </span>
            {status === "processing" && (
              <span className="ml-auto flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
            {logs.length === 0 ? (
              <p className="text-gray-600 italic text-center mt-10">
                Waiting for activity...
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex gap-2 wrap-break-word animate-in fade-in slide-in-from-left-2 duration-300
                                ${
                                  log.includes("❌") || log.includes("Error")
                                    ? "text-red-400"
                                    : log.includes("✅")
                                      ? "text-green-400"
                                      : log.includes("⚠️")
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }
                            `}
                >
                  {/* ✅ FIX: Log timestamp aur message ko alag span mein dala */}
                  <span className="opacity-50 select-none text-[10px] pt-1 shrink-0">
                    {log.split("]")[0]}]
                  </span>
                  <span>{log.split("]")[1]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
