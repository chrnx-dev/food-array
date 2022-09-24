import {v4} from "uuid";
import {DateTime} from "luxon";

export function eventsGenerator(sku: string, qtys: number[], events: number[]): any[] {

  if (qtys.length !== events.length) {
    throw new Error("Length of qtys and events must be the same");
  }

  const eventsList: any[] = [];
  for (let i = 0; i < qtys.length; i++) {
    const qty = qtys[i];
    const event = events[i];

    eventsList.push({
      _id: v4(),
      date: DateTime.utc().minus({days: event}).toJSDate(),
      items: [
        {sku: sku, quantity: qty, name: "test"},
      ]
    });
  }


  return eventsList;
}