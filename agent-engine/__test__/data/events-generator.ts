import {v4} from "uuid";
import {DateTime} from "luxon";
import {ShoppingEventInterface, ShoppingEventItem} from "@database/schemas/ShoppingEventSchema";

export function eventGenerator(sku: string, qty: number, dayBefore: number = 0, isSuggested: boolean = false): any {
  return {
    date: DateTime.utc().minus({days: dayBefore}).toJSDate(),
    items: [{ sku, quantity: qty, name: "test" }],
    isSuggested
  }
}

export function eventsGenerator(sku: string, qtys: number[], events: number[]): any[] {

  if (qtys.length !== events.length) {
    throw new Error("Length of qtys and events must be the same");
  }

  const eventsList: any[] = [];
  for (let i = 0; i < qtys.length; i++) {
    const qty = qtys[i];
    const event = events[i];

    eventsList.push(eventGenerator(sku, qty, event));
  }


  return eventsList;
}

export function eventWithMultipleItemsGenerator(skus: string[], qtys: number[], date: DateTime, isSuggested: boolean = false): ShoppingEventInterface {

  if (qtys.length !== skus.length) {
    throw new Error("Length of qtys and events must be the same");
  }

  const event = {
    date: date.toJSDate(),
    items: [],
    isSuggested
  } as ShoppingEventInterface

  for (let i = 0; i < qtys.length; i++) {
    const qty: number = qtys[i];
    const sku: string = skus[i];

    event.items.push({ sku, quantity: qty, name: "test" } as ShoppingEventItem);
  }

  return event;
}