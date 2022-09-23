import 'reflect-metadata';
import DatabaseEngine from '@database/DatabaseEngine';
import SwarmAgents from "@classes/SwarmAgent";

main();

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
