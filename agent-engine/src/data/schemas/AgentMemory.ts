import { Schema } from "mongoose";

export interface AgentMemoryInterface {
    sku: string;
    expectedQty: number;
    periocityDays: number;
    init: boolean;
    lastEvent: Date;
}

export const AgentMemorySchema = new Schema<AgentMemoryInterface>({
    sku: { type: String, unique: true},
    expectedQty: Number,
    periocityDays: Number,
    init: Boolean,
    lastEvent: Date
}, { timestamps: true });