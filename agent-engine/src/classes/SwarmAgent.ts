import { injectable } from 'inversify';
import SwarmConfig, {SwarmConfigDocument} from '@database/models/SwarmConfig';
import ShoppingEventService from '../services/ShoppingEventService';
import { ShoppingEventItem } from '@database/schemas/ShoppingEventSchema';
import {chunk, uniq} from 'lodash';
import Agent from "@classes/Agent";
import Logger from "@classes/Logger";
import {SWARM_CLIENT_ID} from "@commons/configs/env";
import { map } from "bluebird";
import SkuModel from "@database/models/Sku";
import {AgentActions} from "@commons/enums/agent-actions";
import ShoppingEventModel from "@database/models/ShoppingEventModel";
import {DateTime} from "luxon";

@injectable()
export default class SwarmAgents {
  async percept(settings: SwarmConfigDocument): Promise<Agent[]> {
    const swarmAgents: Agent[] = [];

    for (const sku of settings.registeredSkus) {
      swarmAgents.push(new Agent(sku, {
        suggestedWeekDayPreference: settings.suggestedDay,
        minimumEventsToReview: settings.minimumItemsToReview || 4,
        suggestedToleranceDays: settings.suggestionToleranceDays || 2,
      }))
    }

    return swarmAgents;
  }
  async react(swarmAgents: Agent[]) {
    const suggestedEvent = new ShoppingEventModel({
      isSuggested: true,
      items: [],
      date: DateTime.utc().endOf('day').toJSDate()
    });

    await map(swarmAgents, async (agent) => {
      const skuInformation = await SkuModel.findOne({sku: agent.getSku()});
      const [memory, suggestedItem, action] = await agent.execute();

      Logger.info(action);
      Logger.info(JSON.stringify(memory));
      Logger.info(JSON.stringify(suggestedItem));
      Logger.info(JSON.stringify(skuInformation));

      if (action === AgentActions.SUGGEST && suggestedItem) {
        suggestedItem.name = skuInformation?.name || '';
        suggestedItem.sku = skuInformation?.sku || '';
        suggestedEvent.items.push(suggestedItem as ShoppingEventItem);
      }


    }, {concurrency: 5});

    if (suggestedEvent.items.length) {
      await suggestedEvent.save();
    }
  }

  async run() {
    const settings = await SwarmConfig.findOne({clientId: SWARM_CLIENT_ID});
    const shoppingEventsServices = new ShoppingEventService();

    if (!settings) {
      Logger.error('You know nothing John Snow!!');
      throw new Error('This Swarm is not Setup yet, pleas ask administrator provide configuration.');
    }

    // Let configure our swarm with registered sku.
    Logger.info('Registering Possible SKUs from previous 100 Shopping Events...');
    const events = await shoppingEventsServices.getLatestEvents(100);

    if (events.length) {
      const items: string[] = events.reduce((prev: ShoppingEventItem[], current) => prev.concat(current.items), []).map((i) => i.sku);
      settings.registeredSkus = uniq(items);
      await settings.save();
    }

    const swarmAgents: Agent[] = await this.percept(settings);

    await this.react(swarmAgents);
  }
}
