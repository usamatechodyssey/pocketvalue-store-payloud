"use server";

import connectMongoose from "@/app/lib/mongoose";
import UserSession from "@/models/UserSession";
import UserEvent from "@/models/UserEvent";
import AbandonedCart from "@/models/AbandonedCart";
import { auth } from "@/app/auth";

// 1. Initialize or Update Session (Pulse)
export async function trackSessionPulse(sessionData: any) {
  try {
    await connectMongoose();
    const { sessionId, ...rest } = sessionData;
    const authSession = await auth();

    const updateData: any = {
      ...rest,
      lastPulse: new Date(),
      isActive: true, // User online hote hi true
    };
    if (authSession?.user?.id) updateData.userId = authSession.user.id;

    await UserSession.findOneAndUpdate(
      { sessionId },
      { $set: updateData },
      { upsert: true, new: true },
    );
    return { success: true };
  } catch (e: any) {
    console.error("Pulse Error:", e.message);
    return { success: false };
  }
}

// 🔥 NAYA: User ke jate hi foran offline karne ke liye
export async function trackDisconnect(sessionId: string) {
  try {
    await connectMongoose();
    await UserSession.findOneAndUpdate(
      { sessionId },
      { $set: { isActive: false, lastPulse: new Date() } },
    );
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// 2. Log Granular Event
export async function logUserEvent(
  sessionId: string,
  eventType: string,
  path: string,
  metadata?: any,
) {
  try {
    await connectMongoose();
    await UserEvent.create({
      sessionId,
      eventType,
      path,
      metadata: { ...metadata, timestamp: new Date().toISOString() },
    });
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

// trackingActions.ts mein syncAbandonedCart ko is se replace karein:

export async function syncAbandonedCart(
  sessionId: string,
  cartItems: any[],
  subtotal: number,
  contactInfo?: any,
) {
  try {
    await connectMongoose();

    // 🛡️ PROFESSIONAL CLEANUP LOGIC
    // Agar cart khali hai, toh abandoned record rakhne ka koi maqsad nahi
    if (!cartItems || cartItems.length === 0 || subtotal <= 0) {
      await AbandonedCart.findOneAndDelete({ sessionId });
      return { success: true, message: "Abandoned cart cleared." };
    }

    const authSession = await auth();
    const updateFields: any = {
      items: cartItems,
      subtotal,
      userId: authSession?.user?.id || null,
      lastUpdated: new Date(),
      isRecovered: false,
    };

    if (contactInfo?.email) updateFields.email = contactInfo.email;
    if (contactInfo?.phone) updateFields.phone = contactInfo.phone;
    updateFields.contactCaptured = !!(updateFields.email || updateFields.phone);

    await AbandonedCart.findOneAndUpdate(
      { sessionId },
      { $set: updateFields },
      { upsert: true },
    );

    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
