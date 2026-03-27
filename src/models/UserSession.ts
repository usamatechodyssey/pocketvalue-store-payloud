import { Schema, model, models, Document } from "mongoose";

export interface IUserSession extends Document {
  visitorId: string;   // 👈 Long-term ID (Permanent for 30 days)
  sessionId: string;   // 👈 Short-term ID (Changes if Source changes)
  userId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: "mobile" | "desktop" | "tablet";
  os: string;
  browser: string;
  city?: string;
  country?: string;
  lastPulse: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    visitorId: { type: String, required: true, index: true }, 
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: "User", index: true },
    utmSource: { type: String, default: "Direct" },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    device: { type: String, enum: ["mobile", "desktop", "tablet"], default: "desktop" },
    os: { type: String },
    browser: { type: String },
    city: { type: String },
    country: { type: String },
    lastPulse: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.UserSession || model<IUserSession>("UserSession", UserSessionSchema);