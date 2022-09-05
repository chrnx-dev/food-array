import AgentContract from "@contracts/Agents";
import { injectable } from "inversify";
import AgentService from "src/services/AgentService";
import Environment from "./Environment";

@injectable()
export default class Agent extends AgentContract{
    private readonly env: Environment = new Environment();
    private readonly agentService: AgentService = new AgentService();
    
    private readonly sku: string;

    constructor(sku: string) {
        super();
        this.sku = sku;
    }

    async percept(): Promise<any> {
        const memory = await this.agentService.getMemory(this.sku);
        const state = await this.env.perceive(this.sku, 10);
        console.log(state, memory);
    }
}