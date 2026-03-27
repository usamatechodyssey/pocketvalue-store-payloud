import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/app/lib/mongoose";
import UserSession from "@/models/UserSession";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // 🛡️ Ab hum sessionId aur visitorId dono ko body se nikal rahe hain
    const { sessionId, visitorId, ...rest } = body;

    // ✅ Dono IDs ka hona zaroori hai professional tracking ke liye
    if (!sessionId || !visitorId) {
      return NextResponse.json(
        { error: "Missing required identifiers (Session or Visitor ID)" },
        { status: 400 },
      );
    }

    await connectMongoose();

    // NextAuth se user token hasil karein (agar logged in hai)
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    const updateData: any = {
      visitorId, // 👈 Long-term Identity
      ...rest, // UTMs, Device, OS, Browser data yahan se spread hoga
      lastPulse: new Date(),
      isActive: true,
    };

    // Agar user logged in hai toh uski ID ko session se jodh dein
    if (token?.sub) {
      updateData.userId = token.sub;
    }

    /**
     * 🚀 PROFESSIONAL UPSERT:
     * Yeh sessionId ki bunyaad par record dhoondega.
     * Agar mil gaya toh update karega, warna naya record bana dega.
     */
    await UserSession.findOneAndUpdate(
      { sessionId },
      { $set: updateData },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Critical API Pulse Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
