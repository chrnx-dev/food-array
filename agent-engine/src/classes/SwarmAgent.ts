import { injectable } from 'inversify';
import SwarmConfig, { SwarmConfigDocument } from '@database/models/SwarmConfig';
import ShoppingEventService from '../services/ShoppingEventService';
import { ShoppingEventItem } from '@database/schemas/ShoppingEventSchema';
import { chunk, uniq } from 'lodash';
import Agent from '@classes/Agent';
import Logger from '@classes/Logger';
import { SWARM_CLIENT_ID } from '@commons/configs/env';
import { map } from 'bluebird';
import SkuModel from '@database/models/Sku';
import { AgentActions } from '@commons/enums/agent-actions';
import ShoppingEventModel from '@database/models/ShoppingEventModel';
import { DateTime } from 'luxon';
import { Worker } from 'worker_threads';
import { SwarmAgentSettings } from '@commons/interfaces/interfaces';
import { cpus } from 'os';
import {WorkerResponse, WorkerResponseError} from '@commons/types';

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
          suggestedToleranceDays: settings.suggestionToleranceDays || 2
        }
      });
    }

    return swarmAgents;
  }

  async react(swarmAgentSettings: SwarmAgentSettings[], workerSize: number): Promise<void> {
    const results: (WorkerResponse | WorkerResponseError)[] = await map(
      swarmAgentSettings,
      async (agent: SwarmAgentSettings): Promise<WorkerResponse | WorkerResponseError> => {
        return this.runService(agent);
      },
      { concurrency: workerSize }
    );

    const suggestions = results.filter((r: WorkerResponse | WorkerResponseError) => {
      const [action] = r;

      return action === AgentActions.SUGGEST;
    });

    if (suggestions.length) {
      const suggestedEvent = new ShoppingEventModel({
        isSuggested: true,
        items: [],
        date: DateTime.utc().endOf('day').toJSDate()
      });

      for (const [_, item] of suggestions) {
        suggestedEvent.items.push(item as ShoppingEventItem);
      }

      await suggestedEvent.save();
    }
  }

  async setup() {
    const settings = await SwarmConfig.findOne({ clientId: SWARM_CLIENT_ID });
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

  async run() {
    const settings = await this.setup();
    const swarmAgents: SwarmAgentSettings[] = await this.percept(settings);
    const maxWorkers = cpus().length / 2;

    await this.react(swarmAgents, maxWorkers);
  }

  async runService(agent: SwarmAgentSettings): Promise<WorkerResponse | WorkerResponseError> {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./register-worker.js', {
        workerData: {
          path: 'agent-worker.ts',
          agent
        }
      });

      worker.on('message', (message: WorkerResponse) => resolve(message));

      worker.on('error', (error: WorkerResponseError) => resolve(error));

      worker.on('exit', (code) => {
        if (code !== 0) {
          resolve(['ERROR', `Worker stopped with exit code ${code}`]);
        }
      });
    });
  }
}
