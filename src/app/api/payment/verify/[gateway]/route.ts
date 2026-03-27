// src/app/api/payment/verify/[gateway]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/app/lib/payment/paymentAdapter";
import nodemailer from "nodemailer";
import { createOrderConfirmationHtml } from "@/email_templates/orderConfirmationEmail";
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";

async function parseRequestData(req: NextRequest) {
  if (req.method === "POST") {
    try {
      return await req.json();
    } catch {
      const formData = await req.formData();
      const data: { [key: string]: string } = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });
      return data;
    }
  } else {
    const data: { [key: string]: string } = {};
    req.nextUrl.searchParams.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }
}

async function handler(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ gateway: string }> },
) {
  const { gateway: gatewayKey } = await paramsPromise;
  let verificationResult;
  let finalOrderId = "";

  try {
    await connectMongoose();
    console.log(`[Verify API] Received callback for gateway: ${gatewayKey}`);
    const requestData = await parseRequestData(req);

    verificationResult = await verifyPayment(gatewayKey as any, requestData);

    if (!verificationResult || !verificationResult.orderId) {
      throw new Error(
        "Verification failed: Invalid response from payment adapter.",
      );
    }

    finalOrderId = verificationResult.orderId;
    console.log(
      `[Verify API] Verification result for Order ${finalOrderId}:`,
      verificationResult,
    );

    if (verificationResult.success) {
      const order = await Order.findOne({
        _id: finalOrderId,
        status: "Pending",
      });

      if (order) {
        order.status = verificationResult.orderStatus;
        order.paymentStatus = verificationResult.paymentStatus;
        order.paymentMethod = gatewayKey;
        order.transactionId = verificationResult.transactionId;
        await order.save();

        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST!,
            port: Number(process.env.SMTP_PORT!),
            auth: {
              user: process.env.SMTP_USER!,
              pass: process.env.SMTP_PASS!,
            },
          });
          const emailHtml = createOrderConfirmationHtml({
            orderId: order.orderId,
            customerName: order.shippingAddress.fullName,
            products: order.products,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            coupon: order.coupon,
            totalPrice: order.totalPrice,
            shippingAddress: order.shippingAddress,
          });
          await transporter.sendMail({
            from: '"PocketValue" <support@pocketvalue.pk>',
            to: order.shippingAddress.email,
            bcc: process.env.ADMIN_EMAIL,
            subject: `Your PocketValue Order Confirmation [${order.orderId}]`,
            html: emailHtml,
          });
          console.log(
            `[Verify API] Confirmation email sent for order ${finalOrderId}`,
          );
        } catch (emailError) {
          console.error(
            `CRITICAL: Order ${finalOrderId} updated, but FAILED to send email:`,
            emailError,
          );
        }
      } else {
        console.warn(
          `[Verify API] Order ${finalOrderId} not found or already processed.`,
        );
      }
    }
  } catch (error: any) {
    console.error("[Verify API] CRITICAL ERROR:", error);
    verificationResult = {
      success: false,
      message: error.message || "Unknown error.",
    };
  }

  // --- MAIN CHANGE IS HERE ---
  // Redirect ke bajaye JSON response bhejein
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

  if (verificationResult.success) {
    const successUrl = new URL(`/order-success/${finalOrderId}`, baseUrl);
    return NextResponse.json({
      success: true,
      message: "Payment verified",
      redirectUrl: successUrl.toString(),
    });
  } else {
    const failureUrl = new URL(`/order-failure`, baseUrl);
    failureUrl.searchParams.set("orderId", finalOrderId);
    failureUrl.searchParams.set(
      "reason",
      verificationResult.message || "Payment unsuccessful.",
    );
    return NextResponse.json({
      success: false,
      message: verificationResult.message,
      redirectUrl: failureUrl.toString(),
    });
  }
}

export { handler as GET, handler as POST };
