import { Schema, model, models, Document } from 'mongoose';

export interface IUserEvent extends Document {
  sessionId: string;
  eventType: 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'checkout_start' | 'search' | 'wishlist_add';
  path: string; // URL path e.g. /product/handbag
  metadata?: any; // Extra info e.g. productID, search term
  createdAt: Date;
}

const UserEventSchema = new Schema<IUserEvent>({
  sessionId: { type: String, required: true, index: true },
  eventType: { 
    type: String, 
    enum: ['page_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'search', 'wishlist_add'],
    required: true 
  },
  path: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default models.UserEvent || model<IUserEvent>('UserEvent', UserEventSchema);