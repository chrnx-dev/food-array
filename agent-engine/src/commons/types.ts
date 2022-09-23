import {AgentActions} from "@commons/enums/agent-actions";
import {ShoppingEventItem} from "@database/schemas/ShoppingEventSchema";

export type WorkerResponse = [AgentActions, ShoppingEventItem];
export type WorkerResponseError = ["ERROR", string];