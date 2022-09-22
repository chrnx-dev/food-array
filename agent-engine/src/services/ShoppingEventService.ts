import ShoppingEventModel from '@database/models/ShoppingEventModel';
import { DateTime } from 'luxon';
import {ShoppingEventInterface} from "@database/schemas/ShoppingEventSchema";
import shoppingEventModel from "@database/models/ShoppingEventModel";
import sku from "@database/models/Sku";

export default class ShoppingEventService {
  async getShoppingEventsFromSku(sku: string, eventsHistory: number = 4): Promise<any[]> {
    return ShoppingEventModel.find({ 'items.sku': sku, isSuggested: false }).sort({ date: -1 }).limit(eventsHistory).lean();
  }

  async getShoppingEvent(date: DateTime, sku: string, isSuggested: boolean = false): Promise<ShoppingEventInterface[]> {
    return ShoppingEventModel.find({
      $and: [{ date: { $gte: date.startOf('day').toISO() } }, { date: { $lte: date.endOf('day').toISO() } }],
      isSuggested,
      "items.sku": sku,
    }).lean();
  }

  async getLatestEvent(sku: string, isSuggested: boolean = false): Promise<ShoppingEventInterface> {
    return ShoppingEventModel
      .findOne({
        'items.sku': sku,
        isSuggested
      })
      .sort({ date: -1})
      .lean();
  }

  async getLatestEvents(howMuch: number = 10, excludeSKUs: string[] = [], isSuggested: boolean = false): Promise<ShoppingEventInterface[]> {
    return shoppingEventModel
      .find({
        isSuggested,
        'items.sku': { $nin: excludeSKUs }
      })
      .sort({ date: -1})
      .limit(howMuch)
      .lean();
  }
}
