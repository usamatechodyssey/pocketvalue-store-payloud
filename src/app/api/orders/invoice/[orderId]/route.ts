


// /src/app/api/orders/invoice/[orderId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import React from "react";
import ReactPDF from "@react-pdf/renderer";

// --- REFACTORED IMPORTS ---
import connectMongoose from "@/app/lib/mongoose";
import Order, { IOrder } from "@/models/Order"; // Hamara naya Mongoose model aur type
import { InvoiceTemplate } from "@/app/(main)/account/orders/[orderId]/_components/Invoice/InvoiceTemplate";
/**
 * Helper function to convert a NodeJS ReadableStream into a Buffer.
 */
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * GET handler to generate and stream a PDF invoice for a specific order.
 */
export async function GET(
  _req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectMongoose();

    const params = await paramsPromise;
    const { orderId } = params;

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      userId: session.user.id
    }).lean() as IOrder | null;

    if (!order) {
      return new NextResponse("Order not found or access denied.", { status: 404 });
    }

    const documentElement = React.createElement(InvoiceTemplate, { order: order });

    // BUG FIX #1: Aapke purane code ki tarah `as any` ko wapas add kiya gaya hai
    // kyunke @react-pdf/renderer ki types is custom component ke sath sahi kaam nahi karteen.
    const pdfStream = await ReactPDF.renderToStream(documentElement as any);

    const pdfBuffer = await streamToBuffer(pdfStream);

    // BUG FIX #2: Aapke purane code ki tarah Buffer ko Uint8Array mein convert kiya gaya hai
    // taake NextResponse usay sahi tareeqe se handle kar sake.
    const pdfUint8Array = new Uint8Array(pdfBuffer);

    const response = new NextResponse(pdfUint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.orderId}.pdf"`,
      },
    });

    return response;

  } catch (error: any) {
    console.error("Failed to generate PDF invoice:", error);
    return new NextResponse("Failed to generate invoice.", { status: 500 });
  }
}

// --- SUMMARY OF CHANGES ---
// - **Error Fix #1 (ReactPDF Type):** `renderToStream` ke argument mein `as any` ko dobara shamil kiya gaya hai, bilkul aapke original code ki tarah, taake TypeScript ka type error khatam ho jaye.
// - **Error Fix #2 (NextResponse Body):** `pdfBuffer` ko `new Uint8Array(pdfBuffer)` ka istemal karke convert kiya gaya hai, bilkul aapke original code ki tarah, taake `NextResponse` usay sahi tareeqe se accept kar sake.
// - **Architectural Consistency:** In ghaltiyon ko theek karne ke bawajood, hum ne Mongoose model ka istemal barqarar rakha hai taake hamara code poore project mein consistent rahe.