import EnvironmentContract from "@contracts/Environments";
import { injectable } from "inversify";
import { first, last } from "lodash";
import { DateTime, Interval } from "luxon";
import ShoppingEventService from "src/services/ShoppingEventService";
import * as stats from "simple-statistics";

@injectable()
export default class Environment extends EnvironmentContract {
  private readonly shoppingEventService: ShoppingEventService = new ShoppingEventService();

  async perceive(sku: string, history: number = 4): Promise<any> {
    const today = DateTime.now().endOf("day");
    const startOfWeek = today.startOf("week");

    const [shoppingEvents, todayEvents] = await Promise.all([
      this.shoppingEventService.getShoppingEventsFromSku(sku, history),
      this.shoppingEventService.getShoppingEvent(today)
    ]);
  
    return {
      today,
      startOfWeek,
      endOfWeek: today.endOf("week"),
      history: this.eventsNormalizer(shoppingEvents.reverse(), sku),
      currentEvent: this.eventsNormalizer(todayEvents, sku)
    }
  }

  private getItemBySku(sku: string, shoppingDetails: any[]) {
    return shoppingDetails.find((item: { sku: string }) => item.sku === sku);
  }

  private eventsNormalizer(shoppingEvents: any[], sku: string) {
    const eventsAccumulator: any[] = [];
    const mergedEventsIndex: number[] = [];

    for(let index=0; index <  shoppingEvents.length; index++) {
      if (mergedEventsIndex.includes(index)) {
        continue;
      }

      const currentEvent = shoppingEvents[index];
      const currentEventDate = DateTime.fromJSDate(currentEvent.date);
      const period = Interval.fromDateTimes(currentEventDate.startOf("week"), currentEventDate.endOf("week"));

      const inSameWeek = shoppingEvents.filter((event: any, eventIndex: number) => {
        const eventDate = DateTime.fromJSDate(event.date);
        
        if (period.contains(eventDate)) {
          mergedEventsIndex.push(eventIndex);
          return true;
        }

        return false;
      });

      const item = {
        date: DateTime.fromJSDate(last(inSameWeek).date),
        sku,
        qty: 0,
        price: 0,
        events: inSameWeek.length,
      };

      for (const event of inSameWeek) {
        const eventItem = event.items.find((item: { sku: string; }) => item.sku === sku);
        item.qty += eventItem.qty;
        item.price += eventItem.price || 0;
      }

      eventsAccumulator.push(item);
    }

    return eventsAccumulator;
  }
  async getState(date: DateTime, sku: string): Promise<any> {
    const shoppingEvents =
      await this.shoppingEventService.getShoppingEventsFromSku(sku, 10);

    if (!shoppingEvents?.length) {
      return null;
    }

    const initEvent = last(shoppingEvents);
    const lastEvent = first(shoppingEvents);

    console.log(await this.shoppingEventService.getShoppingEvent(DateTime.fromJSDate(initEvent.date)));

    const reversedEvents = shoppingEvents.reverse();

    const eventsAccumulator = [];

    for (let index = 1; index <= reversedEvents.length - 1; index++) {
      const currentEvent = reversedEvents[index];
      const pastEvent = reversedEvents[index - 1];

      const currentItem = this.getItemBySku(sku, currentEvent.items);
      const pastItem = this.getItemBySku(sku, pastEvent.items);

      const currentEventDate = DateTime.fromJSDate(currentEvent.date);
      const pastEventDate = DateTime.fromJSDate(pastEvent.date);

      eventsAccumulator.push({
        diffDays: currentEventDate.diff(pastEventDate, "days").days,
        purchasedItems: currentItem.qty,
        differenceItems: currentItem.qty - pastItem.qty,
      });
    }

    const diffDaysData = eventsAccumulator.map((e) => e.diffDays);
    const purchasedItems = eventsAccumulator.map((p) => p.purchasedItems);

    console.log({
      data: diffDaysData,
      mean: stats.mean(diffDaysData),
      median: stats.medianSorted(diffDaysData),
      mode: stats.mode(diffDaysData),
      harmonicMean: stats.harmonicMean(diffDaysData),
      skewness: stats.sampleSkewness(diffDaysData),
    });

    console.log({
      data: purchasedItems,
      mean: stats.mean(purchasedItems),
      median: stats.medianSorted(purchasedItems),
      mode: stats.mode(purchasedItems),
      harmonicMean: stats.harmonicMean(purchasedItems),
      skewness: stats.sampleSkewness(purchasedItems),
    });

    /*
        for (const shoppingIndex of shoppingEvents.reverse()) {
            if (shoppingIndex === 0) {
                continue;
            }

            const shoppingEventDate = DateTime.fromJSDate(shoppingEvents.date);
            const shoppingEventItem = shoppingEvent.items.find((item: { sku: string; }) => item.sku === sku);

            console.log(shoppingEventItem, shoppingEventDate.toString(), date.toString());
        }
        */

    const startPeriod = DateTime.fromJSDate(initEvent.date).startOf("week");
    const period = Interval.fromDateTimes(startPeriod, date);

    console.log(
      startPeriod.toString(),
      date.toString(),
      date.diff(startPeriod, "weeks").weeks
    );

    const state = {
      period: period.length("days"),
      sku,
      lastShoppingEvent: lastEvent.date,
      firstShoppingEvent: initEvent.date,
    } as any;
  }
  async react(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
