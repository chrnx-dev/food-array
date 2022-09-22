import {DateTime} from "luxon";

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

export interface SwarmPreferences {
  suggestedToleranceDays: number;
  suggestedWeekDayPreference: number;
  minimumEventsToReview: number;
}

export interface ActionArguments {
  shouldInitialize: boolean;
  currentEvents: NormalizedEvent[];
}

export interface Suggestion {
  qty: number;
}

export interface SwarmAgentSettings {
  sku: string;
  settings: SwarmPreferences;
}