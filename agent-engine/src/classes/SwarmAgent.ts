import { injectable } from 'inversify';
import SwarmConfig from '@database/models/SwarmConfig';
import ShoppingEventService from '../services/ShoppingEventService';
import { ShoppingEventItem } from '@database/schemas/ShoppingEventSchema';
import {chunk, uniq} from 'lodash';
import Agent from "@classes/Agent";
import Logger from "@classes/Logger";

@injectable()
export default class SwarmAgents {
  async run() {
    const settings = await SwarmConfig.findOne();
    const shoppingEventsServices = new ShoppingEventService();

    if (!settings) {
      Logger.error('You know nothing John Snow!!');
      throw new Error('This Swarm is not Setup yet, pleas ask administrator provide configuration.');
    }

    // Let configure our swarm with registered sku.
    if (!settings.registeredSkus.length) {
      Logger.info('Registering Possible SKUs from previous 100 Shopping Events...');
      const events = await shoppingEventsServices.getLatestEvents(100);

      const items: string[] = events.reduce((prev: ShoppingEventItem[], current) => prev.concat(current.items), []).map((i) => i.sku);
      settings.registeredSkus = uniq(items);
      await settings.save();
    }

    const swarmAgents: Agent[] = [];

    for (const sku of settings.registeredSkus) {
      swarmAgents.push(new Agent(sku, {
        suggestedWeekDayPreference: settings.suggestedDay,
        minimumEventsToReview: settings.minimumItemsToReview || 4
      }))
    }

    let executions:Promise<any>[] = [];
    for (const execAgents of chunk(swarmAgents, 5)) {
      executions = [...executions, ...execAgents.map(e => e.execute())]
    }

    return Promise.all(executions);
  }
}
