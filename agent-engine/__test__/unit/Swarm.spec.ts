import "reflect-metadata";
import {MongoClient, Db} from "mongodb";
import {addEvent, docEmmetBrown, getMemories, getSuggestions, setupEnv, teardownEnv} from "../data/setup-env";
import SwarmAgents from "@classes/SwarmAgent";
import DatabaseEngine from "@database/DatabaseEngine";
import {AgentActions} from "@commons/enums/agent-actions";
import {DateTime, Settings} from "luxon";

jest.setTimeout(30000);
describe("Swarm Agents", () => {
  let connection: MongoClient;
  let db: Db;

  beforeEach(async () => {
    // @ts-ignore
    connection = await MongoClient.connect(process.env.MONGO_URL);
    db = await connection.db();
    await setupEnv(db, DateTime.local().weekday, DateTime.utc());
    await DatabaseEngine.initialize();
  });

  afterEach(async () => {
    await teardownEnv(db);
    await connection.close();
  });

  it("should initialize", () => {
    const swarm = new SwarmAgents();
    expect(swarm).toBeDefined();
  });

  it("should run", async () => {
    const today = DateTime.now();
    console.log(today.toISODate());
    const swarm = new SwarmAgents();
    let results = await swarm.run();
    let current = today.minus({days: 7});
    let next= today.endOf("day");

    expect(results).toBeDefined();

    await addEvent(db, ["sku1", "sku2"], [8,9], current.toUTC().startOf("day"));

    expect(swarm).toBeDefined();
    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.INITIALIZE);
    expect(results[1][0]).toBe(AgentActions.INITIALIZE);

    console.log('>--------',await getSuggestions(db), '---------<');
    console.log('>--------',await getMemories(db), '---------<');

    next = next.plus({days: 7});
    current = next.minus({days: 7});

    docEmmetBrown(next);
    await addEvent(db, ["sku1", "sku2"], [8,9], current.startOf("day"));

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.REVIEW);
    expect(results[1][0]).toBe(AgentActions.REVIEW);


    next = next.plus({days: 7});
    current = next.minus({days: 7});

    docEmmetBrown(next);
    await addEvent(db, ["sku1", "sku2"], [8,9], current.startOf("day"));

    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.SUGGEST);
    expect(results[1][0]).toBe(AgentActions.SUGGEST);
    expect(results[0][1]).toMatchObject({sku: "sku1", quantity: 8});
    expect(results[1][1]).toMatchObject({sku: "sku2", quantity: 9});

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);

    next = next.plus({days: 1});
    docEmmetBrown(next);
    results = await swarm.run();

    expect(results?.length).toBe(2);
    expect(results[0][0]).toBe(AgentActions.HOLD);
    expect(results[1][0]).toBe(AgentActions.HOLD);
  });
});