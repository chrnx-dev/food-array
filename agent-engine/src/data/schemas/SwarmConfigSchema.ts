import { Schema } from 'mongoose';

export interface SwarmConfigInterface {
  suggestedDay: number;
  registeredSkus: string[];
  minimumItemsToReview: number;
}

export const SwarmConfigSchema = new Schema<SwarmConfigInterface>({
  suggestedDay: Number,
  registeredSkus: [String],
  minimumItemsToReview: { type: Number, default: 4}
});