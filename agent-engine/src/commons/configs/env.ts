import { v5 as uuid5 } from "uuid";

const CLIENT_GENERATOR_KEY = process.env.CLIENT_GENERATOR_KEY || "SWARM_DEFAULT_KEY";
const SWARM_CLIENT_ID = process.env.SWARM_CLIENT_ID || uuid5("swarm", CLIENT_GENERATOR_KEY);

export { SWARM_CLIENT_ID, CLIENT_GENERATOR_KEY };