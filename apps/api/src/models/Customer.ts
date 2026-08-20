import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  email: string;
  name: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
  },
  { timestamps: true }
);

customerSchema.index({ email: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
