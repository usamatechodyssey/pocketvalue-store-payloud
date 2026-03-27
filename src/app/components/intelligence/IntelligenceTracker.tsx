// "use client";

// import { useEffect, useRef } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// import { useStateContext } from "@/app/context/StateContext";
// import { logUserEvent, syncAbandonedCart } from "@/app/actions/trackingActions";
// import { useSession } from "next-auth/react";

// interface IntelligenceProps {
//   sessionId: string | null;
//   visitorId: string | null;
// }

// export default function IntelligenceTracker({
//   sessionId,
//   visitorId,
// }: IntelligenceProps) {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const { cartItems, subtotal } = useStateContext();
//   const { data: session } = useSession();

//   const lastTrackedUrl = useRef("");
//   const lastSyncedCart = useRef("");
//   const pulseStarted = useRef(false);

//   // 🛰️ 1. SILENT HEARTBEAT ENGINE (Using API to prevent Refresh loops)
//   useEffect(() => {
//     if (!sessionId || !visitorId || pulseStarted.current) return;

//     const sendSilentPulse = async () => {
//       const ua = navigator.userAgent;
//       const platform = navigator.platform;
//       const params = new URLSearchParams(window.location.search);

//       // Bulletproof OS Detection
//       let detectedOS = "Unknown";
//       if (/Win/i.test(platform) || /Win/i.test(ua)) detectedOS = "Windows";
//       else if (/Android/i.test(ua)) detectedOS = "Android";
//       else if (/iPhone|iPad|iPod/i.test(ua)) detectedOS = "iOS";
//       else if (/Mac/i.test(platform) || /Mac/i.test(ua)) detectedOS = "MacOS";
//       else if (/Linux/i.test(platform) || /Linux/i.test(ua))
//         detectedOS = "Linux";

//       try {
//         await fetch("/api/tracking/pulse", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             visitorId,
//             sessionId,
//             utmSource: params.get("utm_source") || "Direct",
//             utmMedium: params.get("utm_medium") || "None",
//             utmCampaign: params.get("utm_campaign") || "None",
//             os: detectedOS,
//             browser: ua.includes("Edg")
//               ? "Edge"
//               : ua.includes("Chrome")
//                 ? "Chrome"
//                 : ua.includes("Firefox")
//                   ? "Firefox"
//                   : "Safari",
//             device: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
//           }),
//         });
//       } catch (e) {}
//     };

//     pulseStarted.current = true;
//     sendSilentPulse(); // Pehli hit foran
//     const interval = setInterval(sendSilentPulse, 40000); // Har 40 second baad heartbeat

//     return () => clearInterval(interval);
//   }, [sessionId, visitorId]);

//   // 📝 2. UNIQUE PAGE VIEW LOGGING (Storage Guarded)
//   useEffect(() => {
//     const currentPath = pathname;
//     if (!sessionId || currentPath === lastTrackedUrl.current) return;

//     // Refresh-proof logic: Ek hi session mein ek page dubara count nai hoga
//     const viewKey = `pv_v3_view_${sessionId}_${currentPath}`;
//     if (sessionStorage.getItem(viewKey)) {
//       lastTrackedUrl.current = currentPath;
//       return;
//     }

//     lastTrackedUrl.current = currentPath;
//     logUserEvent(sessionId, "page_view", currentPath, {
//       searchTerm: searchParams.get("q"),
//     })
//       .then(() => {
//         sessionStorage.setItem(viewKey, "true");
//       })
//       .catch(() => {});
//   }, [pathname, sessionId, searchParams]);

//   // 🛒 3. SMART CART SYNC (Debounced)
//   useEffect(() => {
//     const cartSnapshot = JSON.stringify(cartItems) + subtotal;
//     if (cartSnapshot === lastSyncedCart.current || !sessionId) return;

//     const handler = setTimeout(async () => {
//       try {
//         const contactInfo = session?.user
//           ? { email: session.user.email, phone: (session.user as any).phone }
//           : undefined;

//         await syncAbandonedCart(sessionId, cartItems, subtotal, contactInfo);
//         lastSyncedCart.current = cartSnapshot;
//       } catch (e) {}
//     }, 4000);

//     return () => clearTimeout(handler);
//   }, [cartItems, subtotal, session, sessionId]);

//   return null;
// }
// "use client";

// import { useEffect, useRef } from "react";
// import { usePathname, useSearchParams } from "next/navigation";
// import { useStateContext } from "@/app/context/StateContext";
// import { logUserEvent, syncAbandonedCart } from "@/app/actions/trackingActions";
// import { useSession } from "next-auth/react";

// export default function IntelligenceTracker({
//   sessionId,
//   visitorId,
// }: {
//   sessionId: string | null;
//   visitorId: string | null;
// }) {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const { cartItems, subtotal } = useStateContext();
//   const { data: session } = useSession();

//   const lastTrackedUrl = useRef("");
//   const lastSyncedCart = useRef("");
//   const pulseStarted = useRef(false);

//   // 🛰️ 1. SILENT HEARTBEAT (No change here, working fine)
//   useEffect(() => {
//     if (!sessionId || !visitorId || pulseStarted.current) return;
//     const sendSilentPulse = async () => {
//       const ua = navigator.userAgent;
//       const params = new URLSearchParams(window.location.search);
//       try {
//         await fetch("/api/tracking/pulse", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             visitorId,
//             sessionId,
//             utmSource: params.get("utm_source") || "Direct",
//             utmMedium: params.get("utm_medium") || "None",
//             utmCampaign: params.get("utm_campaign") || "None",
//             os: ua.includes("Win") ? "Windows" : "Other",
//             device: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
//           }),
//         });
//       } catch (e) {}
//     };
//     pulseStarted.current = true;
//     sendSilentPulse();
//     const interval = setInterval(sendSilentPulse, 40000);
//     return () => clearInterval(interval);
//   }, [sessionId, visitorId]);

