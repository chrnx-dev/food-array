import { ShoppingEventInterface, ShoppingEventSchema } from '@database/schemas/ShoppingEventSchema';
import { model } from 'mongoose';

const ShoppingEventModel = model<ShoppingEventInterface>('ShoppingEvent', ShoppingEventSchema);
export default ShoppingEventModel;
