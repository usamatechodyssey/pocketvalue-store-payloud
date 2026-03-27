// src/app/lib/payloadAuth.ts
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { headers } from "next/headers";

/**
 * 🛡️ UNIVERSAL STAFF VERIFIER
 * Yeh function har Server Action mein sab se pehle call hoga.
 */
export async function verifyStaff(
  allowedRoles: ("admin" | "manager" | "editor")[],
): Promise<any> {
  const payload = await getPayload({ config: configPromise });

  // 1. Payload Auth check karein (Cookie session ke zariye)
  const { user } = await payload.auth({ headers: await headers() });

  // 2. Agar login nahi hai
  if (!user) {
    throw new Error(
      "UNAUTHORIZED: Aapka Payload session expire ho chuka hai. Dobara login karein.",
    );
  }

  // 3. Role check karein
  const userRole = (user as any).role;
  if (!allowedRoles.includes(userRole)) {
    throw new Error(
      `FORBIDDEN: Aapka role [${userRole}] is action ke liye authorized nahi hai.`,
    );
  }

  return user; // Return user if everything is fine
}
