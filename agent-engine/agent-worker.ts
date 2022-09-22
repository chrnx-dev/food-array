import 'reflect-metadata';
import { parentPort, workerData } from 'worker_threads';
import Logger from "@classes/Logger";
import Agent from "@classes/Agent";
import { delay } from "bluebird";
import {random} from "lodash";
import DatabaseEngine from "@database/DatabaseEngine";

executeAgent();

async function executeAgent() {
  const { agent: aggentSettings  } = workerData;

  const agent = new Agent(aggentSettings.sku, aggentSettings.settings);
  Logger.info(`Running Agent ${agent.getSku()}...`);
  const connection = await DatabaseEngine.initialize();
  const [_, suggestedItem, action] = await agent.execute();
  console.log(suggestedItem, action);
  await connection.disconnect();
  await delay(random(5000, 15000));
  parentPort?.postMessage(`Finished running agent ${agent.getSku()}`);
}