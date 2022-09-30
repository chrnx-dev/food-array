import "reflect-metadata";
import {MongoClient, Db} from "mongodb";
import {addEvent, docEmmetBrown, setupEnv, teardownEnv} from "../data/setup-env";
import SwarmAgents from "@classes/SwarmAgent";
import DatabaseEngine from "@database/DatabaseEngine";
import {AgentActions} from "@commons/enums/agent-actions";
import {DateTime, Settings} from "luxon";

jest.setTimeout(30000);
describe("Swarm Agents", () => {
  let db: any;

  beforeEach(async () => {
    // @ts-ignore
    db = await DatabaseEngine.initialize();
    await setupEnv(DateTime.now().weekday);
  });

  afterEach(async () => {
    await teardownEnv();
    await db.disconnect();
  });

  it("should initialize", () => {
    const swarm = new SwarmAgents();
    expect(swarm).toBeDefined();
  });

  it("should run", async () => {
    const today = DateTime.now();
    const swarm = new SwarmAgents();

    await addEvent( ["sku1", "sku2"], [8,9], today.startOf("day").toUTC());

    let results = await swarm.run();

    expect(results).toBeDefined();
    expect(swarm).toBeDefined();
    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.INITIALIZE);
    expect(results[1][0]).toBe(AgentActions.INITIALIZE);


    let next = today.plus({days: 7});
    docEmmetBrown(next);
    await addEvent( ["sku1", "sku2"], [8,9], next.startOf("day"));


    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.REVIEW);
    expect(results[1][0]).toBe(AgentActions.REVIEW);

    next = next.plus({days: 7});
    docEmmetBrown(next);
    await addEvent( ["sku1", "sku2"], [8,9], next.startOf("day"));


    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.REVIEW);
    expect(results[1][0]).toBe(AgentActions.REVIEW);

    next = next.plus({days: 7});
    docEmmetBrown(next);

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.SUGGEST);
    expect(results[1][0]).toBe(AgentActions.SUGGEST);
    expect(results[0][1]).toMatchObject({sku: "sku1", quantity: 8});
    expect(results[1][1]).toMatchObject({sku: "sku2", quantity: 9});

    await addEvent( ["sku1", "sku2"], [8,9], next.plus({days: 2}).startOf("day"));


    next = next.plus({days: 7});
    docEmmetBrown(next);

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.SUGGEST);
    expect(results[1][0]).toBe(AgentActions.SUGGEST);
    expect(results[0][1]).toMatchObject({sku: "sku1", quantity: 8});
    expect(results[1][1]).toMatchObject({sku: "sku2", quantity: 9});


    next = next.plus({days: 2});
    docEmmetBrown(next);

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);


    next = next.plus({days: 5});
    await addEvent( ["sku1", "sku2"], [10, 12], next.startOf("day"));
    docEmmetBrown(next);

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.ADJUST);
    expect(results[1][0]).toBe(AgentActions.ADJUST);

    next = next.plus({days: 7});
    docEmmetBrown(next);

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.SUGGEST);
    expect(results[1][0]).toBe(AgentActions.SUGGEST);
    expect(results[0][1]).toMatchObject({sku: "sku1", quantity: 9});
    expect(results[1][1]).toMatchObject({sku: "sku2", quantity: 11});
  });
});