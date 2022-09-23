import AgentContract, {AgentActionContract} from '@contracts/Agents';
import {injectable} from 'inversify';
import {ActionArguments, EnvironmentState} from "@commons/interfaces/interfaces";
import {AgentActions} from "@commons/enums/agent-actions";
import AgentMemoryModel, {AgentMemoryDocument} from "@database/models/AgentMemory";
import {harmonicMean, mean, medianSorted, mode} from "simple-statistics";
import Logger from "@classes/Logger";
import {DateTime} from "luxon";
import {ShoppingEventItem} from "@database/schemas/ShoppingEventSchema";

@injectable()
export default class Agent extends AgentContract implements AgentActionContract {

  async react(action: AgentActions, actionArgs: Partial<ActionArguments>, memory: AgentMemoryDocument, state: EnvironmentState): Promise<[AgentMemoryDocument,  Partial<ShoppingEventItem> | null]> {
    let modifiedMemory = memory;
    let modifiedItem: Partial<ShoppingEventItem> | null = null;

    switch (action) {
      case AgentActions.INITIALIZE:
        modifiedMemory = await this.initialize(actionArgs, state);
        break;
      case AgentActions.REVIEW:
        modifiedMemory = await this.review(actionArgs, state, memory)
        break;
      case AgentActions.SUGGEST:
        const [suggestedMemory, suggestedItem] = await this.suggest(actionArgs, state, memory);
        modifiedMemory = suggestedMemory;
        modifiedItem = suggestedItem;
        break;
      case AgentActions.ADJUST:
        modifiedMemory = await this.adjust(actionArgs, state, memory);
        break;
      case AgentActions.HOLD:
        await this.hold();
        modifiedMemory = memory;
        break;
    }

    return [modifiedMemory, modifiedItem];
  }

  // @ts-ignore
  async adjust(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument): Promise<AgentMemoryDocument> {
    const currentEvent = state.currentEvent.at(0);
    if (!currentEvent)  throw  new Error("No Current Event Found");

    const { date, qty } = currentEvent;
    const { expectedQty: memExpectedQty, periodicityDays, lastEvent } = memory;

    const diffDays = Math.round(date.diff(DateTime.fromJSDate(<Date>lastEvent), 'day').days);

    if (diffDays === 0) {
        return memory;
    }

    const expectedDiffDays = Math.round((periodicityDays + diffDays )/ 2);
    const expectedQty = Math.round((memExpectedQty + (qty || 0)) / 2);

    memory.expectedQty = expectedQty;
    memory.periodicityDays = expectedDiffDays;
    memory.lastEvent = date.toJSDate();

    return memory.save();
  }

  // @ts-ignore
  async hold() {
    Logger.info(`${this.headerLog()} [HOLD] - Agent Held The Item`);
  }

  async initialize(actionArguments: Partial<ActionArguments>, state: EnvironmentState): Promise<AgentMemoryDocument> {
    const memory= new AgentMemoryModel();
    const lastEvent = state.history.at(-1);

    if (!lastEvent) {
      throw new Error("No History Found");
    }


    memory.sku = this.sku;
    memory.lastEvent =  lastEvent?.date.toJSDate();

    if (actionArguments.shouldInitialize) {
      return this.review(actionArguments, state, memory);
    }
    return memory.save();
  }

  async review(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory:  AgentMemoryDocument): Promise<AgentMemoryDocument> {
    const history = state.history;
    const canMarkedAsInitialized =  history.length >= (this.settings.minimumEventsToReview || 0);
    memory.initialized = canMarkedAsInitialized;

    const diffDays = [];
    const qtyData = [];

    for (let index = 1; index < history.length; index++) {
      const currentEvent = history.at(index);
      const pastEvent = history.at(index - 1);

      if (!currentEvent || !pastEvent) {
        throw new Error("No History Found");
      }

      diffDays.push(currentEvent.date.diff(pastEvent.date, 'day').days);
      qtyData.push(currentEvent.qty)
    }

    memory.expectedQty = Math.round(medianSorted(qtyData.sort()));
    memory.periodicityDays = Math.round(medianSorted(diffDays.sort()));
    memory.lastEvent = <Date>history.at(-1)?.date.toJSDate();

    return memory.save();
  }

  async suggest(actionArguments: Partial<ActionArguments>, state: EnvironmentState, memory: AgentMemoryDocument): Promise<[AgentMemoryDocument, Partial<ShoppingEventItem>]> {
    const suggestedItem: Partial<ShoppingEventItem> = {
      sku: this.sku,
      quantity: memory.expectedQty,
    };

    const diffDays = Math.round(state.today.diff(DateTime.fromJSDate(<Date>memory.lastEvent), 'day').days);
    const expectedDiffDays = Math.round((memory.periodicityDays + diffDays )/ 2);
    memory.periodicityDays = expectedDiffDays;
    await memory.save();
    return [memory, suggestedItem];
  }
}
