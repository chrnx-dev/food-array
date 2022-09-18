import DatabaseEngine from "@database/DatabaseEngine";
import parseArgs from "yargs-parser";
import {DateTime} from "luxon";
import SwarmConfigModel from "@database/models/SwarmConfig";
import { SWARM_CLIENT_ID } from "@commons/configs/env";

main();

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const db = await DatabaseEngine.initialize();

  try {
    console.log("Initializing swarm...");
    const swarmConfig = new SwarmConfigModel();

    const today = DateTime.now();

    swarmConfig.minimumItemsToReview = args.reviewItems || 5;
    swarmConfig.suggestedDay = args.suggestedDay || today.weekday;
    swarmConfig.clientId = args.clientId || SWARM_CLIENT_ID;

    await swarmConfig.save();

  } catch (e) {
    console.error(e);
  } finally {
    db.disconnect();
  }

}