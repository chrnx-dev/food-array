import ShoppingEventModel from '@database/models/ShoppingEventModel';
import { DateTime } from 'luxon';
import {ShoppingEventInterface} from "@database/schemas/ShoppingEventSchema";
import shoppingEventModel from "@database/models/ShoppingEventModel";

export default class ShoppingEventService {
  async getShoppingEventsFromSku(sku: string, eventsHistory: number = 4): Promise<any[]> {
    return ShoppingEventModel.find({ 'items.sku': sku, isSuggested: false }).sort({ date: -1 }).limit(eventsHistory).lean();
  }

  async getShoppingEvent(date: DateTime) {
    return ShoppingEventModel.find({
      $and: [{ date: { $gte: date.startOf('day').toISO() } }, { date: { $lte: date.endOf('day').toISO() } }],
      isSuggested: false
    }).lean();
  }

  async getLatestEvent(): Promise<ShoppingEventInterface> {
    return ShoppingEventModel
      .findOne()
      .sort({ date: -1})
      .lean();
  }

  async getLatestEvents(howMuch: number = 10): Promise<ShoppingEventInterface[]> {
    return shoppingEventModel
      .find({
        isSuggested: false
      })
      .sort({ date: -1})
      .limit(howMuch)
      .lean();
  }
}
