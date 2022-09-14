import { AgentMemoryInterface } from "@database/schemas/AgentMemory";
import { EnvironmentState } from "@commons/interfaces/interfaces";

export default abstract class AgentContract {
  async percept(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async reaction(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  async rationale(state: EnvironmentState, memory: AgentMemoryInterface): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
