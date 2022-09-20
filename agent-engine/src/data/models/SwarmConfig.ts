import { model, Document, Types } from 'mongoose';
import {SwarmConfigInterface, SwarmConfigSchema} from "@database/schemas/SwarmConfigSchema";

const SwarmConfigModel = model<SwarmConfigInterface>("swarm.config", SwarmConfigSchema);
export default SwarmConfigModel;

export type SwarmConfigDocument = Document<unknown, any, SwarmConfigInterface> & SwarmConfigInterface & { _id: Types.ObjectId; }