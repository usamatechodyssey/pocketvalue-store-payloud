// src/models/Setting.ts

import mongoose, { Schema, Document } from 'mongoose';

// ✅ FIXED INTERFACE: Index Signature add kiya aur extra line remove ki
export interface IGatewayCredentials { // Export kiya taake baqi files use kar saken
  [key: string]: string | undefined; // <--- YEH HAI ASAL FIX! Allows dynamic key access
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  storeId?: string;
  hashKey?: string;
  merchantId?: string;
  password?: string;
  integritySalt?: string;
}

// Interface for a single gateway object in the array
export interface IGateway { // Exported for consistent use across components
  key: string;
  name: string;
  enabled: boolean;
  credentials?: IGatewayCredentials; // credentials optional bhi ho sakte hain
}

// Interface for the main settings document
export interface ISetting extends Document {
  _id: 'payment_gateways';
  gateways: IGateway[];
}

// Mongoose Schema for the nested credentials object
const GatewayCredentialsSchema = new Schema({
  bankName: { type: String },
  accountTitle: { type: String },
  accountNumber: { type: String },
  iban: { type: String },
  storeId: { type: String },
  hashKey: { type: String },
  merchantId: { type: String },
  password: { type: String },
  integritySalt: { type: String },
}, { _id: false }); // No _id for subdocuments

// Mongoose Schema for a single gateway
const GatewaySchema = new Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  credentials: { type: GatewayCredentialsSchema, default: {} },
}, { _id: false }); // No _id for subdocuments in the array

// Mongoose Schema for the main settings document
const SettingSchema = new Schema<ISetting>({
  _id: { type: String, default: 'payment_gateways' },
  gateways: { type: [GatewaySchema], required: true },
});

// Export the model, creating it if it doesn't already exist
export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema, 'settings');