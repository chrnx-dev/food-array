import { AgentMemoryInterface, AgentMemorySchema } from '@database/schemas/AgentMemory';
import { model, Types } from 'mongoose';

const AgentMemoryModel = model<AgentMemoryInterface>('agents.memory', AgentMemorySchema);
export default AgentMemoryModel;

// @ts-ignore
export type AgentMemoryDocument =  Document<unknown, any, AgentMemoryInterface> & AgentMemoryInterface & {_id: Types.ObjectId}
