import { Schema } from 'mongoose';

export interface ShoppingEventItem {
  sku: string;
  name: string;
  price?: number;
  quantity: number;
}

export interface ShoppingEventInterface {
  date: Date;
  items: ShoppingEventItem[];
  isSuggested: boolean;
}

export const ShoppingEventSchema = new Schema<ShoppingEventInterface>({
  date: Date,
  items: [
    {
      sku: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  isSuggested: { type: Boolean, default: true}
});
