

// /src/app/Bismillah786/returns/_actions/returnActions.ts (FINA// /src/app/Bismillah786/returns/_actions/returnActions.ts (REFACTORED WITH ZOD)

"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/auth";
import SanityProduct from '@/sanity/types/product_types';
import { getProductsByIds } from '@/sanity/lib/queries';
import connectMongoose from "@/app/lib/mongoose";
import ReturnRequest, { IReturnRequest } from "@/models/ReturnRequest";
import User, { IUser } from "@/models/User";
import Order, { IOrder } from "@/models/Order";
import { Types } from "mongoose";
import nodemailer from "nodemailer";
import { createReturnStatusUpdateEmail } from "@/email_templates/returnStatusUpdateEmail";

import { UpdateReturnStatusSchema } from "@/app/lib/zodSchemas";

// --- Type Definitions ---
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
    productDetails: SanityProduct | null;
  }>;
  userDetails: {
    _id: string;
    name: string;
    email: string;
  } | null;
  originalOrder: {
    shippingAddress: IOrder['shippingAddress'];
  } | null;
};

interface ServerResponse { success: boolean; message: string; }
interface GetPaginatedParams { page?: number; limit?: number; status?: string; searchTerm?: string; }

async function verifyAdmin(allowedRoles: string[]): Promise<void> {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
        throw new Error("Permission Denied.");
    }
}

// /src/app/Bismillah786/returns/_actions/returnActions.ts (UPDATE THIS FUNCTION)

// === ACTION #1: GET PAGINATED RETURN REQUESTS (FINAL AGGREGATION FIX) ===
export async function getPaginatedReturnRequests({ 
    page = 1, limit = 15, status = 'All', searchTerm = ''
}: GetPaginatedParams): Promise<{ requests: AdminReturnRequest[], totalPages: number }> {
    try {
        await verifyAdmin(['Super Admin', 'Store Manager']);
        await connectMongoose();
        
        const skip = (page - 1) * limit;

        const matchStage: any = {};
        if (status && status !== 'All') {
            matchStage.status = status;
        }

        // --- THE GUARANTEED FIX IS HERE ---
        const pipeline: any[] = [
            // Stage 1: Convert the userId string to a proper ObjectId
            {
              $addFields: {
                convertedUserId: { $toObjectId: "$userId" }
              }
            },
            // Stage 2: Now perform the lookup using the converted ObjectId
            {
              $lookup: {
                from: "users",
                localField: "convertedUserId", // Use the new, correct field
                foreignField: "_id",
                as: "userDetails"
              }
            },
            // Stage 3: Unwind the userDetails array (it will have one or zero elements)
            {
              $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true }
            },
            // Stage 4: Apply the initial status filter
            { $match: matchStage }
        ];
        
        // Add search stage AFTER the lookup, so we can search on the user's name/email
        if (searchTerm) {
          const searchRegex = new RegExp(searchTerm.trim(), 'i');
          pipeline.push({
            $match: {
              $or: [
                { orderNumber: searchRegex },
                { 'userDetails.name': searchRegex },
                { 'userDetails.email': searchRegex }
              ]
            }
          });
        }

        // Execute the pipeline to get data and total count
        const [requestsData, totalCountResult] = await Promise.all([
            ReturnRequest.aggregate(pipeline).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ReturnRequest.aggregate([...pipeline, { $count: 'total' }])
        ]);

        const totalRequests = totalCountResult[0]?.total || 0;
        
        // Format the final results
        const formattedRequests: AdminReturnRequest[] = requestsData.map(req => ({
            _id: req._id.toString(),
            orderNumber: req.orderNumber,
            status: req.status,
            createdAt: req.createdAt.toISOString(),
            customerName: req.userDetails?.name || 'N/A', // This will now have the correct name
            itemCount: req.items.length
        }));

        return { requests: formattedRequests, totalPages: Math.ceil(totalRequests / limit) };
    } catch (error) {
        console.error("Failed to fetch paginated return requests:", error);
        return { requests: [], totalPages: 0 };
    }
}

