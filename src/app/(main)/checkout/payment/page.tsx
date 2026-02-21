

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/app/context/StateContext";
import { toastError } from "@/app/_components/shared/CustomToasts";
import { Loader2, ShieldCheck } from "lucide-react";

import ShippingSummary from "./_components/ShippingSummary";
import PaymentMethodSelector from "./_components/PaymentMethodSelector";

export default function PaymentPage() {
  const router = useRouter();
  
  // 🔥 FIX 1: clearCart ko yahan se destructure hi mat karein (zaroorat nahi hai)
  const { cartItems, grandTotal, shippingAddress, appliedCoupon } = useStateContext();

  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!shippingAddress) {
        router.replace("/checkout");
      } else if (
        cartItems.length === 0 &&
        !window.location.pathname.startsWith("/order-success")
      ) {
        router.replace("/cart");
      }
    }
  }, [shippingAddress, cartItems, router]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !selectedGateway) {
      toastError("Please select a payment method.");
      return;
    }
    setIsProcessing(true);
    let orderId = "";

    try {
      // Step 1: Create Order
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          cartItems,
          totalPrice: grandTotal,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.message || "Failed to create order.");

      orderId = orderData.orderId;

      // Step 2: Initiate Payment
      const paymentRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, gatewayKey: selectedGateway }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok)
        throw new Error(paymentData.message || "Payment initiation failed.");

      // Step 3: Handle Response & Redirect
      if (paymentData.redirectUrl) {
        // External Gateway (Stripe, etc.)
        
        // ❌ REMOVED: clearCart();  <-- Ye line masla kar rahi thi
        
        window.location.href = paymentData.redirectUrl;
      } else if (paymentData.success) {
        // Internal Gateways (COD, Bank Transfer)
        const verifyRes = await fetch(
          `/api/payment/verify/${selectedGateway}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, ...paymentData.data }),
          }
        );

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success && verifyData.redirectUrl) {
          
          // ❌ REMOVED: clearCart(); <-- Ye line bhi hata di
          
          // Manual browser redirect to Success Page
          window.location.href = verifyData.redirectUrl;
        } else {
          throw new Error(
            verifyData.message || "Failed to finalize your order."
          );
        }
      } else {
        throw new Error("An unknown error occurred during payment initiation.");
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toastError(
        error.message || "An unexpected error occurred.",
        "Order Failed"
      );
      setIsProcessing(false);
    }
  };

  if (!shippingAddress || cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-75">
        <Loader2 className="animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ShippingSummary />

      <PaymentMethodSelector
        selectedGateway={selectedGateway}
        onGatewaySelect={setSelectedGateway}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck size={16} />
          <span>Secure SSL Encrypted Payment</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedGateway}
          className="w-full h-12 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            `Pay Rs. ${grandTotal.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );
}