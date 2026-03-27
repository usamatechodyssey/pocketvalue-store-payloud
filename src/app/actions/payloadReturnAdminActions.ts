// payloadReturnAdminActions.ts//Admin Actions for Payload Return Management (List, Detail, Update Status)
"use server";

import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import connectMongoose from "@/app/lib/mongoose";
import ReturnRequest, { IReturnRequest } from "@/models/ReturnRequest";
import  { IUser } from "@/models/User";
import  { IOrder } from "@/models/Order";
import { Types } from "mongoose";
import nodemailer from "nodemailer";
import { createReturnStatusUpdateEmail } from "@/email_templates/returnStatusUpdateEmail";
import { UpdateReturnStatusSchema } from "@/app/lib/zodSchemas";

// ✅ PAYLOAD Native Imports for Products & Mapping
import { mapPayloadProductToSanity } from "@/sanity/lib/payload/plp/productMapper";
import SanityProduct from '@/sanity/types/product_types';
import { verifyStaff } from "@/lib/payloadAuth";

// --- TYPES (Keeping them same as  to avoid frontend issues) ---
export type AdminReturnRequest = {
  _id: string;
  orderNumber: string;
  status: IReturnRequest['status'];
  createdAt: string;
  customerName: string;
  itemCount: number;
};

export type FullAdminReturnRequest = {
  _id: string;
  orderId: string;
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
    productDetails: SanityProduct | null; // Frontend expects this interface
  }>;
  userDetails: { _id: string; name: string; email: string; } | null;
  originalOrder: { shippingAddress: IOrder['shippingAddress']; } | null;
};

// 1. GET ALL RETURNS (Aggregated from MongoDB)
export async function getPaginatedReturnRequestsPayload({ 
    page = 1, limit = 15, status = 'All', searchTerm = ''
}) {
    try {
          // 🛡️ SECURITY LOCK: Staff access required
        await verifyStaff(['admin', 'manager', 'editor']);
        await connectMongoose();
        const skip = (page - 1) * limit;
        const matchStage: any = {};
        if (status && status !== 'All') matchStage.status = status;

        const pipeline: any[] = [
            { $addFields: { convertedUserId: { $toObjectId: "$userId" } } },
            { $lookup: { from: "users", localField: "convertedUserId", foreignField: "_id", as: "userDetails" } },
            { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
            { $match: matchStage }
        ];
        
        if (searchTerm) {
          const searchRegex = new RegExp(searchTerm.trim(), 'i');
          pipeline.push({ $match: { $or: [{ orderNumber: searchRegex }, { 'userDetails.name': searchRegex }, { 'userDetails.email': searchRegex }] } });
        }

        const [requestsData, totalCountResult] = await Promise.all([
            ReturnRequest.aggregate(pipeline).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ReturnRequest.aggregate([...pipeline, { $count: 'total' }])
        ]);

        const formattedRequests: AdminReturnRequest[] = requestsData.map(req => ({
            _id: req._id.toString(),
            orderNumber: req.orderNumber,
            status: req.status,
            createdAt: req.createdAt.toISOString(),
            customerName: req.userDetails?.name || 'N/A',
            itemCount: req.items.length
        }));

        return { requests: formattedRequests, totalPages: Math.ceil((totalCountResult[0]?.total || 0) / limit) };
    } catch (error) {
        console.error("Payload Return List Fetch Error:", error);
        return { requests: [], totalPages: 0 };
    }
}


export async function getSingleReturnRequestPayload(returnId: string): Promise<FullAdminReturnRequest | null> {
  try {
      // 🛡️ SECURITY LOCK: Staff access required
    await verifyStaff(['admin', 'manager', 'editor']);
    const payload = await getPayload({ config: configPromise });
    await connectMongoose();

    const pipeline: any[] = [
        { $match: { _id: new Types.ObjectId(returnId) } },
        { $addFields: { convertedUserId: { $toObjectId: "$userId" } } },
        { $lookup: { from: "users", localField: "convertedUserId", foreignField: "_id", as: "userDetails" } },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "orders", localField: "orderId", foreignField: "_id", as: "originalOrder" } },
        { $unwind: { path: "$originalOrder", preserveNullAndEmptyArrays: true } }
    ];

    const results = await ReturnRequest.aggregate(pipeline);
    if (!results.length) return null;
    const returnDoc = results[0];

    // ✅ FIX: Extract IDs and filter only valid MongoDB ObjectIDs (24-char hex)
    const rawProductIds = returnDoc.items.map((item: any) => item.productId);
    
    // Regular Expression to check for valid 24-char hex string
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);

    const validProductIds = rawProductIds.filter((id: string) => isValidObjectId(id));
    
    // Debugging logs to help you see what's happening
    console.log(`🔍 Total Product IDs in Request: ${rawProductIds.length}`);
    console.log(`✅ Valid MongoDB IDs found: ${validProductIds.length}`);

    let productsMap = new Map<string, SanityProduct>();

    // Agar kam az kam aik valid ID hai, tabhi Payload ko query karein
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
        _id: returnDoc._id.toString(),
        orderId: returnDoc.orderId?._id?.toString() || returnDoc.orderId || '',
        orderNumber: returnDoc.orderNumber,
        status: returnDoc.status,
        resolution: returnDoc.resolution,
        adminComments: returnDoc.adminComments,
        customerComments: returnDoc.customerComments,
        createdAt: returnDoc.createdAt.toISOString(),
        items: returnDoc.items.map((item: any) => ({
            productId: item.productId,
            variantKey: item.variantKey,
            quantity: item.quantity,
            reason: item.reason,
            // If ID was invalid or product not found, it returns null
            productDetails: productsMap.get(item.productId) || null 
        })),
        userDetails: returnDoc.userDetails ? {
            _id: returnDoc.userDetails._id.toString(),
            name: returnDoc.userDetails.name,
            email: returnDoc.userDetails.email,
        } : null,
        originalOrder: returnDoc.originalOrder?.shippingAddress ? {
            shippingAddress: returnDoc.originalOrder.shippingAddress,
        } : null,
    };
  } catch (error: any) {
    console.error("Payload Single Return Detail Error:", error.message);
    return null;
  }
}

