// /src/app/forgot-password/page.tsx

import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata: Metadata = {
  title: "Forgot Password | PocketValue",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
