import 'reflect-metadata';
import { parentPort, workerData } from 'worker_threads';
import Logger from '@classes/Logger';
import Agent from '@classes/Agent';
import DatabaseEngine from '@database/DatabaseEngine';
import SkuModel from '@database/models/Sku';
import { ShoppingEventItem } from '@database/schemas/ShoppingEventSchema';

executeAgent();

async function executeAgent() {
  const connection = await DatabaseEngine.initialize();

  try {
    let suggestion;
    const { agent: aggentSettings } = workerData;

    const agent = new Agent(aggentSettings.sku, aggentSettings.settings);
    const [skuInformation, executeResults] = await Promise.all([await SkuModel.findOne({ sku: agent.getSku() }), await agent.execute()]);

    const [_, suggestedItem, action] = executeResults;
    if (action === 'SUGGEST' && suggestedItem) {
      suggestion = {
        name: skuInformation?.name || '',
        sku: skuInformation?.sku || '',
        quantity: suggestedItem.quantity
      } as ShoppingEventItem;
    }

    parentPort?.postMessage([action, suggestion]);
  } catch (e) {
    // @ts-ignore
    parentPort?.postMessage(['ERROR', e.message]);
  } finally {
    await connection.disconnect();
  }
}
