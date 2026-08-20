import mongoose, { Document, Schema } from 'mongoose';

export interface IImportJob extends Document {
  filename: string;
  source: 'csv' | 'api';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  columnMapping?: Record<string, string>;
  counts: {
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
  };
  importErrors: { row?: number; sku?: string; message: string }[];
  startedAt?: Date;
  completedAt?: Date;
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const importJobSchema = new Schema<IImportJob>(
  {
    filename: { type: String, required: true },
    source: { type: String, enum: ['csv', 'api'], default: 'csv' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    columnMapping: { type: Schema.Types.Mixed },
    counts: {
      imported: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    importErrors: [
      {
        row: { type: Number },
        sku: { type: String },
        message: { type: String },
      },
    ],
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

importJobSchema.index({ status: 1, createdAt: -1 });

export const ImportJob = mongoose.model<IImportJob>('ImportJob', importJobSchema);
