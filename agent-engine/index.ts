import 'reflect-metadata';
import Agent from '@classes/Agent';
import DatabaseEngine from '@database/DatabaseEngine';

main();

async function main() {
  const connection = await DatabaseEngine.initialize();
  const agent = new Agent('1');

  await agent.execute();
  connection.disconnect();
}
