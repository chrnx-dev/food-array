import 'reflect-metadata';
import Agent from "@classes/Agent";
import {eventsGenerator} from "../data/events-generator";
// @ts-ignore
import * as mockingoose from "mockingoose";

import AgentMemoryModel from "@database/models/AgentMemory";
import ShoppingEventModel from "@database/models/ShoppingEventModel";
import ShoppingEventService from "@src/services/ShoppingEventService";
import {DateTime} from "luxon";
import {AgentActions} from "@commons/enums/agent-actions";

jest.mock("@src/services/ShoppingEventService");
const mockedShoppingEventService: jest.MockedObjectDeep<typeof ShoppingEventService> = jest.mocked(ShoppingEventService);

describe("Agent", () => {
  beforeEach(() => {
    // @ts-ignore
    mockedShoppingEventService.mockClear();
  });
  it("should be able to create an instance", async () => {
    const agent = new Agent("sku", {});
    expect(agent).toBeDefined();
  });

  it("should be able initialize agent memory", async () => {
    mockingoose(AgentMemoryModel).toReturn(null, "save");
    mockingoose(ShoppingEventModel).toReturn([], "find");

    const agent = new Agent("1", {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2
    });

    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEventsFromSku").mockResolvedValueOnce(eventsGenerator("1", [3], [0]));
    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEvent").mockResolvedValueOnce([]);
    const result = await agent.execute();

    expect(result[0].sku).toBe("1");
    expect(result[0].initialized).toBeFalsy();
    expect(result[0].expectedQty).not.toBeDefined();
    expect(result[0].periodicityDays).not.toBeDefined();
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.INITIALIZE);
  });

  it("should be able initialize agent memory and review", async () => {
    mockingoose(AgentMemoryModel).toReturn(null, "save");
    mockingoose(ShoppingEventModel).toReturn([], "find");

    const agent = new Agent("1", {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2
    });

    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEventsFromSku").mockResolvedValueOnce(eventsGenerator("1", [3,5], [0,8]));
    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEvent").mockResolvedValueOnce([]);

    const result = await agent.execute();

    expect(result[0].sku).toBe("1");
    expect(result[0].initialized).toBeFalsy();
    expect(result[0].expectedQty).toBe(3);
    expect(result[0].periodicityDays).toBe(8);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.INITIALIZE);
  });

  it("should be able initialize agent memory and marked as initialized", async () => {
    mockingoose(AgentMemoryModel).toReturn(null, "findOne");
    mockingoose(ShoppingEventModel).toReturn([], "find");

    const agent = new Agent("1", {
      minimumEventsToReview: 2,
      suggestedToleranceDays: 2
    });

    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEventsFromSku").mockResolvedValueOnce(eventsGenerator("1", [3,8], [2,7]));
    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEvent").mockResolvedValueOnce([]);

    const result = await agent.execute();

    expect(result[0].sku).toBe("1");
    expect(result[0].initialized).toBeTruthy();
    expect(result[0].expectedQty).toBe(3);
    expect(result[0].periodicityDays).toBe(5);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.INITIALIZE);
  });

  it('should be able initialize agent review', async () => {
    mockingoose(AgentMemoryModel).toReturn(
      {
        initialized: false,
        _id: '632e2b992dfcf16668569048',
        sku: '1',
        lastEvent: DateTime.local().minus({ days: 28 }).toJSDate(),
        expectedQty: 3,
        periodicityDays: 5
      },
      'findOne'
    );
    mockingoose(ShoppingEventModel).toReturn([], 'find');

    const agent = new Agent('1', {
      minimumEventsToReview: 5,
      suggestedToleranceDays: 2
    });

    jest.spyOn(mockedShoppingEventService.mock.instances[0], 'getShoppingEventsFromSku').mockResolvedValueOnce(eventsGenerator('1', [3, 8, 7, 5], [14, 21, 28, 35]));
    jest.spyOn(mockedShoppingEventService.mock.instances[0], 'getShoppingEvent').mockResolvedValueOnce([]);

    const result = await agent.execute();

    expect(result[0].sku).toBe('1');
    expect(result[0].initialized).toBeFalsy();
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(7);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.REVIEW);
  });
});