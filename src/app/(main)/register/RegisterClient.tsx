
// /src/app/register/RegisterClient.tsx (UPGRADED FOR PROGRESSIVE VERIFICATION)

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { RegisterSchema } from "@/app/lib/zodSchemas"; // Import the updated schema
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; // Zod integration for react-hook-form

// Social Logins component (no changes needed here)
const SocialLogins = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    if (provider === "google") setIsGoogleLoading(true);
    if (provider === "facebook") setIsFacebookLoading(true);
    // After social login, the user will be logged in directly, as per our new auth.ts logic.
    await signIn(provider, { callbackUrl });
  };

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={isGoogleLoading || isFacebookLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <FaGoogle className="text-[#DB4437]" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Google
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          disabled={isGoogleLoading || isFacebookLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <FaFacebook className="text-[#1877F2]" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Facebook
          </span>
        </button>
      </div>
    </>
  );
};

// Form Data Type is now automatically inferred from our Zod Schema
type FormData = z.infer<typeof RegisterSchema>;

export default function RegisterClient() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(RegisterSchema), // Integrate Zod for live client-side validation
  });
  const router = useRouter();

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  // Simplified submission handler
  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        // On success, redirect to the email verification page
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
          Create Your Account
        </h1>
        <SocialLogins />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" {...register("name")} className={inputStyles} />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              className={inputStyles}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              className={inputStyles}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* --- PHONE NUMBER FIELD AND ALL OTP LOGIC REMOVED --- */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover disabled:bg-opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - **Removed Phone Number Field:** The entire phone number input and Firebase OTP logic (`uiState`, `onPhoneSubmit`, `onOtpSubmit`, etc.) have been completely removed from this component.
// - **Integrated Zod with React Hook Form:** The form now uses `zodResolver` to automatically validate inputs against our updated `RegisterSchema` (which no longer includes `phone`). This provides live, client-side validation.
// - **Simplified Submission Logic:** The `onSubmit` function is now much simpler. It submits only `name`, `email`, and `password` to the `/api/register` endpoint and redirects to email verification on success.
// - **Improved State Management:** Replaced manual `isLoading` state with `isSubmitting` from `react-hook-form` for better form state handling.
