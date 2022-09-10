import AgentContract from '@contracts/Agents';
import {AgentMemoryInterface} from '@database/schemas/AgentMemory';
import {injectable} from 'inversify';
import {EnvironmentState, SwarmPreferences} from 'src/commons/interfaces/interfaces';
import AgentService from 'src/services/AgentService';
import Environment from './Environment';
import {AgentActions} from '@commons/enums/agent-actions';

@injectable()
export default class Agent extends AgentContract {
  private readonly env: Environment = new Environment();
  private readonly agentService: AgentService = new AgentService();
  private readonly reviewHistoryItems: number;

  private readonly sku: string;
  private readonly memory: Promise<AgentMemoryInterface>;
  private readonly settings: Partial<SwarmPreferences>;

  constructor(sku: string, settings: Partial<SwarmPreferences>, reviewHistoryItems: number = 10) {
    super();
    this.sku = sku;
    this.reviewHistoryItems = reviewHistoryItems;
    this.memory = this.agentService.getMemory(this.sku);
    this.settings = settings;
  }

  async execute(): Promise<void> {
    const memory: AgentMemoryInterface = await this.memory;
    const state: EnvironmentState = await this.percept();
    const [action, data] = await this.resolve(state, memory);
    console.log(action, data, memory);
  }

  async percept(): Promise<EnvironmentState> {
    const state: EnvironmentState = await this.env.perceive(this.sku, this.reviewHistoryItems);
    console.log(`---- Perception ${this.sku} ----`);
    console.log(` Perception Date: ${state.today.toISODate()}`);
    console.log(` Week: ${state.startOfWeek.toISODate()} - ${state.endOfWeek.toISODate()}`);
    console.log(` Events history: ${state.history.length}`);
    console.log(` Current event: ${state.currentEvent.length}`);
    console.log(`-------------------------------------------`);

    return state;
  }

  async resolve(state: EnvironmentState, memory: AgentMemoryInterface): Promise<[AgentActions, any]> {
    console.log(memory, 'Resolve Memory');

    // First Time Agent Saw a Product
    if (!memory && state.history.length) {

      if (state.history.length < 4) {
        return [AgentActions.INITIALIZE, {}];
      }

    }

    // Agent is Reviewing a Product for appropriate plan.
    if (memory && state.currentEvent.length <= this.reviewHistoryItems) {
      return [AgentActions.REVIEW, {}];
    }

    // Agent detect user buy a product today.
    if (memory && state.currentEvent.length) {
      return [AgentActions.ADJUST, {}];
    }

    // Agent made a suggestion to user.
    if (memory && state.today.weekday === this.settings.suggestedWeekDayPreference) {
      return [AgentActions.SUGGEST, {}];
    }

    return [AgentActions.HOLD, {}];
  }
}
