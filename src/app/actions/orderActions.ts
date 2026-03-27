//ordersActions.ts
"use server";


import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/lib/mongoose";
import Order, { IOrder } from "@/models/Order";
import User from "@/models/User";
import nodemailer from "nodemailer";
import { UpdateOrderStatusSchema, SendCustomEmailSchema, CancelOrderSchema } from "@/app/lib/zodSchemas";

import { createCustomAdminEmailHtml } from '@/email_templates/CustomAdminEmail';
import { createOrderShippedHtml, createOrderProcessingHtml, createOrderDeliveredHtml, createOrderCancelledHtml } from '@/email_templates/orderStatusEmails';
import { verifyStaff } from "@/lib/payloadAuth";

// --- TYPES (Keeping them 100% same for Frontend Compatibility) ---
export type ClientOrderProduct = {
  _id: string;
  cartItemId: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
  image: any;
  variant?: { _key: string; name: string; }
};

export type ClientOrder = {
  _id: string;
  orderId: string;
  userId: string;
  totalPrice: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'On Hold';
  createdAt: string;
  products: ClientOrderProduct[];
  shippingAddress: IOrder['shippingAddress'];
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  subtotal: number;
  shippingCost: number;
};


interface GetPaginatedOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
  userId?: string | null;
}

// --- Helper for generating email content ---
function getEmailDetailsForStatus(status: string, customerName: string, orderId: string) {
    switch (status) {
        case "Processing": return { subject: `Your PocketValue Order is being processed! [#${orderId}]`, html: createOrderProcessingHtml({ customerName, orderId }) };
        case "Shipped": return { subject: `Your PocketValue Order has been Shipped! [#${orderId}]`, html: createOrderShippedHtml({ customerName, orderId }) };
        case "Delivered": return { subject: `Your PocketValue Order has been Delivered! [#${orderId}]`, html: createOrderDeliveredHtml({ customerName, orderId }) };
        case "Cancelled": return { subject: `Your PocketValue Order has been Cancelled [#${orderId}]`, html: createOrderCancelledHtml({ customerName, orderId }) };
        default: return { subject: null, html: null };
    }
}


// === ACTION #1: GET PAGINATED ORDERS ===
export async function getPaginatedOrders({ 
    page = 1, limit = 10, status = 'all', searchTerm = '', userId = null
}: GetPaginatedOrdersParams): Promise<{ orders: ClientOrder[], totalPages: number }> {
  try {
    // 🛡️ SECURITY LOCK: Any staff member can view the order list
    await verifyStaff(['admin', 'manager', 'editor']);

    await connectMongoose();
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.userId = userId;

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      query.$or = [
          { orderId: searchRegex },
          { "shippingAddress.fullName": searchRegex },
          { "shippingAddress.phone": searchRegex },
      ];
    }
    
    const [ordersData, totalOrders] = await Promise.all([
        Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IOrder[]>(),
        Order.countDocuments(query)
    ]);

    const clientOrders: ClientOrder[] = ordersData.map(order => ({
        _id: order._id.toString(),
        orderId: order.orderId,
        userId: order.userId,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: new Date(order.createdAt).toISOString(),
        products: order.products.map(p => ({
            _id: p._id,
            cartItemId: p.cartItemId,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            slug: p.slug,
            image: p.image,
            variant: p.variant
        })),
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
    }));

    return { orders: clientOrders, totalPages: Math.ceil(totalOrders / limit) };
  } catch (error) {
    console.error("Failed to fetch paginated orders:", error);
    return { orders: [], totalPages: 0 };
  }
}


// === ACTION #2: UPDATE ORDER STATUS (FIXED) ===
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<{ success: boolean; message: string }> {
     // 🛡️ SECURITY LOCK: Status update is sensitive, restricted to Admin and Manager
    await verifyStaff(['admin', 'manager']);
    const validation = UpdateOrderStatusSchema.safeParse({ orderId, newStatus });
    if (!validation.success) return { success: false, message: validation.error.issues[0].message };

    const { orderId: validatedOrderId, newStatus: validatedNewStatus } = validation.data;

    try {
        await connectMongoose();

        const order = await Order.findById(validatedOrderId);
        if (!order) throw new Error("Order not found.");
        if (order.status === validatedNewStatus) return { success: true, message: "Status is already the same." };

        order.status = validatedNewStatus;
        await order.save();
        
        // Email logic
        const user = await User.findById(order.userId);
        if (user?.email) {
            const { subject, html } = getEmailDetailsForStatus(validatedNewStatus, user.name, order.orderId);
            if (subject && html) {
                try {
                    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!), auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! } });
                    await transporter.sendMail({ from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`, to: user.email, subject, html });
                } catch (e) { console.error("Email Error:", e); }
            }
        }
        
        // ✅ REVALIDATION (Crucial Fix)
        revalidatePath(`/admin/orders`);
        revalidatePath(`/admin/orders/${validatedOrderId}`);
        revalidatePath(`/account/orders`);
        
        return { success: true, message: "Order status updated successfully!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// === ACTION #3: SEND CUSTOM EMAIL ===
export async function sendCustomEmail(customerId: string, subject: string, message: string) {
   // 🛡️ SECURITY LOCK: Admin and Manager only
    await verifyStaff(['admin', 'manager']);
    const validation = SendCustomEmailSchema.safeParse({ customerId, subject, message });
    if (!validation.success) return { success: false, message: validation.error.issues[0].message };

    try {
        await connectMongoose();
        const user = await User.findById(validation.data.customerId);
        if (!user?.email) return { success: false, message: "Customer email not found." };

        const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST!, port: Number(process.env.SMTP_PORT!), auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! } });
        const emailHtml = createCustomAdminEmailHtml({ customerName: user.name, message: validation.data.message });
        await transporter.sendMail({ from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`, to: user.email, subject: validation.data.subject, html: emailHtml });
        
        return { success: true, message: "Email sent successfully!" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// === ACTION #4: CANCEL AN ORDER ===
export async function cancelOrderAction(orderId: string) {
     // 🛡️ SECURITY LOCK: Full cancellation restricted to Super Admin
  await verifyStaff(['admin']);
  const validation = CancelOrderSchema.safeParse({ orderId });
  if (!validation.success) return { success: false, message: validation.error.issues[0].message };

  try {
    await connectMongoose();
    
    const order = await Order.findById(validation.data.orderId);
    if (!order) return { success: false, message: "Order not found." };
    
    order.status = "Cancelled";
    await order.save();
    
    revalidatePath(`/admin/orders`);
    revalidatePath(`/account/orders`);
    return { success: true, message: "Order cancelled." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// === ACTION #5: GET SINGLE ORDER ===
export async function getSingleOrder(orderId: string): Promise<IOrder | null> {
    try {
          // 🛡️ SECURITY LOCK: Staff access required
        await verifyStaff(['admin', 'manager', 'editor']);
        await connectMongoose();
        const order = await Order.findOne({ $or: [{ _id: orderId }, { orderId: orderId }] }).populate("userId", "name email").lean();
        return order ? JSON.parse(JSON.stringify(order)) : null;
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}

