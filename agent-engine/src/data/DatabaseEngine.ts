import { connect } from 'mongoose';

const MODEL_IMPORTS: string[] = [
  "@database/models/Sku",
];

export default class DatabaseEngine {
  static async initialize() {
    const connection = await connect(process.env.MONGODB_URI as string);
    for (const model of MODEL_IMPORTS) {
      await require(model);
    }
    return connection;
  }
}
