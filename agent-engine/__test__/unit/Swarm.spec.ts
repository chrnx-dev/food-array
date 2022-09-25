import 'reflect-metadata';
import SwarmAgents from "@classes/SwarmAgent";

describe('Swarm Agents', () => {
  it('should initialize', () => {
    const swarm = new SwarmAgents();
    expect(swarm).toBeDefined();
  });
});