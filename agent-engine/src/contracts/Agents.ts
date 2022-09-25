import {ActionArguments, EnvironmentState, SwarmPreferences} from "@commons/interfaces/interfaces";
import {AgentActions} from "@commons/enums/agent-actions";
import Environment from "@classes/Environment";
import AgentService from "../services/AgentService";
import {AgentMemoryDocument} from "@database/models/AgentMemory";
import {DateTime} from "luxon";
import Logger from "@classes/Logger";
import chalk from "chalk";
import {ShoppingEventItem} from "@database/schemas/ShoppingEventSchema";

export default abstract class AgentContract {

  protected readonly env: Environment = new Environment();
  protected readonly agentService: AgentService = new AgentService();
  protected readonly sku: string;
  protected readonly settings: Partial<SwarmPreferences>;

  constructor(sku: string, settings: Partial<SwarmPreferences>) {
    this.sku = sku;
    this.settings = settings;
  }

  protected headerLog() {
    return chalk.bold(`Agent [${this.sku}]`);
  }

  getSku() {
    return this.sku;
  }

  async execute(): Promise<[AgentMemoryDocument, Partial<ShoppingEventItem> | null, AgentActions]> {
    const memory: AgentMemoryDocument = await this.agentService.getMemory(this.sku);
    const state: EnvironmentState = await this.percept();
    const [action, data] = await this.rationale(state, memory);
    const [modifiedMemory, suggestedItem]: [AgentMemoryDocument, Partial<ShoppingEventItem> | null] = await this.react(action, data, memory, state);

    return [modifiedMemory, suggestedItem, action];
  }

  async react(action: AgentActions, actionArgs: Partial<ActionArguments>, memory: AgentMemoryDocument, state: EnvironmentState): Promise<[AgentMemoryDocument,  Partial<ShoppingEventItem> | null]> {
    throw new Error("Not Implemented");
  }

  async percept(): Promise<EnvironmentState> {
    const state: EnvironmentState = await this.env.perceive(this.sku, this.settings.minimumEventsToReview);
    return state;
  }

  async rationale(state: EnvironmentState, memory: AgentMemoryDocument): Promise<[AgentActions, Partial<ActionArguments>]> {
    // First Time Agent Saw a Product
    if (!memory) {
      return [
        AgentActions.INITIALIZE,
        {
          shouldInitialize: !!(state.history.length > 1 )
        }
      ];
    }

    // Agent is Reviewing a Product for appropriate plan.
    if (memory && !memory.initialized && state.history.length <= this.settings.minimumEventsToReview!) {
      const lastEvent = state.history.at(-1);
      const lastEventReviewed = memory.lastEvent && DateTime.fromJSDate(memory.lastEvent);

      // Already Reviewed so not need to review again.
      if (lastEvent && lastEventReviewed && lastEvent.date <= lastEventReviewed) {
        return [AgentActions.HOLD, {}];
      }

      return [AgentActions.REVIEW, {}];
    }

    // Agent detect user bought a product today.
    if (memory && state.currentEvent.length) {
      return [AgentActions.ADJUST, { currentEvents: state.currentEvent }];
    }

    // Agent made a suggestion to user.
    const latestSuggestions= await this.env.getLatestSuggestion(this.sku);
    const diffDays = Math.round(state.today.diff(DateTime.fromJSDate(<Date>memory.lastEvent), 'day').days);
    const minDays = memory.periodicityDays - (this.settings.suggestedToleranceDays || 0);
    const suggestedDays =latestSuggestions ? Math.round(state.today.diff(DateTime.fromJSDate(<Date>latestSuggestions.date), 'day').days) : -99;
    const canSuggest = (minDays <= diffDays || diffDays >= memory.periodicityDays) && (suggestedDays >= memory.periodicityDays || suggestedDays < 0);

    if (memory && state.today.weekday === this.settings.suggestedWeekDayPreference && canSuggest) {
      return [AgentActions.SUGGEST, {}];
    }

    return [AgentActions.HOLD, {}];
  }
}


export interface AgentActionContract {
  initialize(actionArguments: Partial<ActionArguments>, state: EnvironmentState): Promise<AgentMemoryDocument>;
  review(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument ): Promise<AgentMemoryDocument>;
  adjust(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument): Promise<AgentMemoryDocument>;
  suggest(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument): Promise<[AgentMemoryDocument, Partial<ShoppingEventItem>]>;
  hold(): Promise<AgentMemoryDocument>;
}
