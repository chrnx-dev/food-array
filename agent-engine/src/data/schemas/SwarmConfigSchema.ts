import { Schema } from 'mongoose';

export interface SwarmConfigInterface {
  clientId: string;
  suggestedDay: number;
  registeredSkus: string[];
  minimumItemsToReview: number;
  suggestionToleranceDays: number;
}

export const SwarmConfigSchema = new Schema<SwarmConfigInterface>({
  clientId: { type: String, unique: true },
  suggestedDay: Number,
  registeredSkus: [String],
  minimumItemsToReview: { type: Number, default: 4},
  suggestionToleranceDays: { type: Number, default: 2}
});