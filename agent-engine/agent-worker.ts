import 'reflect-metadata';
import { parentPort, workerData } from 'worker_threads';
import Logger from '@classes/Logger';
import Agent from '@classes/Agent';
import DatabaseEngine from '@database/DatabaseEngine';
import SkuModel from '@database/models/Sku';
import { ShoppingEventItem } from '@database/schemas/ShoppingEventSchema';
import {DateTime, Settings} from "luxon";

executeAgent();

async function executeAgent() {
  console.log('workerData', workerData);
  if (workerData?.isTest) {
    Settings.now = () => DateTime.fromJSDate(workerData.changeDate).toMillis();
  }

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
  } catch (e: any) {
    // @ts-ignore
    Logger.error(`workerData - error ${e.message}`);
    parentPort?.postMessage(['ERROR', e.message]);
  } finally {
    await connection.disconnect();
  }
}
