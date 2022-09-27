import 'reflect-metadata';
import Agent from "@classes/Agent";
import {eventGenerator, eventsGenerator} from "../data/events-generator";
// @ts-ignore
import * as mockingoose from "mockingoose";

import AgentMemoryModel from "@database/models/AgentMemory";
import ShoppingEventModel from "@database/models/ShoppingEventModel";
import ShoppingEventService from "@src/services/ShoppingEventService";

import {DateTime} from "luxon";
import {AgentActions} from "@commons/enums/agent-actions";
import DatabaseEngine from "@database/DatabaseEngine";
import {addEvent, setupEnv, teardownEnv} from "../data/setup-env";


describe("Agent", () => {
  let db: any;
  beforeEach(async () => {
    db = await DatabaseEngine.initialize();
    await setupEnv(DateTime.now().weekday);
    jest.setTimeout(50000);
  });

  afterEach(async () => {
    await teardownEnv();
    await db.disconnect();
  });

  it("should be able to create an instance", async () => {
    const agent = new Agent("sku", {});
    expect(agent).toBeDefined();
  });

  it("should be able to INITIALIZE", async () => {

    await addEvent( ["sku1", "sku2"], [8,9], DateTime.now().startOf("day").toUTC());

    const agent = new Agent("sku1", {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2
    });

    const result = await agent.execute();

    expect(result[0].sku).toBe("sku1");
    expect(result[0].initialized).toBeFalsy();
    expect(result[0].expectedQty).not.toBeDefined();
    expect(result[0].periodicityDays).not.toBeDefined();
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.INITIALIZE);
  });


  it("should be able INITIALIZE and REVIEW", async () => {

    await Promise.all([
        addEvent( ["sku1"], [3], DateTime.now().startOf("day").toUTC()),
        addEvent( ["sku1"], [5], DateTime.now().minus({days: 8}).startOf("day").toUTC()),
    ]);

    const agent = new Agent("sku1", {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2
    });

    const result = await agent.execute();

    expect(result[0].sku).toBe("sku1");
    expect(result[0].initialized).toBeFalsy();
    expect(result[0].expectedQty).toBe(3);
    expect(result[0].periodicityDays).toBe(8);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.INITIALIZE);
  });


  it("should be able INITIALIZE and marked ready to suggest", async () => {
    await Promise.all([
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 2}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 7}).startOf("day").toUTC()),
    ]);

    const agent = new Agent("sku1", {
      minimumEventsToReview: 2,
      suggestedToleranceDays: 2
    });


    const result = await agent.execute();

    expect(result[0].sku).toBe("sku1");
    expect(result[0].initialized).toBeTruthy();
    expect(result[0].expectedQty).toBe(3);
    expect(result[0].periodicityDays).toBe(5);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.INITIALIZE);
  });

  it('should be able REVIEW', async () => {
    AgentMemoryModel.create({
      initialized: false,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 28 }).toJSDate(),
      expectedQty: 3,
      periodicityDays: 5
    });

    await Promise.all([
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);

    const agent = new Agent('sku1', {
      minimumEventsToReview: 5,
      suggestedToleranceDays: 2
    });

    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeFalsy();
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(7);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.REVIEW);
  });

  it('should be able REVIEW and marked ready to suggest', async () => {
    await AgentMemoryModel.create({
      initialized: false,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 28 }).toJSDate(),
      expectedQty: 3,
      periodicityDays: 5
    });

    await Promise.all([
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);


    const agent = new Agent('sku1', {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2
    });

    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeTruthy();
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(7);
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.REVIEW);
  });

  it('should be able HOLD when nothint to REVIEW', async () => {
    await AgentMemoryModel.create({
      initialized: false,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 14 }).toJSDate(),
      expectedQty: 7,
      periodicityDays: 7
    });

    await Promise.all([
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);


    const agent = new Agent('sku1', {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2
    });

    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeFalsy();
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.HOLD);
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(7);
  });

  it('should be able SUGGEST', async () => {

    await AgentMemoryModel.create({
      initialized: true,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 7 }).toJSDate(),
      expectedQty: 7,
      periodicityDays: 7
    });

    await Promise.all([
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);

    const agent = new Agent('sku1', {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2,
      suggestedWeekDayPreference: DateTime.local().weekday
    });


    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeTruthy();
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(8);
    expect(result[1]).toMatchObject({sku: 'sku1', quantity: 7});
    expect(result[2]).toBe(AgentActions.SUGGEST);
  });


  it('should be able SUGGEST if not active suggestion', async () => {
    await AgentMemoryModel.create({
      initialized: true,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 7 }).toJSDate(),
      expectedQty: 7,
      periodicityDays: 7
    });

    await Promise.all([
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);

    const agent = new Agent('sku1', {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2,
      suggestedWeekDayPreference: DateTime.local().weekday
    });


    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeTruthy();
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(8);
    expect(result[1]).toMatchObject({sku: 'sku1', quantity: 7});
    expect(result[2]).toBe(AgentActions.SUGGEST);
  });

  it('should not be SUGGEST if suggestion is still active', async () => {
    await AgentMemoryModel.create({
      initialized: true,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 0 }).toJSDate(),
      expectedQty: 7,
      periodicityDays: 7
    });

    await Promise.all([
      addEvent( ["sku1"], [7], DateTime.now().minus({ days: 3}).startOf("day").toUTC(), true),
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);

    const agent = new Agent('sku1', {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2,
      suggestedWeekDayPreference: DateTime.local().weekday
    });

    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeTruthy();
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.HOLD);
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(7);
  });


  it('should be able to ADJUST', async () => {
    await AgentMemoryModel.create({
      initialized: true,
      sku: 'sku1',
      lastEvent: DateTime.local().minus({ days: 0 }).toJSDate(),
      expectedQty: 7,
      periodicityDays: 7
    });

    await Promise.all([
      addEvent( ["sku1"], [7], DateTime.now().minus({ days: 0}).startOf("day").toUTC()),
      addEvent( ["sku1"], [3], DateTime.now().minus({ days: 14}).startOf("day").toUTC()),
      addEvent( ["sku1"], [8], DateTime.now().minus({days: 21}).startOf("day").toUTC()),
      addEvent( ["sku1"], [7], DateTime.now().minus({days: 28}).startOf("day").toUTC()),
      addEvent( ["sku1"], [5], DateTime.now().minus({days: 35}).startOf("day").toUTC()),
    ]);

    const agent = new Agent('sku1', {
      minimumEventsToReview: 4,
      suggestedToleranceDays: 2,
      suggestedWeekDayPreference: DateTime.local().weekday
    });


    const result = await agent.execute();

    expect(result[0].sku).toBe('sku1');
    expect(result[0].initialized).toBeTruthy();
    expect(result[1]).toBe(null);
    expect(result[2]).toBe(AgentActions.ADJUST);
    expect(result[0].expectedQty).toBe(7);
    expect(result[0].periodicityDays).toBe(7);
  });
});