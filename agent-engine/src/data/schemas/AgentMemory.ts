import { Schema } from 'mongoose';

export interface AgentMemoryInterface {
  sku: string;
  expectedQty: number;
  periodicityDays: number;
  initialized: boolean;
  lastEvent: Date;
}

export const AgentMemorySchema = new Schema<AgentMemoryInterface>(
  {
    sku: { type: String, unique: true },
    expectedQty: Number,
    periodicityDays: Number,
    initialized: Boolean,
    lastEvent: Date
  },
  { timestamps: true }
);
