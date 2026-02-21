// /src/app/Bismillah786/settings/_actions/settingsActions.ts (FINAL & FULLY REFACTORED)

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import { client, writeClient } from "@/sanity/lib/client";
import groq from "groq";
import connectMongoose from "@/app/lib/mongoose"; 
import SettingModel, { IGateway, ISetting } from "@/models/Setting";
// === THE FIX IS HERE: Import Zod and our new schemas ===
import { z } from "zod";
import { SanitySettingsSchema, UpdatePaymentGatewaysSchema } from "@/app/lib/zodSchemas";

// Infer the type from Zod for safety. This replaces the old manual interface.
type SanitySettingsData = z.infer<typeof SanitySettingsSchema>;

// Security Helper Function
async function verifySuperAdmin(): Promise<void> {
  const session = await auth();
  const userRole = session?.user?.role;
  if (userRole !== 'Super Admin') {
    throw new Error("Permission Denied: You must be a Super Admin to perform this action.");
  }
}

// === ACTION #1: FETCH ALL SETTINGS DATA (No validation needed, no changes) ===
export async function getSettingsData() {
  try {
    // This security check is sufficient for a GET request
    const session = await auth();
    if (session?.user?.role !== 'Super Admin') {
      return { sanitySettings: null, paymentGateways: [], error: "Permission Denied" };
    }
    
    const sanityQuery = groq`
      *[_type == "settings" && _id == "settings"][0] {
        shippingRules, storeContactEmail, storePhoneNumber, storeAddress, socialLinks
      }
    `;

    const getMongoSettings = async () => {
      await connectMongoose(); 
      const settingsDoc = await SettingModel.findById<ISetting>('payment_gateways').lean();
      return settingsDoc ? settingsDoc.gateways : [];
    };

    const [sanitySettings, paymentGateways] = await Promise.all([
      client.fetch(sanityQuery),
      getMongoSettings()
    ]);

    return { 
      sanitySettings: sanitySettings || {},
      paymentGateways: paymentGateways || [],
      error: null 
    };

  } catch (error: any) {
    console.error("Failed to fetch settings data:", error);
    return { sanitySettings: null, paymentGateways: [], error: error.message };
  }
}

// === ACTION #2: UPDATE SANITY SETTINGS (Refactored with Zod) ===
export async function updateSanitySettings(settingsData: SanitySettingsData) {
  const validation = SanitySettingsSchema.safeParse(settingsData);
  if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
  }
  const data = validation.data;

  try {
    await verifySuperAdmin();
    await writeClient.patch('settings').set({
        shippingRules: data.shippingRules,
        storeContactEmail: data.storeContactEmail,
        storePhoneNumber: data.storePhoneNumber,
        storeAddress: data.storeAddress,
        socialLinks: data.socialLinks,
      }).commit({ autoGenerateArrayKeys: true });
      
    revalidatePath("/Bismillah786/settings");
    revalidatePath("/"); // Revalidate homepage in case contact info changed
    return { success: true, message: "Store settings updated successfully!" };
  } catch (error: any) {
    console.error("Failed to update Sanity settings:", error);
    return { success: false, message: error.message };
  }
}

// === ACTION #3: UPDATE PAYMENT GATEWAYS IN MONGODB (Refactored with Zod) ===
export async function updatePaymentGateways(gateways: IGateway[]) {
  const validation = UpdatePaymentGatewaysSchema.safeParse(gateways);
  if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
  }
  const validatedGateways = validation.data;

  try {
    await verifySuperAdmin();
    await connectMongoose(); 
    await SettingModel.findOneAndUpdate(
      { _id: 'payment_gateways' },
      { $set: { gateways: validatedGateways } },
      { upsert: true, new: true }
    );
    revalidatePath("/Bismillah786/settings");
    return { success: true, message: "Payment gateways updated successfully!" };
  } catch (error: any) {
    console.error("Failed to update payment gateways:", error);
    return { success: false, message: error.message };
  }
}