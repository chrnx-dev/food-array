import AgentContract from '@contracts/Agents';
import { AgentMemoryInterface } from '@database/schemas/AgentMemory';
import { injectable } from 'inversify';
import { EnvironmentState } from 'src/commons/interfaces/interfaces';
import AgentService from 'src/services/AgentService';
import Environment from './Environment';
import { AgentActions } from '@commons/enums/agent-actions';

@injectable()
export default class Agent extends AgentContract {
  private readonly env: Environment = new Environment();
  private readonly agentService: AgentService = new AgentService();
  private readonly reviewHistoryItems: number;

  private readonly sku: string;
  private readonly memory: Promise<AgentMemoryInterface>;

  constructor(sku: string, reviewHistoryItems: number = 10) {
    super();
    this.sku = sku;
    this.reviewHistoryItems = reviewHistoryItems;
    this.memory = this.agentService.getMemory(this.sku);
  }

  async execute(): Promise<void> {
    const memory: AgentMemoryInterface = await this.agentService.getMemory(this.sku);
    const state: EnvironmentState = await this.percept();
    const [action, data] = await this.resolve(state, memory);
    console.log(action, data, memory);
  }

  async percept(): Promise<EnvironmentState> {
    const state: EnvironmentState = await this.env.perceive(this.sku, this.reviewHistoryItems);
    console.log(`---- Percepting ${this.sku} ----`);
    console.log(` Starting state: ${state.startOfWeek.toISODate()}`);
    console.log(` Ending state: ${state.endOfWeek.toISODate()}`);
    console.log(` Events history: ${state.history.length}`);
    console.log(` Current event: ${state.currentEvent.length}`);
    console.log(`-------------------------------------------`);

    return state;
  }

  async resolve(state: EnvironmentState, memory: AgentMemoryInterface): Promise<[AgentActions, any]> {
    console.log(memory, 'Resolve Memory');

    // First Time Agent Saw a Product
    if (!memory && state.history.length) {
      return [AgentActions.INITIALIZE, {}];
    }

    // Agent detect user buy a product today.
    if (state.currentEvent.length) {
      return [AgentActions.ADJUST, {}];
    }


    return [AgentActions.HOLD, {}];
  }
}
