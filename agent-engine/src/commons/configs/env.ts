import { v5 as uuid5 } from "uuid";

const CLIENT_GENERATOR_KEY = process.env.CLIENT_GENERATOR_KEY || "4e0603b3-e71c-4685-bffb-290bce338a86";
const SWARM_CLIENT_ID = process.env.SWARM_CLIENT_ID || "fe680915-79d1-52f2-8eb6-df35692e0d8e";

export { SWARM_CLIENT_ID, CLIENT_GENERATOR_KEY };