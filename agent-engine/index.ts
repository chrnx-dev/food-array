import 'reflect-metadata';
import DatabaseEngine from '@database/DatabaseEngine';
import SwarmAgents from "@classes/SwarmAgent";
import cron from 'node-cron';
import Logger from "@classes/Logger";
import {DateTime} from "luxon";
import { performance, PerformanceObserver} from "perf_hooks";
import prettyMilliseconds from 'pretty-ms';

const CRONMARK_START='CRONJOB-SWARM-START';
const CRONMARK_END='CRONJOB-SWARM-END';

const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    //console.log(entry);
    Logger.verbose(`${entry.name} - took ${prettyMilliseconds(entry.duration)} `); // fake call to our custom logging solution
  })
})

perfObserver.observe({ entryTypes: ["measure"], buffered: true })

console.log(`
Artificial Intelligence Engine for...
███████╗ ██████╗  ██████╗ ██████╗      █████╗ ██████╗ ██████╗  █████╗ ██╗   ██╗    
██╔════╝██╔═══██╗██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝    
█████╗  ██║   ██║██║   ██║██║  ██║    ███████║██████╔╝██████╔╝███████║ ╚████╔╝     
██╔══╝  ██║   ██║██║   ██║██║  ██║    ██╔══██║██╔══██╗██╔══██╗██╔══██║  ╚██╔╝      
██║     ╚██████╔╝╚██████╔╝██████╔╝    ██║  ██║██║  ██║██║  ██║██║  ██║   ██║       
╚═╝      ╚═════╝  ╚═════╝ ╚═════╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                                                                                                                                                                                                                                                                                                                                                                                            
  `);

console.log(`Starting at ${DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')} and waiting...`);
cron.schedule('59 23 * * *', async () => {
  performance.mark(CRONMARK_START);
  Logger.info(`Running Swarm Agents @ ${DateTime.now().setZone("America/Mexico_City").toISO()}`);
  const connection = await DatabaseEngine.initialize();

  try {
    const swarm = new SwarmAgents();
    await swarm.run()
  } catch (e) {
    console.log(e);
  } finally {
    await connection.disconnect();
    performance.mark(CRONMARK_END);

    performance.measure(`Finish Swarm Agents -`, CRONMARK_START, CRONMARK_END);
  }

}, {
    scheduled: true,
    timezone: "America/Mexico_City"
});

//main();

async function main() {
  const connection = await DatabaseEngine.initialize();

  try {
    const swarm = new SwarmAgents();
    await swarm.run()
  } catch (e) {
    console.log(e);
  } finally {
    await connection.disconnect();
  }

}
