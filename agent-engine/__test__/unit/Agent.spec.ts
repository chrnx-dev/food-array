import 'reflect-metadata';
import Agent from "@classes/Agent";
// @ts-ignore
import * as mockingoose from "mockingoose";

import AgentMemoryModel from "@database/models/AgentMemory";
import ShoppingEventModel from "@database/models/ShoppingEventModel";
import ShoppingEventService from "@src/services/ShoppingEventService";
import {DateTime} from "luxon";

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
    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEventsFromSku").mockResolvedValueOnce([
      {
        _id: "1",
        date: DateTime.utc().toJSDate(),
        items: [
          {sku: "1", quantity: 1, name: "manzana"},
        ]
      }/*,
      {
        _id: "2",
        date: DateTime.utc().minus({days: 13}).toJSDate(),
        items: [
          {sku: "1", quantity: 1, name: "manzana"},
        ]
      }*/
    ]);
    jest.spyOn(mockedShoppingEventService.mock.instances[0], "getShoppingEvent").mockResolvedValueOnce([]);
    const spy = jest.spyOn(agent, "execute");
    const result = await agent.execute();
    console.log(result);
    expect(spy).toHaveBeenCalled();
  });
});