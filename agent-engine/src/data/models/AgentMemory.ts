import { AgentMemoryInterface, AgentMemorySchema } from '@database/schemas/AgentMemory';
import { model } from 'mongoose';

const AgentMemoryModel = model<AgentMemoryInterface>('agents.memory', AgentMemorySchema);
export default AgentMemoryModel;
