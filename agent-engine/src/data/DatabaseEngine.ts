import { connect } from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || process.env.MONGODB_URI;
const MODEL_IMPORTS: string[] = [
  "@database/models/Sku",
];

export default class DatabaseEngine {
  static async initialize() {
    const connection = await connect(MONGO_URL as string);
    for (const model of MODEL_IMPORTS) {
      await require(model);
    }
    return connection;
  }
}
