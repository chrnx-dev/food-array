import ShoppingEventModel from '@database/models/ShoppingEventModel';
import { DateTime } from 'luxon';

export default class ShoppingEventService {
  async getShoppingEventsFromSku(sku: string, eventsHistory: number = 4): Promise<any[]> {
    return ShoppingEventModel.find({ 'items.sku': sku }).sort({ date: -1 }).limit(eventsHistory).lean();
  }

  async getShoppingEvent(date: DateTime) {
    return ShoppingEventModel.find({
      $and: [{ date: { $gte: date.startOf('day').toISO() } }, { date: { $lte: date.endOf('day').toISO() } }]
    }).lean();
  }
}
