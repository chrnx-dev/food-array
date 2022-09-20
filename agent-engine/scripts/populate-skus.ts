import DatabaseEngine from "@database/DatabaseEngine";
import SkuModel from "@database/models/Sku";
import {SkuSchemaInterface} from "@database/schemas/SkuSchema";

main();

async function main() {
  const db = await DatabaseEngine.initialize();

  const products: SkuSchemaInterface[] = [
    {sku: "1", name: "Manzana"},
    {sku: "2", name: "Pera"},
    {sku: "3", name: "Platano"},
    {sku: "4", name: "Sandia"},
    {sku: "5", name: "Durazno"},
    {sku: "6", name: "Uvas"},
    {sku: "7", name: "Chile"},
    {sku: "8", name: "Sal"},
    {sku: "9", name: "Pimienta"},
    {sku: "10", name: "Azucar"}
  ];

  await SkuModel.deleteMany({});
  await SkuModel.insertMany(products);

  db.disconnect();
}