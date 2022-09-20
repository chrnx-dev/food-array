import {Schema} from "mongoose";

export interface SkuSchemaInterface {
  sku: string;
  name: string;
}

export const SkuSchema = new Schema<SkuSchemaInterface>({
  sku: {type: String, unique: true},
  name: String
})