import AgentContract, { AgentActionContract } from '@contracts/Agents';
import { injectable } from 'inversify';
import {ActionArguments, EnvironmentState} from "@commons/interfaces/interfaces";
import {AgentActions} from "@commons/enums/agent-actions";
import {AgentMemoryInterface} from "@database/schemas/AgentMemory";
import AgentMemoryModel, {AgentMemoryDocument} from "@database/models/AgentMemory";
import {first, last, round} from "lodash";
import {harmonicMean, mean, medianSorted, mode} from "simple-statistics";
import Logger from "@classes/Logger";
import chalk from "chalk";
import {DateTime} from "luxon";

@injectable()
export default class Agent extends AgentContract implements AgentActionContract {

  async react(action: AgentActions, actionArgs: Partial<ActionArguments>, memory: AgentMemoryInterface, state: EnvironmentState): Promise<AgentMemoryDocument> {
    switch (action) {
      case AgentActions.INITIALIZE:
        return await this.initialize(actionArgs, state);
      case AgentActions.REVIEW:
        return await this.review(actionArgs, state, memory);
      case AgentActions.SUGGEST:
        return await this.suggest(actionArgs, state, memory);
      default:
        return memory;
    }


  }

  async adjust(): Promise<AgentMemoryDocument> {}

  async hold(): Promise<AgentMemoryDocument> {}

  async initialize(actionArguments: Partial<ActionArguments>, state: EnvironmentState): Promise<AgentMemoryDocument> {
    const memory= new AgentMemoryModel();
    const lastEvent = last(state.history);

    Logger.info(`Initialize Agent for ${this.sku} - Should initialize? ${actionArguments.shouldInitialize ? "YES" : "NO"}`);
    memory.sku = this.sku;
    memory.lastEvent = lastEvent?.date.toJSDate();

    if (actionArguments.shouldInitialize) {
      Logger.info(`Initialized Agent`);
      return this.review(actionArguments, state, memory);
    }
    Logger.info(" -> Initialized Agent");
    return memory.save();
  }

  async review(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory:  AgentMemoryDocument): Promise<AgentMemoryDocument> {
    Logger.info(" -> Agent is Reviewing The Item");
    const history = state.history;
    const canMarkedAsInitialized =  history.length >= (this.settings.minimumEventsToReview || 0);
    memory.initialized = canMarkedAsInitialized;

    const diffDays = [];
    const qtyData = [];

    for (let index = 1; index < history.length; index++) {
      const currentEvent = history[index];
      const pastEvent = history[index - 1];

      Logger.info(currentEvent.date.toISO() );
      diffDays.push(currentEvent.date.diff(pastEvent.date, 'day').days);
      qtyData.push(currentEvent.qty)
    }
    Logger.info(diffDays, qtyData);
    Logger.info(`Days : Mean[${mean(diffDays)}], Median [${medianSorted(diffDays.sort())}], Mode [${mode(diffDays.sort())}], Harmonic Mean [${harmonicMean(diffDays)}]`);
    Logger.info(`QTY  : Mean[${mean(qtyData)}], Median [${medianSorted(qtyData.sort())}], Mode [${mode(qtyData.sort())}], Harmonic Mean [${harmonicMean(qtyData)}]`);
    memory.expectedQty = round(medianSorted(qtyData.sort()));
    memory.periodicityDays = round(medianSorted(diffDays.sort()));

    Logger.info(" -> Agent Reviewed The Item");
    return memory.save();
  }

  async suggest(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument): Promise<AgentMemoryDocument> {
    Logger.warn(` -> Agent is Suggesting The Item Today [${state.today.toISO()}] Last Event [${memory.lastEvent}] Tolerance [${this.settings.suggestedToleranceDays}]`);
    const diffDays = state.today.diff(DateTime.fromJSDate(memory.lastEvent), 'day').days;
    Logger.warn(`Diff Days: ${diffDays}, Periodicity: ${memory.periodicityDays}, Expected Qty: ${memory.expectedQty}`);
    return memory;
  }
}
