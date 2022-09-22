const path = require('path');
const { workerData } = require('worker_threads');
require('dotenv').config();
require('tsconfig-paths').register();
require('ts-node').register({ transpileOnly: true });
require(path.resolve(__dirname, workerData.path));