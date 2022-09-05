import AgentMemoryModel from "@database/models/AgentMemory";

export default class AgentMemoryService {
    async getMemory(sku: string): Promise<any> {
        return AgentMemoryModel.findOne({ sku });
    }
}