// 3. UPDATE STATUS (Ditto same logic)
export async function updateReturnRequestStatusPayload(returnId: string, formData: FormData) {
  try {
     // 🛡️ SECURITY LOCK: Updating return status restricted to Admin and Manager
    await verifyStaff(['admin', 'manager']);
    const formObject = {
        returnId,
        status: formData.get('status'),
        resolution: formData.get('resolution') || undefined,
        adminComments: formData.get('adminComments') || undefined,
    };
    const validation = UpdateReturnStatusSchema.safeParse(formObject);
    if (!validation.success) return { success: false, message: validation.error.issues[0].message };
    
    const { status: newStatus, resolution, adminComments } = validation.data;
    await connectMongoose();
    
    const request = await ReturnRequest.findById(returnId).populate<{ userId: Pick<IUser, 'name' | 'email'> }>('userId', 'name email');
    if (!request) throw new Error("Return request not found.");
    
    const statusChanged = request.status !== newStatus;
    request.status = newStatus;
    request.resolution = resolution; 
    if (adminComments) request.adminComments = adminComments;
    await request.save();

    const user = request.userId as any;
    if (statusChanged && user?.email) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!),
                auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
            });
            const emailHtml = createReturnStatusUpdateEmail({ customerName: user.name, orderNumber: request.orderNumber, requestId: request._id.toString(), newStatus, resolution, adminComments });
            await transporter.sendMail({ from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`, to: user.email, subject: `Return Update: Order ${request.orderNumber}`, html: emailHtml });
        } catch (e) { console.error("Email failed to send during return update:", e); }
    }

    revalidatePath(`/admin/returns`);
    revalidatePath(`/admin/returns/${returnId}`);
    return { success: true, message: "Return status updated successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}