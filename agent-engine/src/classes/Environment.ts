import EnvironmentContract from '@contracts/Environments';
import { injectable } from 'inversify';
import { first, last } from 'lodash';
import { DateTime, Interval } from 'luxon';
import ShoppingEventService from 'src/services/ShoppingEventService';
import * as stats from 'simple-statistics';
import { EnvironmentState, NormalizedEvent } from 'src/commons/interfaces/interfaces';

@injectable()
export default class Environment extends EnvironmentContract {
  private readonly shoppingEventService: ShoppingEventService = new ShoppingEventService();

  async perceive(sku: string, history: number = 4): Promise<EnvironmentState> {
    const today = DateTime.now().endOf('day');
    const startOfWeek = today.startOf('week');

    const [shoppingEvents, todayEvents] = await Promise.all([
      this.shoppingEventService.getShoppingEventsFromSku(sku, history),
      this.shoppingEventService.getShoppingEvent(today.toUTC())
    ]);

    return {
      today,
      startOfWeek,
      endOfWeek: today.endOf('week'),
      history: this.eventsNormalizer(shoppingEvents.reverse(), sku),
      currentEvent: this.eventsNormalizer(todayEvents.reverse(), sku)
    } as EnvironmentState;
  }

  private getItemBySku(sku: string, shoppingDetails: any[]) {
    return shoppingDetails.find((item: { sku: string }) => item.sku === sku);
  }

  private eventsNormalizer(shoppingEvents: any[], sku: string): NormalizedEvent[] {
    const eventsAccumulator: any[] = [];
    const mergedEventsIndex: number[] = [];

    for (let index = 0; index < shoppingEvents.length; index++) {
      if (mergedEventsIndex.includes(index)) {
        continue;
      }

      const currentEvent = shoppingEvents[index];
      const currentEventDate = DateTime.fromJSDate(currentEvent.date);
      const period = Interval.fromDateTimes(currentEventDate.startOf('week'), currentEventDate.endOf('week'));

      const inSameWeek = shoppingEvents.filter((event: any, eventIndex: number) => {
        const eventDate = DateTime.fromJSDate(event.date);

        if (period.contains(eventDate)) {
          mergedEventsIndex.push(eventIndex);
          return true;
        }

        return false;
      });

      const item: NormalizedEvent = {
        date: DateTime.fromJSDate(last(inSameWeek).date),
        sku,
        qty: 0,
        price: 0,
        events: inSameWeek.length
      };

      for (const event of inSameWeek) {
        const eventItem = event.items.find((item: { sku: string }) => item.sku === sku);
        item.qty += eventItem.quantity || 0;
        item.price += eventItem.price || 0;
      }

      eventsAccumulator.push(item);
    }

    return eventsAccumulator;
  }


  async getLatestSuggestion(sku: string): Promise<any> {
    return this.shoppingEventService.getLatestEvent(sku, true);
  }

  async react(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
