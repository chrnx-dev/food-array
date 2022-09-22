import {injectable} from 'inversify';
import SwarmConfig, {SwarmConfigDocument} from '@database/models/SwarmConfig';
import ShoppingEventService from '../services/ShoppingEventService';
import {ShoppingEventItem} from '@database/schemas/ShoppingEventSchema';
import {chunk, uniq} from 'lodash';
import Agent from "@classes/Agent";
import Logger from "@classes/Logger";
import {SWARM_CLIENT_ID} from "@commons/configs/env";
import {map} from "bluebird";
import SkuModel from "@database/models/Sku";
import {AgentActions} from "@commons/enums/agent-actions";
import ShoppingEventModel from "@database/models/ShoppingEventModel";
import {DateTime} from "luxon";
import {Worker} from "worker_threads";
import {SwarmAgentSettings} from "@commons/interfaces/interfaces";
import {cpus} from "os";

@injectable()
export default class SwarmAgents {
  async percept(settings: SwarmConfigDocument): Promise<SwarmAgentSettings[]> {
    const swarmAgents: SwarmAgentSettings[] = [];

    for (const sku of settings.registeredSkus) {
      swarmAgents.push({
        sku,
        settings: {
          suggestedWeekDayPreference: settings.suggestedDay,
          minimumEventsToReview: settings.minimumItemsToReview || 4,
          suggestedToleranceDays: settings.suggestionToleranceDays || 2,
        }
      });
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
      const [_, suggestedItem, action] = await agent.execute();


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

  async setup() {
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

    return settings;
  }

  async runWorker() {
    const settings = await this.setup();
    const swarmAgents: SwarmAgentSettings[] = await this.percept(settings);
    const maxWorkers = cpus().length / 2;

    await map(swarmAgents, async (agent) => {
      return this.runService(agent);
    }, {concurrency: maxWorkers});
  }

  async runService(agent: SwarmAgentSettings) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./register-worker.js', {
        workerData: {
          path: 'agent-worker.ts',
          agent
        }
      });

      worker.on('message', (message) => {
        console.log(message);
        resolve(message);
      });

      worker.on('error', (error) => {
        reject(error);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
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

    const swarmAgents: any[] = await this.percept(settings);

    await this.react(swarmAgents);
  }
}
