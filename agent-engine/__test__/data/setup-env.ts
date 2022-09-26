import {Db} from "mongodb";
import {eventsGenerator, eventWithMultipleItemsGenerator} from "./events-generator";
import {DateTime, Settings} from "luxon";
import {error} from "winston";

function getCollections(db: Db) {
  return {
    swarmConfig: db.collection("swarm.configs"),
    skus: db.collection("skus"),
    shoppingEvents: db.collection("shoppingevents"),
    agentMemory: db.collection("agents.memories")
  }
}

export async function setupEnv(db: Db, suggestedDay: number = 1, startDay: DateTime = DateTime.utc()) {
  const collections = getCollections(db);

  await collections.swarmConfig.insertOne({
    clientId: "fe680915-79d1-52f2-8eb6-df35692e0d8e",
    registeredSkus: ["sku1", "sku2"],
    suggestedDay: suggestedDay,
    minimumItemsToReview: 3,
    suggestionToleranceDays: 2
  });

  await collections.skus.insertMany([
    {sku: "sku1", name: "sku1"},
    {sku: "sku2", name: "sku2"},
  ]);

  await collections.shoppingEvents.insertMany([
    eventWithMultipleItemsGenerator(["sku1", "sku2"], [10, 16], startDay.minus({days: 14})),
    eventWithMultipleItemsGenerator(["sku1", "sku2"], [12, 17], startDay.minus({days: 21})),
  ]);
}

export async function teardownEnv(db: Db) {
  const collections = getCollections(db);

  await collections.swarmConfig.deleteMany({});
  await collections.skus.deleteMany({});
  await collections.agentMemory.deleteMany({});
  await collections.shoppingEvents.deleteMany({});
}

export function docEmmetBrown(date: DateTime) {
  Settings.now = () => date.toMillis();
}

export async function addEvent(db: Db, skus: string[], qtys: number[], date: DateTime) {
  const collections = getCollections(db);
  await collections.shoppingEvents.insertOne(eventWithMultipleItemsGenerator(skus, qtys, date));
}

export async function getSuggestions(db: Db) {
  const {shoppingEvents} = getCollections(db);
  return shoppingEvents.find({}).toArray();
}

export async function getMemories(db: Db) {
  const {agentMemory} = getCollections(db);
  return agentMemory.find({}).toArray();
}