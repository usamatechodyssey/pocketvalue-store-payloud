

"use server";

import { auth } from "@/app/auth";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import ReturnRequest, { IReturnRequest } from "@/models/ReturnRequest";
import { createReturnRequestReceivedEmail } from "@/email_templates/returnRequestReceivedEmail";
import { createReturnRequestAdminNotificationEmail } from "@/email_templates/returnRequestAdminNotificationEmail";

// ✅ PAYLOAD Native Mapping Imports
import { mapPayloadProductToSanity } from "@/sanity/lib/payload/plp/productMapper";
import SanityProduct from "@/sanity/types/product_types";

import { Types } from "mongoose";
import { CreateReturnRequestSchema } from "@/app/lib/zodSchemas";

// --- TYPES (DTOs for Frontend) ---
export type UserReturnRequest = {
  _id: string;
  orderNumber: string;
  status: IReturnRequest['status'];
  createdAt: string;
};

export type FullUserReturnRequest = {
  _id: string;
  orderNumber: string;
  status: IReturnRequest['status'];
  resolution?: IReturnRequest['resolution'];
  adminComments?: string;
  customerComments?: string;
  createdAt: string;
  items: Array<{
    productId: string;
    variantKey: string;
    quantity: number;
    reason: string;
    productDetails: SanityProduct | null;
  }>;
};

interface CreateReturnRequestResult {
  success: boolean;
  message: string;
}

// === ACTION #1: CREATE RETURN REQUEST (MUKAMMAL LOGIC) ===
export async function createReturnRequestAction(formData: FormData): Promise<CreateReturnRequestResult> {
  const session = await auth();
  if (!session?.user?.id || !session.user.name || !session.user.email) {
    return { success: false, message: "You must be logged in to request a return." };
  }

  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = CreateReturnRequestSchema.safeParse(formObject);

  if (!validatedFields.success) {
      return { success: false, message: validatedFields.error.issues[0].message };
  }
  
  const { orderId, orderNumber, items, customerComments } = validatedFields.data;

  try {
    await connectMongoose();
    
    const order = await Order.findOne({ 
      _id: orderId,
      userId: session.user.id 
    });

    if (!order) {
      return { success: false, message: "Order not found or you do not have permission." };
    }
    
    const newReturnRequest = new ReturnRequest({
      orderId: order._id,
      orderNumber,
      userId: session.user.id,
      items, 
      customerComments,
    });

    await newReturnRequest.save();

    // --- NODEMAILER EMAIL LOGIC ---
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!),
            auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
        });

        // Email #1: To Customer
        const customerEmailHtml = createReturnRequestReceivedEmail({
            customerName: session.user.name,
            orderNumber: orderNumber,
            requestId: newReturnRequest._id.toString(),
        });
        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: session.user.email,
            subject: `Return Request Received for Order ${orderNumber}`,
            html: customerEmailHtml,
        });

        // Email #2: To Admin
        if (process.env.ADMIN_EMAIL) {
            const adminEmailHtml = createReturnRequestAdminNotificationEmail({
                customerName: session.user.name,
                orderNumber: orderNumber,
                requestId: newReturnRequest._id.toString(),
                itemCount: items.length,
            });
            await transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `[New Return Request] Order ${orderNumber}`,
                html: adminEmailHtml,
            });
        }
    } catch (emailError) {
        console.error(`Email Error for return ${newReturnRequest._id}:`, emailError);
    }

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath('/account/returns');

    return { success: true, message: "Your return request has been submitted successfully." };

  } catch (error: any) {
    console.error("Error creating return request:", error);
    return { success: false, message: error.message || "Server Error" };
  }
}

// === ACTION #2: GET USER'S RETURN REQUESTS ===
export async function getUserReturnRequests(): Promise<UserReturnRequest[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    await connectMongoose();
    
    const requests = await ReturnRequest.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean<any[]>();

    return requests.map(req => ({
      _id: req._id.toString(),
      orderNumber: req.orderNumber,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
    }));

  } catch (error) {
    console.error("Error fetching returns:", error);
    return [];
  }
}

// === ACTION #3: GET SINGLE RETURN DETAIL (PAYLOAD SYNCED) ===
export async function getSingleUserReturnRequest(returnId: string): Promise<FullUserReturnRequest | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const payload = await getPayload({ config: configPromise });
    await connectMongoose();

    const request = await ReturnRequest.findOne({
      _id: returnId,
      userId: session.user.id
    }).lean<any>();

    if (!request) return null;

    // ✅ PAYLOAD LOGIC: Fetch items info from Payload
    const productIds = request.items.map((item: any) => item.productId);
    
    // Sirf valid MongoDB IDs fetch karenge taake crash na ho
    const validProductIds = productIds.filter((id: string) => /^[0-9a-fA-F]{24}$/.test(id));

    let productsMap = new Map<string, SanityProduct>();

    if (validProductIds.length > 0) {
        const payloadProducts = await payload.find({
            collection: 'products',
            where: { id: { in: validProductIds } },
            depth: 2,
            limit: 100
        });

        payloadProducts.docs.forEach((doc: any) => {
            productsMap.set(doc.id, mapPayloadProductToSanity(doc));
        });
    }

    return {
      _id: request._id.toString(),
      orderNumber: request.orderNumber,
      status: request.status,
      resolution: request.resolution,
      adminComments: request.adminComments,
      customerComments: request.customerComments,
      createdAt: request.createdAt.toISOString(),
      items: request.items.map((item: any) => ({
        ...item,
        productDetails: productsMap.get(item.productId) || null,
      })),
    };
  } catch (error) {
    console.error("Error fetching return details:", error);
    return null;
  }
}