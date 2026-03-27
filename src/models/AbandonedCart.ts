import { Schema, model, models, Document } from 'mongoose';

export interface IAbandonedCart extends Document {
  sessionId: string;
  userId?: string;
  items: any[]; // Cart Items
  subtotal: number;
  contactCaptured: boolean; // Kya user ne checkout mein email/phone dala tha?
  email?: string;
  phone?: string;
  isRecovered: boolean;
  lastUpdated: Date;
}

const AbandonedCartSchema = new Schema<IAbandonedCart>({
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, ref: 'User', index: true },
  items: [{ type: Schema.Types.Mixed }],
  subtotal: { type: Number, default: 0 },
  contactCaptured: { type: Boolean, default: false },
  email: { type: String },
  phone: { type: String },
  isRecovered: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

export default models.AbandonedCart || model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);