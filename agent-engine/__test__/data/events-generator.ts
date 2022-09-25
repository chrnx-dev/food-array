import {v4} from "uuid";
import {DateTime} from "luxon";

export function eventGenerator(sku: string, qty: number, dayBefore: number = 0, isSuggested: boolean = false): any {
  return {
    _id: v4(),
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