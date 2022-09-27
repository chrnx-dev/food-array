import {Db} from "mongodb";
import {eventsGenerator, eventWithMultipleItemsGenerator} from "./events-generator";
import {DateTime, Settings} from "luxon";
import {error} from "winston";
import ShoppingEventModel  from "@database/models/ShoppingEventModel";
import AgentMemory from "@database/models/AgentMemory";
import SwarmConfigModel from "@database/models/SwarmConfig";
import SkuModel from "@database/models/Sku";

export async function setupEnv(suggestedDay: number = 1, startDay: DateTime = DateTime.utc()) {
  const swarmConfig = new SwarmConfigModel({
    clientId: "fe680915-79d1-52f2-8eb6-df35692e0d8e",
    registeredSkus: ["sku1", "sku2"],
    suggestedDay: suggestedDay,
    minimumItemsToReview: 3,
    suggestionToleranceDays: 2
  });

  await swarmConfig.save();
  const sku1= new SkuModel({sku: "sku1", name: "sku1"});
  const sku2= new SkuModel({sku: "sku2", name: "sku2"});

  await Promise.all([sku1.save(), sku2.save()]);
}

export async function teardownEnv() {
  await Promise.all([
    SwarmConfigModel.deleteMany({}),
    SkuModel.deleteMany({}),
    ShoppingEventModel.deleteMany({}),
    AgentMemory.deleteMany({})
  ]);
}

export function docEmmetBrown(date: DateTime) {
  Settings.now = () => date.toMillis();
}

export async function addEvent(skus: string[], qtys: number[], date: DateTime, isSuggested: boolean = false) {
  return ShoppingEventModel.create(eventWithMultipleItemsGenerator(skus, qtys, date, isSuggested));
}

export async function getSuggestions() {
  return ShoppingEventModel.find({}).sort({date: -1}).lean();
}

export async function getMemories() {
  return AgentMemory.find({}).sort({date: -1}).lean();
}