import EnvironmentContract from '@contracts/Environments';
import { injectable } from 'inversify';
import {last, takeRightWhile, takeWhile} from 'lodash';
import { DateTime, Interval } from 'luxon';
import ShoppingEventService from '@src/services/ShoppingEventService';
import { EnvironmentState, NormalizedEvent } from '@src/commons/interfaces/interfaces';

@injectable()
export default class Environment extends EnvironmentContract {
  private readonly shoppingEventService: ShoppingEventService = new ShoppingEventService();

  async perceive(sku: string, history: number = 4): Promise<EnvironmentState> {
    const today = DateTime.now().endOf('day');
    const startOfWeek = today.startOf('week');

    const [shoppingEvents, todayEvents] = await Promise.all([
      this.shoppingEventService.getShoppingEventsFromSku(sku, history),
      this.shoppingEventService.getShoppingEvent(today, sku)
    ]);

    return {
      today,
      startOfWeek,
      endOfWeek: today.endOf('week'),
      history: this.eventsNormalizer(shoppingEvents.reverse(), sku),
      currentEvent: this.eventsNormalizer(todayEvents.reverse(), sku)
    } as EnvironmentState;
  }


  private eventsNormalizer(shoppingEvents: any[], sku: string): NormalizedEvent[] {
    if (!shoppingEvents.length) {
      return [];
    }

    const eventsAccumulator: NormalizedEvent[] = [];
    let [nextEvent, ...restEvents] = shoppingEvents;

    do {
      const nextEventDate = DateTime.fromJSDate(nextEvent.date);
      const week = Interval.fromDateTimes(nextEventDate.startOf('week'), nextEventDate.endOf('week'));
      const eventInSameWeek = takeWhile(restEvents, (event) => week.contains(event.date));
      const eventItem = nextEvent.items.find((item: { sku: string }) => item.sku === sku);
      const sumQuantity =  eventInSameWeek.reduce((acc, event) => {
        const item = event.items.find((item: { sku: string }) => item.sku === sku);
        return acc + item.quantity;
      }, 0);

      eventsAccumulator.push({
        date: nextEventDate,
        sku,
        qty: eventItem.quantity || sumQuantity,
        price: eventItem.price || 0,
        events: eventInSameWeek.length + 1
      });

      nextEvent = restEvents.shift();
    } while (nextEvent);

    return eventsAccumulator;
  }


  async getLatestSuggestion(sku: string): Promise<any> {
    return this.shoppingEventService.getLatestEvent(sku, true);
  }

  async react(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
