import { DateTime } from 'luxon';

export default abstract class EnvironmentContract {
  async perceive(sku: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async getState(date: DateTime, sku: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async react(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
