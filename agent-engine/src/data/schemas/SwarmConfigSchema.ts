import { Schema } from 'mongoose';

export interface SwarmConfigInterface {
  suggestedDay: number;
  registeredSkus: string[];
}

export const SwarmConfigSchema = new Schema<SwarmConfigInterface>({
  suggestedDay: Number,
  registeredSkus: [String]
});