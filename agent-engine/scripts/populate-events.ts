import DatabaseEngine from "@database/DatabaseEngine";
import {ShoppingEventInterface, ShoppingEventItem} from "@database/schemas/ShoppingEventSchema";
import ShoppingEventModel from "@database/models/ShoppingEventModel";
import {DateTime} from "luxon";
import {sampleSize, shuffle} from "lodash";
import { randomInt } from "crypto";

main();

async function main() {
  const db = await DatabaseEngine.initialize();

  const daysBack: number[] = [7, 11, 14, 18, 21, 28, 32, 39, 44];
  const MAX_SAMPLES = 6;
  const today = DateTime.now().set({hour: 18, minute: 0, second: 0, millisecond: 0});


  const products: [Partial<ShoppingEventItem>, [number, number]][] = [
    [{ sku: "1", name: "Manzana"}, [6,10]],
    [{ sku: "2", name: "Pera"}, [7,12]],
    [{ sku: "3", name: "Platano"}, [3,10]],
    [{ sku: "4", name: "Sandia"}, [1,2]],
    [{ sku: "5", name: "Durazno"}, [5,10]],
    [{ sku: "6", name: "Uvas"}, [1,3]],
    [{ sku: "7", name: "Chile"}, [6,15]],
    [{ sku: "8", name: "Sal"}, [1, 5]],
    [{ sku: "9", name: "Pimienta"}, [1,3]],
    [{ sku: "10", name: "Azucar"}, [2,7]],
    [{ sku: "11", name: "Cebolla"}, [1,3]],//Adicion de ejemplos para comprobar funcionamiento
    [{ sku: "12", name: "Patatas"}, [2,7]]
  ];

  await ShoppingEventModel.deleteMany({});
  const shoppingEvents: ShoppingEventInterface[] = [];

  for (const days of daysBack) {
    const currentEvent = today.minus({days});
    const shoppingEvent: ShoppingEventInterface = {
      date: currentEvent.toUTC().toJSDate(),
      items: [],
      isSuggested: false
    }

    for (const itemSample of sampleSize(shuffle(products), MAX_SAMPLES)) {
      const [item, randomSetting] = itemSample;
      shoppingEvent.items.push({ ...item, quantity: randomInt(randomSetting[0], randomSetting[1]) } as ShoppingEventItem);
    }
    shoppingEvents.push(shoppingEvent);
  }

  await ShoppingEventModel.insertMany(shoppingEvents);
  db.disconnect();
}