// === ACTION #2: GET SINGLE RETURN REQUEST DETAILS (FINAL & UNIFIED LOGIC) ===
export async function getSingleReturnRequest(returnId: string): Promise<FullAdminReturnRequest | null> {
  try {
    await verifyAdmin(['Super Admin', 'Store Manager']);
    await connectMongoose();

    // --- THE UNIFIED FIX IS HERE: Using Aggregation Pipeline ---
    // This is the same robust logic from the list page, but for a single ID.
    const pipeline: any[] = [
        // Stage 1: Match the specific return request by its _id
        {
          $match: {
            _id: new Types.ObjectId(returnId) // Convert string ID to ObjectId for matching
          }
        },
        // Stage 2: Convert the userId string to a proper ObjectId
        {
          $addFields: {
            convertedUserId: { $toObjectId: "$userId" }
          }
        },
        // Stage 3: Perform the lookup using the converted ObjectId
        {
          $lookup: {
            from: "users",
            localField: "convertedUserId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        // Stage 4: Unwind the userDetails array
        {
          $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true }
        },
        // Stage 5: Also join with the orders collection
        {
            $lookup: {
                from: "orders",
                localField: "orderId",
                foreignField: "_id",
                as: "originalOrder"
            }
        },
        {
            $unwind: { path: "$originalOrder", preserveNullAndEmptyArrays: true }
        }
    ];

    const results = await ReturnRequest.aggregate(pipeline);

    if (!results || results.length === 0) {
      return null;
    }
    const returnRequest = results[0]; // Get the single result

    const productIdsInRequest = returnRequest.items.map((item: any) => item.productId);
    const sanityProducts = await getProductsByIds(productIdsInRequest);
    const productsMap = new Map<string, SanityProduct>(sanityProducts.map((p: SanityProduct) => [p._id, p]));

    const finalResult: FullAdminReturnRequest = {
        _id: returnRequest._id.toString(),
        orderId: returnRequest.orderId?._id?.toString() || returnRequest.orderId || '',
        orderNumber: returnRequest.orderNumber,
        status: returnRequest.status,
        resolution: returnRequest.resolution,
        adminComments: returnRequest.adminComments,
        customerComments: returnRequest.customerComments,
        createdAt: returnRequest.createdAt.toISOString(),
        items: returnRequest.items.map((item: any) => ({
            productId: item.productId,
            variantKey: item.variantKey,
            quantity: item.quantity,
            reason: item.reason,
            productDetails: productsMap.get(item.productId) || null 
        })),
        userDetails: (returnRequest.userDetails && returnRequest.userDetails._id) ? {
            _id: returnRequest.userDetails._id.toString(),
            name: returnRequest.userDetails.name,
            email: returnRequest.userDetails.email,
        } : null,
        originalOrder: (returnRequest.originalOrder && returnRequest.originalOrder.shippingAddress) ? {
            shippingAddress: returnRequest.originalOrder.shippingAddress,
        } : null,
    };
    
    return finalResult;

  } catch (error) {
    console.error("Failed to fetch single return request:", error);
    return null;
  }
}

// === ACTION #3: UPDATE RETURN REQUEST STATUS (Refactored with Zod) ===
export async function updateReturnRequestStatus(returnId: string, formData: FormData): Promise<ServerResponse> {
  try {
    await verifyAdmin(['Super Admin', 'Store Manager']);

    // --- Step 1: Validate with Zod ---
    const formObject = {
        returnId: returnId,
        status: formData.get('status'),
        resolution: formData.get('resolution') || undefined, // Ensure undefined if empty
        adminComments: formData.get('adminComments') || undefined,
    };
    const validation = UpdateReturnStatusSchema.safeParse(formObject);
    if (!validation.success) {
        return { success: false, message: validation.error.issues[0].message };
    }
    const { status: newStatus, resolution, adminComments } = validation.data;
    
    await connectMongoose();
    
    const requestToUpdate = await ReturnRequest.findById(returnId).populate<{ userId: Pick<IUser, 'name' | 'email'> }>('userId', 'name email');
    
    if (!requestToUpdate) throw new Error("Return request not found.");
    
    const statusChanged = requestToUpdate.status !== newStatus;

    requestToUpdate.status = newStatus;
    // Zod ensures resolution is a valid enum value or undefined
    requestToUpdate.resolution = resolution; 
    if (adminComments) requestToUpdate.adminComments = adminComments;
    
    await requestToUpdate.save();


    const user = requestToUpdate.userId as any;
    if (statusChanged && user && user.email) {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!),
                auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
            });
            
            const emailHtml = createReturnStatusUpdateEmail({
                customerName: user.name,
                orderNumber: requestToUpdate.orderNumber,
                requestId: requestToUpdate._id.toString(),
                newStatus: newStatus,
                resolution: resolution,
                adminComments: adminComments
            });

            await transporter.sendMail({
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: user.email,
                subject: `Update on Your Return Request for Order ${requestToUpdate.orderNumber}`,
                html: emailHtml,
            });

        } catch (emailError) {
            console.error(`CRITICAL: Return request ${returnId} status updated, but FAILED to send email to user:`, emailError);
        }
    }

    revalidatePath(`/Bismillah786/returns`);
    revalidatePath(`/Bismillah786/returns/${returnId}`);

    return { success: true, message: "Return request updated successfully!" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, message };
  }
}
