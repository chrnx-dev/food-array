import { AgentMemoryInterface } from "@database/schemas/AgentMemory";
import {ActionArguments, EnvironmentState, SwarmPreferences} from "@commons/interfaces/interfaces";
import {AgentActions} from "@commons/enums/agent-actions";
import Environment from "@classes/Environment";
import AgentService from "../services/AgentService";
import {AgentMemoryDocument} from "@database/models/AgentMemory";
import {first} from "lodash";
import {DateTime} from "luxon";
import Logger from "@classes/Logger";
import chalk from "chalk";

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

  async execute(): Promise<void> {
    Logger.info(`${this.headerLog()} Start Execution`);

    const memory: AgentMemoryInterface = await this.agentService.getMemory(this.sku);
    Logger.info(`${this.headerLog()}  ==> Percept Process Starting`);
    const state: EnvironmentState = await this.percept();
    Logger.info(`${this.headerLog()}  <== Percept Process Ended`);

    Logger.info(`${this.headerLog()}  ==> Rationale Process Starting`);
    const [action, data] = await this.rationale(state, memory);
    Logger.info(`${this.headerLog()}  <== Rationale Process Ended`);

    Logger.info(`${this.headerLog()}  ==> Reaction Process Starting`);
    await this.react(action, data, memory, state);
    Logger.info(`${this.headerLog()}  <== Reaction Process Ended`);

    Logger.info(`${this.headerLog()} End Execution`);

  }

  async react(action: AgentActions, actionArgs: Partial<ActionArguments>, memory: AgentMemoryInterface, state: EnvironmentState) {
    throw new Error("Not Implemented");
  }

  async percept(): Promise<EnvironmentState> {
    const state: EnvironmentState = await this.env.perceive(this.sku, this.settings.minimumEventsToReview);
    Logger.info(`${this.headerLog()} [PERCEPT] Perception Date: ${state.today.toISODate()}`);
    Logger.info(`${this.headerLog()} [PERCEPT] Minimum to Review: ${this.settings.minimumEventsToReview}`);
    Logger.info(`${this.headerLog()} [PERCEPT] Week: ${state.startOfWeek.toISODate()} - ${state.endOfWeek.toISODate()}`);
    Logger.info(`${this.headerLog()} [PERCEPT] Events history: ${state.history.length}`);
    Logger.info(`${this.headerLog()} [PERCEPT] Current event: ${state.currentEvent.length}`);

    return state;
  }

  async rationale(state: EnvironmentState, memory: AgentMemoryInterface): Promise<[AgentActions, Partial<ActionArguments>]> {
    Logger.info(`${this.headerLog()} [PERCEPT] Current event: ${state.currentEvent.length}`);
    // First Time Agent Saw a Product
    if (!memory && state.history.length) {
      Logger.info(`${this.headerLog()} [PERCEPT] Current event: ${state.currentEvent.length}`);
      return [
        AgentActions.INITIALIZE,
        {
          shouldInitialize: !!(state.history.length > 1 && this.settings.minimumEventsToReview && state.history.length <= this.settings.minimumEventsToReview)
        }
      ];
    }

    // Agent is Reviewing a Product for appropriate plan.
    if (memory && state.history.length <= this.settings.minimumEventsToReview!) {
      const lastEvent = first(state.history);
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
    if (memory && state.today.weekday === this.settings.suggestedWeekDayPreference) {
      return [AgentActions.SUGGEST, {}];
    }

    return [AgentActions.HOLD, {}];
  }
}


export interface AgentActionContract {
  initialize(actionArguments: Partial<ActionArguments>, state: EnvironmentState): Promise<AgentMemoryDocument>;
  review(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument ): Promise<AgentMemoryDocument>;
  adjust(): Promise<AgentMemoryDocument>;
  suggest(): Promise<AgentMemoryDocument>;
  hold(): Promise<AgentMemoryDocument>;
}
