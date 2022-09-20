import { model } from 'mongoose';
import {SkuSchema, SkuSchemaInterface} from "@database/schemas/SkuSchema";

const SkuModel = model<SkuSchemaInterface>('sku', SkuSchema);
export default SkuModel;