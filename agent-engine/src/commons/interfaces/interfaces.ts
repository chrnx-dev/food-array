import { DateTime } from "luxon";

export interface NormalizedEvent {
    date: DateTime;
    sku: string;
    qty: number;
    price: number;
    events: number;
}

export interface EnvironmentState {
    today: DateTime;
    startOfWeek: DateTime;
    endOfWeek: DateTime;
    history: NormalizedEvent[];
    currentEvent: NormalizedEvent[];
}