//   // 📝 2. UNIQUE PAGE VIEW LOGGING
//   useEffect(() => {
//     const currentPath = pathname;
//     if (!sessionId || currentPath === lastTrackedUrl.current) return;
//     const viewKey = `pv_v3_view_${sessionId}_${currentPath}`;
//     if (sessionStorage.getItem(viewKey)) {
//       lastTrackedUrl.current = currentPath;
//       return;
//     }
//     lastTrackedUrl.current = currentPath;
//     logUserEvent(sessionId, "page_view", currentPath, {
//       searchTerm: searchParams.get("q"),
//     })
//       .then(() => sessionStorage.setItem(viewKey, "true"))
//       .catch(() => {});
//   }, [pathname, sessionId, searchParams]);

//   // 🛒 3. SMART CART SYNC (THE FIX IS HERE)
//   useEffect(() => {
//     // Generate a unique fingerprint for the current cart state
//     const cartSnapshot = JSON.stringify(cartItems) + subtotal;

//     // Stop if nothing changed
//     if (cartSnapshot === lastSyncedCart.current || !sessionId) return;

//     const handler = setTimeout(async () => {
//       try {
//         const contactInfo = session?.user
//           ? { email: session.user.email, phone: (session.user as any).phone }
//           : undefined;

//         // Backend handle karega ke agar empty hai toh delete kare, warna sync kare
//         await syncAbandonedCart(sessionId, cartItems, subtotal, contactInfo);

//         lastSyncedCart.current = cartSnapshot;
//       } catch (e) {
//         console.error("Cart Sync Failed", e);
//       }
//     }, 4000);

//     return () => clearTimeout(handler);
//   }, [cartItems, subtotal, session, sessionId]);

//   return null;
// }
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useStateContext } from "@/app/context/StateContext";
import { logUserEvent, syncAbandonedCart } from "@/app/actions/trackingActions";
import { useSession } from "next-auth/react";

export default function IntelligenceTracker({
  sessionId,
  visitorId,
}: {
  sessionId: string | null;
  visitorId: string | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartItems, subtotal } = useStateContext();
  const { data: session } = useSession();

  const lastTrackedUrl = useRef("");
  const lastSyncedCart = useRef("");
  const prevCartCount = useRef(cartItems?.length || 0); // 👈 Watcher for Add to Cart
  const pulseStarted = useRef(false);

  // 🛰️ 1. SILENT HEARTBEAT (Keep User Live)
  useEffect(() => {
    if (!sessionId || !visitorId || pulseStarted.current) return;
    const sendSilentPulse = async () => {
      const ua = navigator.userAgent;
      const params = new URLSearchParams(window.location.search);
      try {
        await fetch("/api/tracking/pulse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId,
            sessionId,
            utmSource: params.get("utm_source") || "Direct",
            utmMedium: params.get("utm_medium") || "None",
            utmCampaign: params.get("utm_campaign") || "None",
            os: ua.includes("Win") ? "Windows" : "Other",
            device: /Mobi|Android/i.test(ua) ? "mobile" : "desktop",
          }),
        });
      } catch (e) {}
    };
    pulseStarted.current = true;
    sendSilentPulse();
    const interval = setInterval(sendSilentPulse, 40000);
    return () => clearInterval(interval);
  }, [sessionId, visitorId]);

  // 📝 2. EVENT LOGGING (Page Views & Checkout Start)
  useEffect(() => {
    const currentPath = pathname;
    if (!sessionId || currentPath === lastTrackedUrl.current) return;

    const viewKey = `pv_v4_view_${sessionId}_${currentPath}`;
    if (sessionStorage.getItem(viewKey)) {
      lastTrackedUrl.current = currentPath;
      return;
    }

    lastTrackedUrl.current = currentPath;

    // Detect Event Type
    let eventType: "page_view" | "checkout_start" | "search" = "page_view";
    if (pathname === "/checkout") eventType = "checkout_start";
    if (pathname.startsWith("/search")) eventType = "search";

    logUserEvent(sessionId, eventType, currentPath, {
      searchTerm: searchParams.get("q"),
      visitorId,
    })
      .then(() => {
        sessionStorage.setItem(viewKey, "true");
      })
      .catch(() => {});
  }, [pathname, sessionId, searchParams, visitorId]);

  // 🛒 3. ADD TO CART TRACKER (The Missing Link)
  useEffect(() => {
    if (!sessionId) return;

    // Agar cart items barhay hain, toh "add_to_cart" event bhejo
    if (cartItems.length > prevCartCount.current) {
      const lastItem = cartItems[cartItems.length - 1];
      logUserEvent(sessionId, "add_to_cart", pathname, {
        productId: lastItem?._id,
        price: lastItem?.price,
        visitorId,
      });
    }
    prevCartCount.current = cartItems.length;
  }, [cartItems.length, sessionId, pathname, visitorId]);

  // 🔄 4. ABANDONED CART SYNC (Logic for Recovery Pulse)
  useEffect(() => {
    const cartSnapshot = JSON.stringify(cartItems) + subtotal;
    if (cartSnapshot === lastSyncedCart.current || !sessionId) return;

    const handler = setTimeout(async () => {
      try {
        const contactInfo = session?.user
          ? { email: session.user.email, phone: (session.user as any).phone }
          : undefined;
        await syncAbandonedCart(sessionId, cartItems, subtotal, contactInfo);
        lastSyncedCart.current = cartSnapshot;
      } catch (e) {}
    }, 4000);

    return () => clearTimeout(handler);
  }, [cartItems, subtotal, session, sessionId]);

  return null;
}
