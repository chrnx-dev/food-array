import { model } from 'mongoose';
import {SwarmConfigInterface, SwarmConfigSchema} from "@database/schemas/SwarmConfigSchema";

const SwarmConfigModel = model<SwarmConfigInterface>("swarm.config", SwarmConfigSchema);
export default SwarmConfigModel;